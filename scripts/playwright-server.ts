import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import { cp, lstat, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseTcpPort } from "./port-check";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const webRoot = path.join(repositoryRoot, "apps", "web");
const buildRoot = path.join(webRoot, ".next");
const standaloneRoot = path.join(buildRoot, "standalone");
const publicRoot = path.join(webRoot, "public");
const runtimeRoot = path.join(
  repositoryRoot,
  ".generated",
  "launch",
  `playwright-runtime-${process.pid}`,
);

const localHost = "127.0.0.1";
const defaultPort = "3101";

type PathKind = "directory" | "file";

async function requirePath(target: string, kind: PathKind, label: string) {
  let stats;
  try {
    stats = await lstat(target);
  } catch (error) {
    throw new Error(
      `${label} is missing at ${target}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
  if (stats.isSymbolicLink()) throw new Error(`${label} must not be a symbolic link: ${target}`);
  if (kind === "directory" && !stats.isDirectory())
    throw new Error(`${label} must be a directory: ${target}`);
  if (kind === "file" && !stats.isFile()) throw new Error(`${label} must be a file: ${target}`);
}

/**
 * Return the arguments for the standalone server used by local Playwright.
 * Keeping the port as argv rather than a shell fragment makes the wrapper
 * deterministic on Windows and POSIX hosts alike.
 */
export function browserServerArgs(rawPort = process.env.PLAYWRIGHT_PORT ?? defaultPort) {
  const port = parseTcpPort(rawPort);
  return ["--hostname", localHost, "--port", String(port)];
}

/**
 * Check the exact production output that the browser harness will materialize.
 * This fails clearly when a browser command is run before `pnpm build:web`.
 */
export async function assertProductionBrowserBuild(
  outputRoot = buildRoot,
  outputStandaloneRoot = standaloneRoot,
) {
  await requirePath(outputRoot, "directory", "Next production output");
  await requirePath(path.join(outputRoot, "BUILD_ID"), "file", "Next production BUILD_ID");
  await requirePath(path.join(outputRoot, "static"), "directory", "Next production static assets");
  await requirePath(outputStandaloneRoot, "directory", "Next standalone output");
  await requirePath(
    path.join(outputStandaloneRoot, "apps", "web", "server.js"),
    "file",
    "Next standalone server",
  );
}

async function prepareRuntime() {
  await assertProductionBrowserBuild();
  await requirePath(publicRoot, "directory", "Web public assets");

  await rm(runtimeRoot, { recursive: true, force: true, maxRetries: 5, retryDelay: 250 });
  const runtimeWebRoot = path.join(runtimeRoot, "apps", "web");
  await mkdir(runtimeWebRoot, { recursive: true });
  await cp(
    path.join(standaloneRoot, "apps", "web", "server.js"),
    path.join(runtimeWebRoot, "server.js"),
  );
  await cp(path.join(standaloneRoot, "apps", "web", ".next"), path.join(runtimeWebRoot, ".next"), {
    recursive: true,
  });
  await cp(path.join(buildRoot, "static"), path.join(runtimeWebRoot, ".next", "static"), {
    recursive: true,
  });
  await cp(publicRoot, path.join(runtimeWebRoot, "public"), { recursive: true });
  return path.join(runtimeWebRoot, "server.js");
}

function stopServer(server: ChildProcess) {
  if (!server.pid) return;
  if (process.platform === "win32")
    spawnSync("taskkill", ["/pid", String(server.pid), "/t", "/f"], {
      stdio: "ignore",
      windowsHide: true,
    });
  else server.kill("SIGTERM");
}

function waitForExit(server: ChildProcess) {
  return new Promise<number>((resolve, reject) => {
    server.once("error", reject);
    server.once("exit", (code, signal) => {
      if (signal) reject(new Error(`Playwright server exited with signal ${signal}`));
      else resolve(code ?? 1);
    });
  });
}

async function main() {
  const serverPath = await prepareRuntime();
  const port = browserServerArgs().at(-1)!;
  const server = spawn(process.execPath, [serverPath], {
    cwd: path.dirname(serverPath),
    env: {
      ...process.env,
      NODE_ENV: "production",
      HOSTNAME: localHost,
      PORT: port,
      SEARCH_PROVIDER: "static",
      KIT_ENABLED: "false",
    },
    stdio: "inherit",
    shell: false,
    windowsHide: true,
  });
  const onSignal = () => stopServer(server);
  process.once("SIGINT", onSignal);
  process.once("SIGTERM", onSignal);
  try {
    process.exitCode = await waitForExit(server);
  } finally {
    process.removeListener("SIGINT", onSignal);
    process.removeListener("SIGTERM", onSignal);
    await rm(runtimeRoot, { recursive: true, force: true, maxRetries: 5, retryDelay: 250 });
  }
}

const entryPath = process.argv[1] ? path.resolve(process.argv[1]) : "";
if (entryPath === path.resolve(fileURLToPath(import.meta.url)))
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
