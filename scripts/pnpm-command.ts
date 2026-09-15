import {
  spawn,
  spawnSync,
  type ChildProcess,
  type SpawnOptions,
  type SpawnSyncOptions,
} from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

export const PINNED_PNPM_VERSION = "10.6.0";
const PINNED_PNPM_PACKAGE = "pnpm";
const PINNED_PNPM_BIN = "bin/pnpm.cjs";

export type PnpmSpawnSpec = {
  command: string;
  args: string[];
};

export type PnpmResolutionOptions = {
  /** Platform used for the finite Corepack cache layout. */
  platform?: NodeJS.Platform;
  /** The already running Node executable. Defaults to process.execPath. */
  nodeExecutable?: string;
  /** OS-account home returned by the caller's account-information API. */
  accountHome?: string;
};

type PnpmPackageManifest = {
  name?: unknown;
  version?: unknown;
  bin?: unknown;
};

const HOSTILE_ENV_NAMES = new Set([
  "comspec",
  "pnpm_home",
  "npm_execpath",
  "npm_node_execpath",
  "corepack_home",
  "npm_config_prefix",
  "node_options",
  "node_path",
  "npm_config_node_options",
  "npm_config_script_shell",
  "npm_config_shell",
  "shell",
  "bash_env",
  "env",
  "home",
  "userprofile",
  "appdata",
  "localappdata",
  "xdg_config_home",
  "paper_slate_test_import",
]);

// npm/pnpm accepts both underscore and hyphen spellings after the
// npm_config_ prefix. Compare the separator-free setting name so an
// environment caller cannot reintroduce a blocked setting with an alias.
const BLOCKED_PNPM_SETTINGS = new Set([
  "scriptshell",
  "nodeoptions",
  "shellemulator",
  "userconfig",
  "globalconfig",
  "config",
  "prefix",
  "initmodule",
  "onloadscript",
]);

function normalizedEnvKey(key: string) {
  return key.toLowerCase().replace(/-/g, "_");
}

function isBlockedPnpmConfigKey(key: string) {
  const normalized = normalizedEnvKey(key);
  if (!normalized.startsWith("npm_config_")) return false;
  const setting = normalized.slice("npm_config_".length).replace(/_/g, "");
  return BLOCKED_PNPM_SETTINGS.has(setting);
}

function platformOf(options?: PnpmResolutionOptions) {
  return options?.platform ?? process.platform;
}

function absolutePath(value: string, label: string) {
  if (!path.isAbsolute(value)) throw new Error(`${label} must be an absolute path`);
  return path.resolve(value);
}

function canonicalFile(value: string, label: string) {
  const candidate = absolutePath(value, label);
  let stat: fs.Stats;
  try {
    stat = fs.lstatSync(candidate);
  } catch {
    throw new Error(`${label} is missing: ${candidate}`);
  }
  if (!stat.isFile()) throw new Error(`${label} is not a regular file: ${candidate}`);
  try {
    return fs.realpathSync.native(candidate);
  } catch {
    throw new Error(`${label} could not be canonicalized: ${candidate}`);
  }
}

function pathKey(value: string, platform: NodeJS.Platform) {
  const resolved = path.resolve(value);
  return platform === "win32" ? resolved.toLocaleLowerCase("en-US") : resolved;
}

function isContained(root: string, candidate: string, platform: NodeJS.Platform) {
  const rootKey = pathKey(root, platform);
  const candidateKey = pathKey(candidate, platform);
  if (rootKey === candidateKey) return true;
  const relative = path.relative(rootKey, candidateKey);
  return relative !== ".." && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative);
}

function canonicalContained(
  root: string,
  candidate: string,
  platform: NodeJS.Platform,
  label: string,
) {
  const canonicalRoot = fs.realpathSync.native(root);
  const canonicalCandidate = fs.realpathSync.native(candidate);
  if (!isContained(canonicalRoot, canonicalCandidate, platform))
    throw new Error(`${label} resolves outside its trusted root`);
  return canonicalCandidate;
}

