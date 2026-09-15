import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import { cp, mkdir, readFile, readdir, realpath, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { acquireExclusiveRunLock, ExclusiveRunAlreadyActiveError } from "./exclusive-run-lock";
import { isMissingPathError } from "./fs-errors";
import { withLighthouseChrome } from "./lighthouse-chrome";
import { withOwnedPuppeteerBrowser } from "./lighthouse-config";
import { normalizeFumadocsSource } from "./normalize-fumadocs-source";
import { preparePnpmEnv, spawnPnpm } from "./pnpm-command";
import { assertTcpPortFree, parseTcpPort } from "./port-check";
import { assertExactSourceRevision } from "./evidence-identity";
import { withProductionOutputLock } from "./production-output-lock";
import { ensureStandaloneOutput } from "./standalone-output";
import { readSourceState } from "./source-state";
const root = process.cwd();
const port = process.env.LH_PORT ?? "3210";
const portNumber = parseTcpPort(port);
const baseUrl = `http://127.0.0.1:${port}`;
const standaloneRoot = path.join(root, "apps", "web", ".next", "standalone");
const runtimeRoot = path.join(root, ".generated", "launch", `lighthouse-runtime-${process.pid}`);
const standaloneServer =
  process.env.LIGHTHOUSE_STANDALONE_SERVER ?? path.join(runtimeRoot, "apps", "web", "server.js");
const outputDir = path.join(root, ".generated", "launch", "lighthouse");
const tempDir = path.join(root, ".generated", "launch", `lighthouse-tmp-${process.pid}`);
const configPath = path.join(root, ".generated", "launch", `lighthouse-config-${process.pid}.json`);
const lockPath = path.join(root, ".generated", "launch", "lighthouse.lock");
const runManifestPath = path.join(outputDir, "lighthouse-run.json");
const releaseId = process.env.RELEASE_ID ?? "local-development";
const localSourceSha = readSourceState(root).commit;
const gitSha = process.env.GIT_SHA ?? localSourceSha ?? "local-development";

type LighthouseRunManifest = {
  schemaVersion: 1;
  status: "running" | "passed" | "failed";
  startedAt: string;
  finishedAt?: string;
  releaseId: string;
  gitSha: string;
  baseUrl: string;
  port: string;
  outputDir: string;
  configuredUrls: string[];
  reportCount?: number;
  error?: string;
  source?: ReturnType<typeof readSourceState>;
};

async function writeRunManifest(manifest: LighthouseRunManifest) {
  await mkdir(outputDir, { recursive: true });
  await writeFile(
    runManifestPath,
    `${JSON.stringify({ ...manifest, source: readSourceState(root) }, null, 2)}\n`,
    "utf8",
  );
}

async function waitForServer(url: string) {
  const deadline = Date.now() + 45_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(2_000) });
      if (response.ok) return response;
    } catch {
      // The production server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Production server did not become ready at ${url}`);
}

async function assertPortIsFree() {
  await assertTcpPortFree("127.0.0.1", portNumber);
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

async function removeTemporaryDirectory(directory: string) {
  try {
    await rm(directory, { recursive: true, force: true, maxRetries: 10, retryDelay: 500 });
  } catch (error) {
    // Lighthouse/Puppeteer can retain a Windows handle after writing valid reports.
    console.warn(`Could not remove temporary Lighthouse directory ${directory}: ${String(error)}`);
  }
}

async function prepareRuntime() {
  await rm(runtimeRoot, { recursive: true, force: true });
  await mkdir(path.join(runtimeRoot, "apps", "web"), { recursive: true });
  await cp(
    path.join(standaloneRoot, "apps", "web", "server.js"),
    path.join(runtimeRoot, "apps", "web", "server.js"),
  );
  await cp(
    path.join(standaloneRoot, "apps", "web", ".next"),
    path.join(runtimeRoot, "apps", "web", ".next"),
    { recursive: true },
  );
  await cp(
    path.join(root, "apps", "web", ".next", "static"),
    path.join(runtimeRoot, "apps", "web", ".next", "static"),
    { recursive: true },
  );
  await cp(
    path.join(root, "apps", "web", "public"),
    path.join(runtimeRoot, "apps", "web", "public"),
    { recursive: true },
  );
}

async function buildStandaloneOutput() {
  const nextEnvFile = path.join(root, "apps", "web", "next-env.d.ts");
  const originalNextEnv = await readFile(nextEnvFile).catch((error: unknown) => {
    if (isMissingPathError(error)) return undefined;
    throw error;
  });
  const nextCli = await realpath(
    path.join(root, "apps", "web", "node_modules", "next", "dist", "bin", "next"),
  );
  try {
    await new Promise<void>((resolve, reject) => {
      const child = spawn(process.execPath, [nextCli, "build"], {
        cwd: path.join(root, "apps", "web"),
        env: { ...process.env, NODE_ENV: "production" },
        stdio: "inherit",
        shell: false,
        windowsHide: true,
      });
      child.once("error", reject);
      child.once("exit", (code, signal) => {
        if (code === 0) resolve();
        else
          reject(
            new Error(
              `Standalone web build exited with ${signal ? `signal ${signal}` : `code ${code ?? "unknown"}`}`,
            ),
          );
      });
    });
    normalizeFumadocsSource(root);
  } finally {
    if (originalNextEnv) await writeFile(nextEnvFile, originalNextEnv);
    else await rm(nextEnvFile, { force: true });
  }
}

async function writeRunConfig() {
  const template = JSON.parse(await readFile(path.join(root, "lighthouserc.json"), "utf8")) as {
    ci: {
      collect: { url: string[]; [key: string]: unknown };
      upload: { [key: string]: unknown };
      [key: string]: unknown;
    };
  };
  template.ci.collect.url = template.ci.collect.url.map((url) => {
    const parsed = new URL(url);
    return `${baseUrl}${parsed.pathname}${parsed.search}`;
  });
  template.ci.collect = withOwnedPuppeteerBrowser(template.ci.collect, tempDir);
  template.ci.upload.outputDir = outputDir;
  await writeFile(configPath, `${JSON.stringify(template, null, 2)}\n`, "utf8");
}

export function runLighthouse(
  config: string,
  env: NodeJS.ProcessEnv,
  spawnImpl: typeof spawnPnpm = spawnPnpm,
) {
  return new Promise<void>((resolve, reject) => {
    const child = spawnImpl(["exec", "lhci", "autorun", `--config=${config}`], {
      cwd: root,
      env: preparePnpmEnv(env),
      stdio: "inherit",
    });
    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (code === 0) resolve();
      else
        reject(
          new Error(
            `Lighthouse CI exited with ${signal ? `signal ${signal}` : `code ${code ?? "unknown"}`}`,
          ),
        );
    });
  });
}

