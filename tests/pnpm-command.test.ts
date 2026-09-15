import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  PINNED_PNPM_VERSION,
  pnpmSpawnSpec,
  preparePnpmEnv,
  resolvePnpmEntry,
  spawnPnpmSync,
} from "../scripts/pnpm-command";

const fixture = path.join(process.cwd(), "tests", "fixtures", "pnpm-argv-probe.cjs");
const temporaryRoots: string[] = [];

afterEach(() => {
  for (const root of temporaryRoots.splice(0)) fs.rmSync(root, { recursive: true, force: true });
});

function temporaryHome() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "paper-and-slate-pnpm-test-"));
  temporaryRoots.push(root);
  return root;
}

function writePnpmPackage(root: string, version = PINNED_PNPM_VERSION, bin = "bin/pnpm.cjs") {
  const packageRoot = path.join(root, "setup-pnpm", "node_modules", "pnpm");
  fs.mkdirSync(path.join(packageRoot, "bin"), { recursive: true });
  fs.writeFileSync(
    path.join(packageRoot, "package.json"),
    `${JSON.stringify({ name: "pnpm", version, bin: { pnpm: bin } })}\n`,
  );
  fs.writeFileSync(path.join(packageRoot, bin), "#!/usr/bin/env node\n");
  return path.resolve(path.join(packageRoot, bin));
}

function writeMalformedPnpmPackage(root: string) {
  const packageRoot = path.join(root, "setup-pnpm", "node_modules", "pnpm");
  fs.mkdirSync(path.join(packageRoot, "bin"), { recursive: true });
  fs.writeFileSync(path.join(packageRoot, "package.json"), "{ not valid json\n");
  fs.writeFileSync(path.join(packageRoot, "bin", "pnpm.cjs"), "#!/usr/bin/env node\n");
}

function writeCorepackPackage(root: string) {
  const packageRoot =
    process.platform === "win32"
      ? path.join(root, "AppData", "Local", "node", "corepack", "v1", "pnpm", PINNED_PNPM_VERSION)
      : path.join(root, ".cache", "node", "corepack", "v1", "pnpm", PINNED_PNPM_VERSION);
  fs.mkdirSync(path.join(packageRoot, "bin"), { recursive: true });
  fs.writeFileSync(
    path.join(packageRoot, "package.json"),
    `${JSON.stringify({ name: "pnpm", version: PINNED_PNPM_VERSION, bin: { pnpm: "bin/pnpm.cjs" } })}\n`,
  );
  fs.writeFileSync(path.join(packageRoot, "bin", "pnpm.cjs"), "#!/usr/bin/env node\n");
  return path.resolve(path.join(packageRoot, "bin", "pnpm.cjs"));
}