function trustedAccountHome() {
  let home: string;
  try {
    // userInfo().homedir is supplied by the OS account database/API. Do not
    // use os.homedir(), which can honor HOME/USERPROFILE overrides.
    home = os.userInfo().homedir;
  } catch (error) {
    throw new Error(
      `Could not read the authenticated OS account home: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
  if (!home) throw new Error("The authenticated OS account has no home directory");
  return absolutePath(home, "authenticated OS account home");
}

function trustedRoots(options: PnpmResolutionOptions = {}) {
  const platform = platformOf(options);
  const nodeExecutable = options.nodeExecutable ?? process.execPath;
  const canonicalNode = canonicalFile(nodeExecutable, "running Node executable");
  const nodeRoot = path.dirname(canonicalNode);
  const accountHome = absolutePath(
    options.accountHome ?? trustedAccountHome(),
    "authenticated OS account home",
  );

  const roots = [
    // A pnpm package installed beside the trusted Node runtime is the most
    // direct provisioned toolchain layout.
    {
      path: path.join(nodeRoot, "node_modules", PINNED_PNPM_PACKAGE),
      anchor: nodeRoot,
    },
    // pnpm/action-setup's documented default package location.
    {
      path: path.join(accountHome, "setup-pnpm", "node_modules", PINNED_PNPM_PACKAGE),
      anchor: accountHome,
    },
    // Corepack v1's OS-specific cache layout for this pinned version.
    platform === "win32"
      ? {
          path: path.join(
            accountHome,
            "AppData",
            "Local",
            "node",
            "corepack",
            "v1",
            "pnpm",
            PINNED_PNPM_VERSION,
          ),
          anchor: accountHome,
        }
      : {
          path: path.join(
            accountHome,
            ".cache",
            "node",
            "corepack",
            "v1",
            "pnpm",
            PINNED_PNPM_VERSION,
          ),
          anchor: accountHome,
        },
  ];

  return { platform, nodeExecutable, canonicalNode, nodeRoot, accountHome, roots };
}

function inspectTrustedPackage(packageRoot: string, anchor: string, platform: NodeJS.Platform) {
  const root = absolutePath(packageRoot, "pnpm trusted package root");
  let rootStat: fs.Stats;
  try {
    rootStat = fs.lstatSync(root);
  } catch {
    return undefined;
  }
  // A caller cannot turn an arbitrary profile symlink into a trusted root.
  // In-root links below the already trusted package root are accepted only
  // after canonical containment is checked.
  if (!rootStat.isDirectory() || rootStat.isSymbolicLink()) return undefined;

  let canonicalRoot: string;
  try {
    canonicalRoot = fs.realpathSync.native(root);
  } catch {
    return undefined;
  }
  let canonicalAnchor: string;
  try {
    canonicalAnchor = fs.realpathSync.native(anchor);
  } catch {
    return undefined;
  }
  if (!isContained(canonicalAnchor, canonicalRoot, platform)) return undefined;

  const manifestPath = path.join(root, "package.json");
  const entryPath = path.join(root, PINNED_PNPM_BIN);
  let manifest: PnpmPackageManifest;
  try {
    const manifestStat = fs.lstatSync(manifestPath);
    if (!manifestStat.isFile()) return undefined;
    canonicalContained(canonicalRoot, manifestPath, platform, "pnpm package manifest");
    manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as PnpmPackageManifest;
  } catch {
    return undefined;
  }
  if (
    manifest.name !== PINNED_PNPM_PACKAGE ||
    manifest.version !== PINNED_PNPM_VERSION ||
    typeof manifest.bin !== "object" ||
    manifest.bin === null ||
    (manifest.bin as Record<string, unknown>).pnpm !== PINNED_PNPM_BIN
  )
    return undefined;

  try {
    const entryStat = fs.lstatSync(entryPath);
    if (!entryStat.isFile()) return undefined;
    const canonicalEntry = canonicalContained(
      canonicalRoot,
      entryPath,
      platform,
      "pnpm entrypoint",
    );
    if (!isContained(canonicalRoot, canonicalEntry, platform)) return undefined;
    return canonicalEntry;
  } catch {
    return undefined;
  }
}

/** Resolve only from the finite Node/account-derived trusted toolchain roots. */
export function resolvePnpmEntry(options: PnpmResolutionOptions = {}) {
  const { platform, roots } = trustedRoots(options);
  const seen = new Set<string>();
  const failures: string[] = [];
  for (const root of roots) {
    const rootKey = pathKey(root.path, platform);
    if (seen.has(rootKey)) continue;
    seen.add(rootKey);
    const entry = inspectTrustedPackage(root.path, root.anchor, platform);
    if (entry) return entry;
    failures.push(root.path);
  }
  throw new Error(
    `Pinned pnpm ${PINNED_PNPM_VERSION} was not found in a trusted toolchain root (${failures.join(", ")})`,
  );
}

function validatedNodeExecutable(options?: PnpmResolutionOptions) {
  const nodeExecutable = options?.nodeExecutable ?? process.execPath;
  absolutePath(nodeExecutable, "running Node executable");
  // Resolve once here so environment construction cannot be used to select a
  // different Node executable. The returned command remains process.execPath.
  canonicalFile(nodeExecutable, "running Node executable");
  return nodeExecutable;
}

/**
 * Return an explicit, shell-free invocation for the pinned pnpm package.
 *
 * The launcher is always the already running Node executable. The package
 * entrypoint is canonical and absolute; no shell, shim, ComSpec, or PATH
 * lookup participates in executable authority.
 */
export function pnpmSpawnSpec(
  args: readonly string[],
  platform: NodeJS.Platform = process.platform,
  options: Omit<PnpmResolutionOptions, "platform"> = {},
): PnpmSpawnSpec {
  if (!args.every((arg) => typeof arg === "string" && !arg.includes("\0")))
    throw new TypeError("pnpm arguments must be NUL-free strings");
  const resolution = { ...options, platform };
  const command = validatedNodeExecutable(resolution);
  const entry = resolvePnpmEntry(resolution);
  return { command, args: [entry, ...args] };
}

function pathEntries(value: string | undefined, platform: NodeJS.Platform) {
  if (!value) return [];
  const delimiter = platform === "win32" ? ";" : path.delimiter;
  return value.split(delimiter).filter((entry) => entry.length > 0 && path.isAbsolute(entry));
}

/**
 * Prepare a child environment without inheriting launcher/preload overrides.
 * PATH is retained for repository tools, but empty/relative entries are
 * removed and the canonical Node installation is always first.
 */
export function preparePnpmEnv(
  source: Record<string, string | undefined> = process.env,
  platform: NodeJS.Platform = process.platform,
  nodeExecutable = process.execPath,
  accountHome?: string,
) {
  const command = validatedNodeExecutable({ platform, nodeExecutable });
  const nodeDirectory = path.dirname(canonicalFile(command, "running Node executable"));
  const trustedHome = absolutePath(
    accountHome ?? trustedAccountHome(),
    "authenticated OS account home",
  );
  const prepared = Object.create(null) as NodeJS.ProcessEnv;
  const seen = new Set<string>();
  let suppliedPath: string | undefined;

  for (const [key, value] of Object.entries(source)) {
    const lower = normalizedEnvKey(key);
    if (lower === "path") {
      suppliedPath ??= value;
      continue;
    }
    if (HOSTILE_ENV_NAMES.has(lower) || isBlockedPnpmConfigKey(key) || seen.has(lower)) continue;
    seen.add(lower);
    if (value !== undefined) prepared[key] = value;
  }

  const paths = [nodeDirectory, ...pathEntries(suppliedPath, platform)];
  const pathSeen = new Set<string>();
  const uniquePaths = paths.filter((entry) => {
    const key = pathKey(entry, platform);
    if (pathSeen.has(key)) return false;
    pathSeen.add(key);
    return true;
  });
  prepared.PATH = uniquePaths.join(platform === "win32" ? ";" : path.delimiter);

  // pnpm derives its user/global config locations and cache root from these
  // values. Replace any caller-provided home/config roots with the OS-account
  // home that was resolved outside the environment map, so HOME/USERPROFILE
  // poisoning cannot select a hostile .npmrc. The values remain available to
  // legitimate runner tooling, but are no longer attacker-selected.
  prepared.HOME = trustedHome;
  if (platform === "win32") {
    prepared.USERPROFILE = trustedHome;
    prepared.APPDATA = path.join(trustedHome, "AppData", "Roaming");
    prepared.LOCALAPPDATA = path.join(trustedHome, "AppData", "Local");
  } else {
    prepared.XDG_CONFIG_HOME = path.join(trustedHome, ".config");
  }
  return prepared;
}

type SafeSpawnOptions = Omit<SpawnOptions, "env" | "shell" | "windowsHide"> & {
  env?: NodeJS.ProcessEnv;
};

type SafeSpawnSyncOptions = Omit<SpawnSyncOptions, "env" | "shell" | "windowsHide"> & {
  env?: NodeJS.ProcessEnv;
};

/** Launch pnpm with the invariant options applied at one shared sink. */
export function spawnPnpm(args: readonly string[], options: SafeSpawnOptions = {}): ChildProcess {
  const invocation = pnpmSpawnSpec(args);
  return spawn(invocation.command, invocation.args, {
    ...options,
    env: preparePnpmEnv(options.env ?? process.env),
    shell: false,
    windowsHide: true,
  });
}

/** Synchronous counterpart preserving each caller's encoding/maxBuffer/cwd. */
export function spawnPnpmSync(args: readonly string[], options: SafeSpawnSyncOptions = {}) {
  const invocation = pnpmSpawnSpec(args);
  return spawnSync(invocation.command, invocation.args, {
    ...options,
    env: preparePnpmEnv(options.env ?? process.env),
    shell: false,
    windowsHide: true,
  });
}
