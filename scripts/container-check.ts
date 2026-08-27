import { execFile, spawn, spawnSync, type ChildProcess } from "node:child_process";
import fs from "node:fs";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const docker = process.platform === "win32" ? "docker.exe" : "docker";
const image = process.env.CONTAINER_CHECK_IMAGE ?? "paper-and-slate-web:local";
const container = `paper-and-slate-web-check-${process.pid}`;
const port = Number(process.env.CONTAINER_CHECK_PORT ?? 3211);
const dockerfile = process.env.CONTAINER_CHECK_DOCKERFILE ?? "infrastructure/docker/Dockerfile";
const evidencePath = `${process.cwd()}/.generated/launch/container-check.json`;

type ContainerEvidence = {
  schemaVersion: 1;
  status: "running" | "passed" | "failed";
  generatedAt: string;
  releaseId: string;
  gitSha: string;
  image: string;
  imageId?: string | null;
  repoDigests?: string[];
  runtimeUid?: string | null;
  healthcheckClient?: string | null;
  health?: { releaseId?: string; gitSha?: string; status?: string } | null;
  healthcheck?: string[] | null;
  error?: string;
};

function writeEvidence(evidence: ContainerEvidence) {
  fs.mkdirSync(`${process.cwd()}/.generated/launch`, { recursive: true });
  fs.writeFileSync(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
}

async function run(args: string[], inherit = false) {
  const result = await execFileAsync(docker, args, {
    cwd: process.cwd(),
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024,
    windowsHide: true,
    ...(inherit ? { stdio: "inherit" as const } : {}),
  });
  return result.stdout;
}

function stopProcess(child: ChildProcess | undefined) {
  if (!child?.pid) return;
  if (process.platform === "win32")
    spawnSync("taskkill", ["/pid", String(child.pid), "/t", "/f"], {
      stdio: "ignore",
      windowsHide: true,
    });
  else child.kill("SIGTERM");
}

async function waitForHealth() {
  const deadline = Date.now() + 45_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/health`, {
        signal: AbortSignal.timeout(2_000),
      });
      if (response.ok) return response;
    } catch {
      // The container may still be starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error("Container health endpoint did not become ready");
}

async function main() {
  if (!fs.existsSync(dockerfile)) throw new Error(`Dockerfile is missing: ${dockerfile}`);
  const releaseId = process.env.RELEASE_ID ?? "container-check";
  const gitSha = process.env.GIT_SHA ?? "container-check";
  writeEvidence({
    schemaVersion: 1,
    status: "running",
    generatedAt: new Date().toISOString(),
    releaseId,
    gitSha,
    image,
  });
  await run(["version"]);
  await run(["build", "--file", dockerfile, "--tag", image, "."], true);
  const inspect = JSON.parse(await run(["image", "inspect", image])) as Array<{
    Id?: string;
    RepoDigests?: string[];
    Config?: { User?: string; Healthcheck?: { Test?: string[] } };
  }>;
  const config = inspect[0]?.Config;
  const imageId = inspect[0]?.Id ?? null;
  const repoDigests = inspect[0]?.RepoDigests ?? [];
  if (!config || config.User !== "node" || !config.Healthcheck?.Test?.length)
    throw new Error("Container image must run as node and declare a healthcheck");
  const healthcheckClient = (
    await run([
      "run",
      "--rm",
      "--entrypoint",
      "sh",
      image,
      "-c",
      "command -v curl || command -v wget",
    ])
  ).trim();
  if (!healthcheckClient)
    throw new Error("Container image must include curl or wget for HTTP health probes");
  const child = spawn(
    docker,
    [
      "run",
      "--rm",
      "--name",
      container,
      "-e",
      `RELEASE_ID=${releaseId}`,
      "-e",
      `GIT_SHA=${gitSha}`,
      "-e",
      `DEPLOYMENT_ENV=${process.env.DEPLOYMENT_ENV ?? "local"}`,
      "-p",
      `${port}:3000`,
      image,
    ],
    { cwd: process.cwd(), stdio: "ignore", windowsHide: true },
  );
  try {
    const response = await waitForHealth();
    const health = (await response.json()) as {
      releaseId?: string;
      gitSha?: string;
      status?: string;
    };
    if (health.releaseId !== releaseId || health.gitSha !== gitSha)
      throw new Error("Container health identity does not match the check environment");
    const identity = (await run(["exec", container, "id", "-u"])).trim();
    if (!identity || identity === "0") throw new Error("Container process is running as root");
    writeEvidence({
      schemaVersion: 1,
      status: "passed",
      generatedAt: new Date().toISOString(),
      releaseId,
      gitSha,
      image,
      imageId,
      repoDigests,
      runtimeUid: identity,
      healthcheckClient,
      health,
      healthcheck: config.Healthcheck?.Test ?? null,
    });
    console.log(`Container check passed: ${image}, runtime uid ${identity}.`);
  } finally {
    try {
      await run(["rm", "--force", container]);
    } catch {
      // The --rm container may already have exited.
    }
    stopProcess(child);
  }
}

main().catch((error) => {
  writeEvidence({
    schemaVersion: 1,
    status: "failed",
    generatedAt: new Date().toISOString(),
    releaseId: process.env.RELEASE_ID ?? "container-check",
    gitSha: process.env.GIT_SHA ?? "container-check",
    image,
    error: error instanceof Error ? error.message : String(error),
  });
  if ((error as NodeJS.ErrnoException).code === "ENOENT")
    console.error("Docker is unavailable; container acceptance remains blocked");
  else console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