async function main() {
  const releaseLock = await acquireExclusiveRunLock(lockPath);
  try {
    await withProductionOutputLock(runLighthouseEvidence);
  } finally {
    await releaseLock();
  }
}

async function runLighthouseEvidence() {
  assertExactSourceRevision({
    currentRevision: localSourceSha,
    candidateRevision: gitSha,
    context: "Lighthouse",
    kind: "configured",
  });
  const startedAt = new Date().toISOString();
  let configuredUrls: string[] = [];
  await mkdir(outputDir, { recursive: true });
  await rm(outputDir, { recursive: true, force: true });
  await mkdir(outputDir, { recursive: true });
  await writeRunManifest({
    schemaVersion: 1,
    status: "running",
    startedAt,
    releaseId,
    gitSha,
    baseUrl,
    port,
    outputDir: path.relative(root, outputDir),
    configuredUrls,
  });
  await ensureStandaloneOutput(path.join(standaloneRoot, "apps", "web", "server.js"), async () => {
    console.log("Standalone web output is missing; building it before Lighthouse collection.");
    await buildStandaloneOutput();
  });
  await assertPortIsFree();
  await prepareRuntime();
  await removeTemporaryDirectory(tempDir);
  const template = JSON.parse(await readFile(path.join(root, "lighthouserc.json"), "utf8")) as {
    ci: { collect: { url: string[]; [key: string]: unknown }; upload: { [key: string]: unknown } };
  };
  configuredUrls = template.ci.collect.url.map((url) => {
    const parsed = new URL(url);
    return `${baseUrl}${parsed.pathname}${parsed.search}`;
  });
  await writeRunConfig();
  await writeRunManifest({
    schemaVersion: 1,
    status: "running",
    startedAt,
    releaseId,
    gitSha,
    baseUrl,
    port,
    outputDir: path.relative(root, outputDir),
    configuredUrls,
  });
  const server = spawn(process.execPath, [standaloneServer], {
    cwd: path.dirname(standaloneServer),
    env: {
      ...process.env,
      NODE_ENV: "production",
      HOSTNAME: "127.0.0.1",
      PORT: port,
      NEXT_PUBLIC_SITE_URL: baseUrl,
      RELEASE_ID: releaseId,
      GIT_SHA: gitSha,
      SEARCH_PROVIDER: "static",
      KIT_ENABLED: "false",
      TEMP: tempDir,
      TMP: tempDir,
      NODE_PATH: [path.join(root, "apps", "web", "node_modules"), process.env.NODE_PATH]
        .filter(Boolean)
        .join(path.delimiter),
    },
    stdio: "inherit",
    windowsHide: true,
  });
  try {
    const healthResponse = await waitForServer(`${baseUrl}/health`);
    const health = (await healthResponse.json()) as { releaseId?: string; gitSha?: string };
    if (health.releaseId !== releaseId || health.gitSha !== gitSha)
      throw new Error(
        `Production identity mismatch: expected ${releaseId}/${gitSha}, got ${health.releaseId ?? "missing"}/${health.gitSha ?? "missing"}`,
      );
    await runLighthouse(
      configPath,
      withLighthouseChrome({
        ...process.env,
        LH_PORT: port,
        LHCI_TEMP_DIR: tempDir,
        TEMP: tempDir,
        TMP: tempDir,
      }),
    );
    const reportCount = (await readdir(outputDir)).filter((entry) =>
      entry.endsWith(".report.json"),
    ).length;
    await writeRunManifest({
      schemaVersion: 1,
      status: "passed",
      startedAt,
      finishedAt: new Date().toISOString(),
      releaseId,
      gitSha,
      baseUrl,
      port,
      outputDir: path.relative(root, outputDir),
      configuredUrls,
      reportCount,
    });
    console.log(
      `Lighthouse CI passed against ${releaseId}/${gitSha}. Reports: ${path.relative(root, outputDir)}`,
    );
  } finally {
    stopServer(server);
    await removeTemporaryDirectory(tempDir);
    await rm(configPath, { force: true });
    await rm(runtimeRoot, { recursive: true, force: true });
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url))
  main().catch(async (error) => {
    if (error instanceof ExclusiveRunAlreadyActiveError) {
      console.error(error.message);
      process.exitCode = 1;
      return;
    }
    await writeRunManifest({
      schemaVersion: 1,
      status: "failed",
      startedAt: new Date().toISOString(),
      finishedAt: new Date().toISOString(),
      releaseId,
      gitSha,
      baseUrl,
      port,
      outputDir: path.relative(root, outputDir),
      configuredUrls: [],
      error: error instanceof Error ? error.message : String(error),
    });
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