describe("pnpmSpawnSpec", () => {
  it("launches the pinned package through the already running Node executable", () => {
    const invocation = pnpmSpawnSpec(["--version"]);
    expect(invocation.command).toBe(process.execPath);
    expect(path.isAbsolute(invocation.args[0])).toBe(true);
    expect(invocation.args[0]).toMatch(/[\\/]bin[\\/]pnpm\.cjs$/);
    expect(
      JSON.parse(
        fs.readFileSync(path.join(path.dirname(invocation.args[0]), "..", "package.json"), "utf8"),
      ),
    ).toMatchObject({
      name: "pnpm",
      version: PINNED_PNPM_VERSION,
    });
  });

  it("passes hostile arguments to a real offline child without shell interpretation", () => {
    const marker = path.join(temporaryHome(), "should-not-exist");
    const values = [
      "path with spaces",
      "quote'\"value",
      "trailing\\",
      "ユニコード",
      "",
      "&",
      "|",
      "^",
      "%",
      "!",
      ";",
      "`whoami`",
      "$(whoami)",
      `> ${marker}`,
    ];
    const invocation = pnpmSpawnSpec(["exec", process.execPath, fixture, ...values]);
    const result = spawnSync(invocation.command, invocation.args, {
      cwd: process.cwd(),
      env: preparePnpmEnv({
        ...process.env,
        PATH: `${path.dirname(invocation.command)}${path.delimiter}${process.env.PATH ?? ""}`,
      }),
      encoding: "utf8",
      shell: false,
      windowsHide: true,
    });
    expect(result.error).toBeUndefined();
    expect(result.status).toBe(0);
    const output = result.stdout.trim().split(/\r?\n/).filter(Boolean).at(-1);
    expect(JSON.parse(output ?? "{}").argv).toEqual(values);
    expect(fs.existsSync(marker)).toBe(false);
  });

  it("does not let poisoned launcher variables select a fake pnpm", () => {
    const root = temporaryHome();
    const fakeLauncher = path.join(root, "fake", "pnpm.cjs");
    const marker = path.join(root, "fake-launcher-ran");
    fs.mkdirSync(path.dirname(fakeLauncher), { recursive: true });
    fs.writeFileSync(
      fakeLauncher,
      `require("node:fs").writeFileSync(${JSON.stringify(marker)}, "ran"); process.exit(99);\n`,
    );
    const invocation = pnpmSpawnSpec(["exec", process.execPath, fixture, "literal"]);
    const hostileEnv = {
      ...process.env,
      PATH: path.dirname(fakeLauncher),
      Path: `${path.dirname(fakeLauncher)}${path.delimiter}${process.env.PATH ?? ""}`,
      ComSpec: fakeLauncher,
      cOmSpEc: fakeLauncher,
      PNPM_HOME: path.dirname(fakeLauncher),
      npm_execpath: fakeLauncher,
      npm_node_execpath: fakeLauncher,
      COREPACK_HOME: root,
      HOME: root,
      USERPROFILE: root,
      NODE_OPTIONS: `--require ${fakeLauncher}`,
      NODE_PATH: path.dirname(fakeLauncher),
      npm_config_node_options: `--require ${fakeLauncher}`,
      npm_config_script_shell: fakeLauncher,
    };
    const result = spawnSync(invocation.command, invocation.args, {
      cwd: process.cwd(),
      env: preparePnpmEnv(hostileEnv),
      encoding: "utf8",
      shell: false,
      windowsHide: true,
    });
    expect(result.error).toBeUndefined();
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('"literal"');
    expect(fs.existsSync(marker)).toBe(false);
  });

  it("uses OS-account defaults even when parent home and pnpm aliases are poisoned", () => {
    const root = temporaryHome();
    const marker = path.join(root, "alias-launcher-ran");
    const fakeLauncher = path.join(root, "fake", "pnpm.cjs");
    fs.mkdirSync(path.dirname(fakeLauncher), { recursive: true });
    fs.writeFileSync(
      fakeLauncher,
      `require("node:fs").writeFileSync(${JSON.stringify(marker)}, "ran"); process.exit(99);\n`,
    );
    const hostile = {
      ...process.env,
      HOME: root,
      USERPROFILE: root,
      APPDATA: root,
      LOCALAPPDATA: root,
      ComSpec: fakeLauncher,
      PATH: path.dirname(fakeLauncher),
      "npm_config_script-shell": fakeLauncher,
      npm_config_script_shell: fakeLauncher,
      "npm_config_node-options": `--require ${fakeLauncher}`,
      npm_config_node_options: `--require ${fakeLauncher}`,
      npm_config_shell_emulator: "true",
      "npm_config_shell-emulator": "true",
      npm_config_userconfig: path.join(root, "hostile.npmrc"),
      npm_config_globalconfig: path.join(root, "hostile-global.npmrc"),
    };
    fs.writeFileSync(
      path.join(root, "hostile.npmrc"),
      `script-shell=${fakeLauncher}\nnode-options=--require ${fakeLauncher}\n`,
    );
    const result = spawnPnpmSync(["exec", process.execPath, fixture, "alias-safe"], {
      cwd: process.cwd(),
      env: hostile,
      encoding: "utf8",
      stdio: "pipe",
    });
    expect(result.error).toBeUndefined();
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('"alias-safe"');
    expect(fs.existsSync(marker)).toBe(false);
  });

  it("rejects NUL-containing argv before a child can be started", () => {
    expect(() => pnpmSpawnSpec(["ok\0not-ok"])).toThrow(/NUL-free/);
  });
});

