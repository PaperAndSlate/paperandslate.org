import { spawn } from "node:child_process";
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { acquireExclusiveRunLock, ExclusiveRunAlreadyActiveError } from "./exclusive-run-lock";
import { withLighthouseChrome } from "./lighthouse-chrome";
import { pnpmSpawnSpec } from "./pnpm-command";

const root = process.cwd();
const stagingUrl = process.env.STAGING_URL;
const outputDir = path.join(root, ".generated", "launch", "lighthouse-staging");
const tempDir = path.join(root, ".generated", "launch", `lighthouse-staging-tmp-${process.pid}`);
const configPath = path.join(
  root,
  ".generated",
  "launch",
  `lighthouse-staging-config-${process.pid}.json`,
);
const manifestPath = path.join(outputDir, "lighthouse-run.json");
const lockPath = path.join(root, ".generated", "launch", "lighthouse-staging.lock");
const releaseId = process.env.RELEASE_ID ?? "unknown-release";
const expectedGitSha = process.env.GIT_SHA ?? "";
const hostedStagingOrigin = "https://paper-and-slate-web.dev.tower";

type Health = {
  status?: string;
  releaseId?: string;
  gitSha?: string;
  deployment?: string;
};

type StagingRunManifest = {
  schemaVersion: 2;
  status: "running" | "passed" | "failed";
  startedAt: string;
  finishedAt?: string;
  targetUrl: string;
  releaseId: string;
  gitSha: string;
  deploymentId: string | null;
  environment: string | null;
  configuredUrls: string[];
  reportCount?: number;
  lighthouseVersion?: string;
  health?: Health;
  error?: string;
};

function requireStagingUrl() {
  if (!stagingUrl) throw new Error("STAGING_URL is required for hosted Lighthouse evidence");
  const parsed = new URL(stagingUrl);
  if (parsed.origin !== hostedStagingOrigin)
    throw new Error(
      `Hosted Lighthouse is restricted to the exact HTTPS staging origin ${hostedStagingOrigin}`,
    );
  if (parsed.pathname !== "/")
    throw new Error("STAGING_URL must be the managed staging origin without a path");
  if (parsed.username || parsed.password || parsed.search || parsed.hash)
    throw new Error("STAGING_URL must not contain credentials, query parameters, or fragments");
  return parsed;
}

function targetUrlForPath(base: URL, source: string) {
  const sourceUrl = new URL(source);
  if (sourceUrl.pathname === "/" && !sourceUrl.search) return `${base.origin}/`;
  return `${base.origin}${sourceUrl.pathname}${sourceUrl.search}`;
}

async function writeManifest(manifest: StagingRunManifest) {
  await mkdir(outputDir, { recursive: true });
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
}

async function waitForHealth(url: string) {
  const deadline = Date.now() + 45_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(2_000) });
      if (response.ok) return (await response.json()) as Health;
    } catch {
      // Staging may still be starting or the first request may race deployment readiness.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Staging health did not become ready at ${url}`);
}

function runLighthouse(config: string, env: NodeJS.ProcessEnv) {
  return new Promise<void>((resolve, reject) => {
    const invocation = pnpmSpawnSpec(["exec", "lhci", "autorun", `--config=${config}`]);
    const child = spawn(invocation.command, invocation.args, {
      cwd: root,
      env,
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
            `Lighthouse CI exited with ${signal ? `signal ${signal}` : `code ${code ?? "unknown"}`}`,
          ),
        );
    });
  });
}

async function main() {
  const releaseLock = await acquireExclusiveRunLock(lockPath);
  try {
    await runHostedLighthouseEvidence();
  } finally {
    await releaseLock();
  }
}

