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
const positiveNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value ?? fallback);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};
const commandTimeoutMs = positiveNumber(process.env.CONTAINER_CHECK_TIMEOUT_MS, 10 * 60_000);
const healthTimeoutMs = positiveNumber(process.env.CONTAINER_CHECK_HEALTH_TIMEOUT_MS, 45_000);

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

function recoverAbandonedEvidence() {
  if (!fs.existsSync(evidencePath)) return;
  try {
    const previous = JSON.parse(fs.readFileSync(evidencePath, "utf8")) as ContainerEvidence;
    if (previous.status !== "running") return;
    writeEvidence({
      ...previous,
      status: "failed",
      generatedAt: new Date().toISOString(),
      error: previous.error ?? "Previous container check process ended before completion",
    });
  } catch {
    // The current run will replace an unreadable record with a fresh running receipt.
  }
}

let activeDockerAbort: AbortController | undefined;
let activeContainer: ChildProcess | undefined;
let interrupted = false;

async function run(args: string[], inherit = false, timeoutMs = commandTimeoutMs) {
  const controller = new AbortController();
  activeDockerAbort = controller;
  try {
    const result = await execFileAsync(docker, args, {
      cwd: process.cwd(),
      encoding: "utf8",
      maxBuffer: 20 * 1024 * 1024,
      timeout: Number.isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : 0,
      killSignal: "SIGTERM",
      signal: controller.signal,
      windowsHide: true,
      ...(inherit ? { stdio: "inherit" as const } : {}),
    });
    return result.stdout;
  } catch (error) {
    const details = error as NodeJS.ErrnoException & { killed?: boolean };
    if (details.code === "ETIMEDOUT" || details.killed)
      throw new Error(`Docker command timed out after ${timeoutMs}ms: docker ${args.join(" ")}`);
    throw error;
  } finally {
    if (activeDockerAbort === controller) activeDockerAbort = undefined;
  }
}

function redactContainerDiagnostics(output: string) {
  return output.replace(
    /((?:api[_-]?key|token|password|secret|dsn|authorization|cookie)\s*(?:=|:)\s*)[^\s]+/gi,
    "$1[redacted]",
  );
}

async function containerDiagnostics() {
  const diagnostics: string[] = [];
  try {
    diagnostics.push(
      redactContainerDiagnostics(
        (
          await run(
            [
              "inspect",
              "--format",
              "status={{.State.Status}} exit={{.State.ExitCode}} error={{.State.Error}} started={{.State.StartedAt}} finished={{.State.FinishedAt}} ports={{json .NetworkSettings.Ports}}",
              container,
            ],
            false,
            10_000,
          )
        ).trim(),
      ),
    );
  } catch {
    diagnostics.push("docker inspect could not read the check container");
  }
  try {
    diagnostics.push(
      `docker port: ${(await run(["port", container], false, 10_000)).trim() || "no published ports"}`,
    );
  } catch {
    diagnostics.push("docker port could not read the check container");
  }
  try {
    diagnostics.push(
      `docker logs (tail 80):\n${redactContainerDiagnostics(
        (await run(["logs", "--tail", "80", container], false, 10_000)).trim(),
      )}`,
    );
  } catch {
    diagnostics.push("docker logs could not read the check container");
  }
  return diagnostics.filter(Boolean).join("\n");
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
  const deadline = Date.now() + healthTimeoutMs;
  let lastFailure = "no response";
  while (Date.now() < deadline) {
    if (interrupted) throw new Error("Container check interrupted by process signal");
    try {
      const response = await fetch(`http://127.0.0.1:${port}/health`, {
        signal: AbortSignal.timeout(2_000),
      });
      if (response.ok) return response;
      lastFailure = `HTTP ${response.status}: ${redactContainerDiagnostics((await response.text()).slice(0, 500))}`;
    } catch (error) {
      lastFailure = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Container health endpoint did not become ready (${lastFailure})`);
}

async function main() {
  if (!fs.existsSync(dockerfile)) throw new Error(`Dockerfile is missing: ${dockerfile}`);
  const releaseId = process.env.RELEASE_ID ?? "container-check";
  const gitSha = process.env.GIT_SHA ?? "container-check";
  recoverAbandonedEvidence();
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
  activeContainer = child;
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
  } catch (error) {
    const details = await containerDiagnostics();
    if (details && error instanceof Error) error.message = `${error.message}\n${details}`;
    throw error;
  } finally {
    try {
      await run(["rm", "--force", container]);
    } catch {
      // The --rm container may already have exited.
    }
    stopProcess(child);
    if (activeContainer === child) activeContainer = undefined;
  }
}

const abortContainerCheck = () => {
  interrupted = true;
  activeDockerAbort?.abort();
  stopProcess(activeContainer);
};
process.once("SIGINT", abortContainerCheck);
process.once("SIGTERM", abortContainerCheck);

main().catch((error) => {
  const message = interrupted
    ? "Container check interrupted by process signal"
    : error instanceof Error
      ? error.message
      : String(error);
  writeEvidence({
    schemaVersion: 1,
    status: "failed",
    generatedAt: new Date().toISOString(),
    releaseId: process.env.RELEASE_ID ?? "container-check",
    gitSha: process.env.GIT_SHA ?? "container-check",
    image,
    error: message,
  });
  if ((error as NodeJS.ErrnoException).code === "ENOENT")
    console.error("Docker is unavailable; container acceptance remains blocked");
  else console.error(message);
  process.exitCode = interrupted ? 130 : 1;
});