describe("trusted pnpm resolution", () => {
  it("accepts the finite action-setup layout and ignores environment-selected roots", () => {
    const home = temporaryHome();
    const expected = writePnpmPackage(home);
    const original = { ...process.env };
    try {
      process.env.COREPACK_HOME = path.join(home, "attacker");
      process.env.PNPM_HOME = path.join(home, "attacker");
      process.env.HOME = path.join(home, "attacker");
      expect(resolvePnpmEntry({ accountHome: home, nodeExecutable: process.execPath })).toBe(
        expected,
      );
    } finally {
      for (const key of ["COREPACK_HOME", "PNPM_HOME", "HOME"]) {
        if (original[key] === undefined) delete process.env[key];
        else process.env[key] = original[key];
      }
    }
  });

  it("accepts the finite local Corepack v1 layout", () => {
    const home = temporaryHome();
    const expected = writeCorepackPackage(home);
    expect(resolvePnpmEntry({ accountHome: home, nodeExecutable: process.execPath })).toBe(
      expected,
    );
  });

  it("rejects malformed and wrong-version package candidates independently", () => {
    const wrongVersionHome = temporaryHome();
    writePnpmPackage(wrongVersionHome, "10.6.1");
    expect(() =>
      resolvePnpmEntry({ accountHome: wrongVersionHome, nodeExecutable: process.execPath }),
    ).toThrow(/Pinned pnpm 10\.6\.0/);

    const malformedHome = temporaryHome();
    writeMalformedPnpmPackage(malformedHome);
    expect(() =>
      resolvePnpmEntry({ accountHome: malformedHome, nodeExecutable: process.execPath }),
    ).toThrow(/Pinned pnpm 10\.6\.0/);
  });

  it("rejects missing, wrong-name, wrong-bin, and regular-file roots independently", () => {
    const missingHome = temporaryHome();
    expect(() =>
      resolvePnpmEntry({ accountHome: missingHome, nodeExecutable: process.execPath }),
    ).toThrow(/Pinned pnpm 10\.6\.0/);

    const wrongNameHome = temporaryHome();
    const wrongNameEntry = writePnpmPackage(wrongNameHome);
    const wrongNameManifest = path.join(path.dirname(path.dirname(wrongNameEntry)), "package.json");
    fs.writeFileSync(
      wrongNameManifest,
      `${JSON.stringify({ name: "not-pnpm", version: PINNED_PNPM_VERSION, bin: { pnpm: "bin/pnpm.cjs" } })}\n`,
    );
    expect(() =>
      resolvePnpmEntry({ accountHome: wrongNameHome, nodeExecutable: process.execPath }),
    ).toThrow(/Pinned pnpm 10\.6\.0/);

    const wrongBinHome = temporaryHome();
    const wrongBinEntry = writePnpmPackage(wrongBinHome);
    const wrongBinManifest = path.join(path.dirname(path.dirname(wrongBinEntry)), "package.json");
    fs.writeFileSync(
      wrongBinManifest,
      `${JSON.stringify({ name: "pnpm", version: PINNED_PNPM_VERSION, bin: { pnpm: "bin/not-pnpm.cjs" } })}\n`,
    );
    expect(() =>
      resolvePnpmEntry({ accountHome: wrongBinHome, nodeExecutable: process.execPath }),
    ).toThrow(/Pinned pnpm 10\.6\.0/);

    const regularFileHome = temporaryHome();
    const regularFileRoot = path.join(regularFileHome, "setup-pnpm", "node_modules", "pnpm");
    fs.mkdirSync(path.dirname(regularFileRoot), { recursive: true });
    fs.writeFileSync(regularFileRoot, "not a package directory\n");
    expect(() =>
      resolvePnpmEntry({ accountHome: regularFileHome, nodeExecutable: process.execPath }),
    ).toThrow(/Pinned pnpm 10\.6\.0/);
  });

  it("rejects a real out-of-root junction without silently skipping the assertion", () => {
    const home = temporaryHome();
    const outside = temporaryHome();
    const validOutside = writePnpmPackage(outside);
    const linkRoot = path.join(home, "setup-pnpm", "node_modules", "pnpm");
    fs.mkdirSync(path.dirname(linkRoot), { recursive: true });
    fs.symlinkSync(path.dirname(path.dirname(validOutside)), linkRoot, "junction");
    expect(() => resolvePnpmEntry({ accountHome: home, nodeExecutable: process.execPath })).toThrow(
      /Pinned pnpm 10\.6\.0/,
    );
  });

  it("rejects an escaped trusted ancestor containing plausible pnpm metadata", () => {
    const home = temporaryHome();
    const outside = temporaryHome();
    const validOutside = writePnpmPackage(outside);
    const trustedAncestor = path.join(home, "setup-pnpm", "node_modules");
    fs.mkdirSync(path.dirname(trustedAncestor), { recursive: true });
    fs.symlinkSync(
      path.dirname(path.dirname(path.dirname(validOutside))),
      trustedAncestor,
      "junction",
    );
    expect(() => resolvePnpmEntry({ accountHome: home, nodeExecutable: process.execPath })).toThrow(
      /Pinned pnpm 10\.6\.0/,
    );
  });

  it("rejects a valid package whose bin entry escapes its trusted root", () => {
    const home = temporaryHome();
    const packageRoot = path.join(home, "setup-pnpm", "node_modules", "pnpm");
    const outsideBin = path.join(home, "outside-bin");
    fs.mkdirSync(packageRoot, { recursive: true });
    fs.mkdirSync(outsideBin, { recursive: true });
    fs.writeFileSync(
      path.join(packageRoot, "package.json"),
      `${JSON.stringify({ name: "pnpm", version: PINNED_PNPM_VERSION, bin: { pnpm: "bin/pnpm.cjs" } })}\n`,
    );
    fs.writeFileSync(path.join(outsideBin, "pnpm.cjs"), "#!/usr/bin/env node\n");
    fs.symlinkSync(outsideBin, path.join(packageRoot, "bin"), "junction");
    expect(() => resolvePnpmEntry({ accountHome: home, nodeExecutable: process.execPath })).toThrow(
      /Pinned pnpm 10\.6\.0/,
    );
  });
});