async function runHostedLighthouseEvidence() {
  const base = requireStagingUrl();
  if (!releaseId || !expectedGitSha || !/^[a-f0-9]{40}$/i.test(expectedGitSha))
    throw new Error("RELEASE_ID and a full GIT_SHA are required for hosted Lighthouse evidence");
  if (!process.env.STAGING_DEPLOYMENT_ID)
    throw new Error("STAGING_DEPLOYMENT_ID is required to bind hosted Lighthouse evidence");
  const startedAt = new Date().toISOString();
  await rm(outputDir, { recursive: true, force: true });
  await rm(tempDir, { recursive: true, force: true });
  await mkdir(outputDir, { recursive: true });
  await writeManifest({
    schemaVersion: 2,
    status: "running",
    startedAt,
    targetUrl: base.origin,
    releaseId,
    gitSha: expectedGitSha,
    deploymentId: process.env.STAGING_DEPLOYMENT_ID ?? null,
    environment: process.env.DEPLOYMENT_ENV ?? "staging",
    configuredUrls: [],
  });

  const health = await waitForHealth(`${base.origin}/health`);
  if (health.status !== "ok") throw new Error("Staging health did not report status=ok");
  if (!health.releaseId || !health.gitSha)
    throw new Error("Staging health did not return releaseId and gitSha");
  if (process.env.RELEASE_ID && health.releaseId !== process.env.RELEASE_ID)
    throw new Error(
      `Staging release identity mismatch: expected ${process.env.RELEASE_ID}, got ${health.releaseId}`,
    );
  if (health.gitSha !== expectedGitSha)
    throw new Error(
      `Staging Git identity mismatch: expected ${expectedGitSha}, got ${health.gitSha}`,
    );
  if (health.deployment !== "staging")
    throw new Error(`Staging environment identity mismatch: got ${health.deployment ?? "missing"}`);

  const template = JSON.parse(await readFile(path.join(root, "lighthouserc.json"), "utf8")) as {
    ci: {
      collect: { url: string[]; [key: string]: unknown };
      upload: { [key: string]: unknown };
      [key: string]: unknown;
    };
  };
  const configuredUrls = template.ci.collect.url.map((url) => targetUrlForPath(base, url));
  template.ci.collect.url = configuredUrls;
  template.ci.upload.outputDir = outputDir;
  await writeFile(configPath, `${JSON.stringify(template, null, 2)}\n`, "utf8");
  await writeManifest({
    schemaVersion: 2,
    status: "running",
    startedAt,
    targetUrl: base.origin,
    releaseId: health.releaseId,
    gitSha: health.gitSha,
    deploymentId: process.env.STAGING_DEPLOYMENT_ID,
    environment: health.deployment ?? "staging",
    configuredUrls,
    health,
  });

  try {
    await runLighthouse(
      configPath,
      withLighthouseChrome({
        ...process.env,
        LHCI_TEMP_DIR: tempDir,
        TEMP: tempDir,
        TMP: tempDir,
      }),
    );
    const reportCount = (await readdir(outputDir)).filter(
      (entry) =>
        entry.endsWith(".report.json") || (entry.startsWith("lhr-") && entry.endsWith(".json")),
    ).length;
    if (reportCount === 0) throw new Error("Hosted Lighthouse completed without JSON reports");
    const reportFile = (await readdir(outputDir)).find((entry) => entry.endsWith(".report.json"));
    const lighthouseVersion = reportFile
      ? ((
          JSON.parse(await readFile(path.join(outputDir, reportFile), "utf8")) as {
            lighthouseVersion?: string;
          }
        ).lighthouseVersion ?? null)
      : null;
    if (!lighthouseVersion)
      throw new Error("Hosted Lighthouse report omitted its Lighthouse version");
    await writeManifest({
      schemaVersion: 2,
      status: "passed",
      startedAt,
      finishedAt: new Date().toISOString(),
      targetUrl: base.origin,
      releaseId: health.releaseId,
      gitSha: health.gitSha,
      deploymentId: process.env.STAGING_DEPLOYMENT_ID,
      environment: health.deployment ?? "staging",
      configuredUrls,
      reportCount,
      lighthouseVersion,
      health,
    });
    console.log(
      `Hosted Lighthouse passed for ${health.releaseId}/${health.gitSha}. Reports: ${path.relative(root, outputDir)}`,
    );
  } finally {
    await rm(configPath, { force: true });
    await rm(tempDir, { recursive: true, force: true });
  }
}

main().catch(async (error) => {
  const message = error instanceof Error ? error.message : String(error);
  if (error instanceof ExclusiveRunAlreadyActiveError) {
    console.error(message);
    process.exitCode = 1;
    return;
  }
  try {
    const base = stagingUrl ? new URL(stagingUrl) : null;
    await writeManifest({
      schemaVersion: 2,
      status: "failed",
      startedAt: new Date().toISOString(),
      finishedAt: new Date().toISOString(),
      targetUrl: base?.origin ?? (stagingUrl ? "invalid" : "missing"),
      releaseId,
      gitSha: expectedGitSha,
      deploymentId: process.env.STAGING_DEPLOYMENT_ID ?? null,
      environment: process.env.DEPLOYMENT_ENV ?? "staging",
      configuredUrls: [],
      error: message,
    });
  } catch {
    // Preserve the original failure when evidence output itself is unavailable.
  }
  console.error(message);
  process.exitCode = 1;
});