describe("preparePnpmEnv", () => {
  it("removes case-insensitive launcher/preload overrides and pins Node first in PATH", () => {
    const source = {
      PATH: `${path.join("relative", "path")}${path.delimiter}${path.dirname(process.execPath)}`,
      Path: "C:\\attacker",
      ComSpec: "C:\\attacker\\cmd.exe",
      cOmSpEc: "C:\\attacker\\other.exe",
      NODE_OPTIONS: "--require attacker",
      node_path: "C:\\attacker",
      npm_config_script_shell: "C:\\attacker\\shell.exe",
      "npm_config_script-shell": "C:\\attacker\\shell.exe",
      npm_config_node_options: "--require C:\\attacker\\preload.js",
      "npm_config_node-options": "--require C:\\attacker\\preload.js",
      npm_config_shell_emulator: "true",
      "npm_config_shell-emulator": "true",
      npm_config_userconfig: "C:\\attacker\\user.npmrc",
      npm_config_globalconfig: "C:\\attacker\\global.npmrc",
      paper_slate_test_import: "1",
      npm_execpath: "C:\\attacker\\pnpm.cjs",
      npm_node_execpath: "C:\\attacker\\node.exe",
      PNPM_HOME: "C:\\attacker",
      COREPACK_HOME: "C:\\attacker",
      npm_config_prefix: "C:\\attacker",
      CI: "true",
      LANG: "C",
    };
    const prepared = preparePnpmEnv(source);
    const lowerKeys = Object.keys(prepared).map((key) => key.toLowerCase());
    for (const hostile of [
      "comspec",
      "node_options",
      "node_path",
      "npm_config_script_shell",
      "npm_execpath",
      "npm_node_execpath",
      "pnpm_home",
      "corepack_home",
      "npm_config_prefix",
      "npm_config_node_options",
      "npm_config_shell_emulator",
      "npm_config_userconfig",
      "npm_config_globalconfig",
      "paper_slate_test_import",
    ])
      expect(lowerKeys).not.toContain(hostile);
    expect(lowerKeys.filter((key) => key === "path")).toHaveLength(1);
    expect(prepared.PATH?.split(path.delimiter)[0]).toBe(
      path.dirname(fs.realpathSync(process.execPath)),
    );
    expect(prepared.CI).toBe("true");
    expect(prepared.LANG).toBe("C");
    expect(prepared.HOME).toBe(os.userInfo().homedir);
    if (process.platform === "win32") {
      expect(prepared.USERPROFILE).toBe(os.userInfo().homedir);
      expect(prepared.APPDATA).toBe(path.join(os.userInfo().homedir, "AppData", "Roaming"));
      expect(prepared.LOCALAPPDATA).toBe(path.join(os.userInfo().homedir, "AppData", "Local"));
    }
  });
});
