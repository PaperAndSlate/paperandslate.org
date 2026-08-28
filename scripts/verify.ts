import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { loadRegistry, sourceDocsRoot } from "../packages/docs-ingestion/src/index";
import { normalizeFumadocsSource } from "./normalize-fumadocs-source";
import { pnpmSpawnSpec } from "./pnpm-command";
import { readSourceState } from "./source-state";

const siblingDocsAvailable = (() => {
  try {
    return loadRegistry()
      .filter((source) => source.kind === "sibling-local")
      .every((source) =>
        source.versions.every((version) => fs.existsSync(sourceDocsRoot(source, version))),
      );
  } catch {
    return false;
  }
})();
const docsTasks = siblingDocsAvailable ? ["docs:ingest", "docs:validate"] : ["docs:bundle:check"];
const localTasks = [
  "workflow:check",
  "traceability:check",
  ...docsTasks,
  "search:index",
  "content:validate",
  "feeds:check",
  "release:check",
  "routes:check",
  "security:check",
  "license:check",
  "seo:check",
  "rollback:check",
  "format:check",
  "lint",
  "typecheck",
  "test",
  "build:verify",
  "build:web",
  "package:smoke",
  "reproducibility:check",
  "e2e",
  "a11y:rc",
  "links",
  "visual:check",
  "production:browser",
  "production:visual",
  "wrappers:failure",
  "container:check",
  "sbom:generate",
  "repository:evidence",
  "security:scan",
];
const externalTasks = ["lighthouse", "performance:check", "vulnerability:scan"];
const tasksThatRegenerateFumadocsSource = new Set(["e2e", "a11y:rc", "links", "visual:check"]);
const tasks =
  process.env.VERIFY_SKIP_EXTERNAL === "true" ? localTasks : [...localTasks, ...externalTasks];
const evidencePath = path.join(process.cwd(), ".generated", "launch", "verify.json");
const startedAt = new Date().toISOString();
const recoverAbandonedEvidence = () => {
  if (!fs.existsSync(evidencePath)) return;
  try {
    const previous = JSON.parse(fs.readFileSync(evidencePath, "utf8")) as {
      status?: string;
      finishedAt?: string | null;
      error?: string | null;
    };
    if (previous.status !== "running") return;
    fs.writeFileSync(
      evidencePath,
      `${JSON.stringify(
        {
          ...previous,
          status: "failed",
          finishedAt: new Date().toISOString(),
          error: previous.error ?? "Previous verification process ended before completion",
        },
        null,
        2,
      )}\n`,
    );
  } catch {
    // The current run will report a fresh evidence record if the previous one was unreadable.
  }
};
const writeEvidence = (
  status: "running" | "passed" | "failed",
  completed: string[],
  error?: string,
) => {
  fs.mkdirSync(path.dirname(evidencePath), { recursive: true });
  const source = readSourceState(process.cwd());
  fs.writeFileSync(
    evidencePath,
    `${JSON.stringify(
      {
        schemaVersion: 1,
        status,
        startedAt,
        finishedAt: status === "running" ? null : new Date().toISOString(),
        skipExternal: process.env.VERIFY_SKIP_EXTERNAL === "true",
        tasks,
        completed,
        error: error ?? null,
        releaseId: process.env.RELEASE_ID ?? "local-development",
        gitSha: process.env.GIT_SHA ?? source.commit,
        source,
      },
      null,
      2,
    )}\n`,
  );
};
const completed: string[] = [];
recoverAbandonedEvidence();
writeEvidence("running", completed);

const configuredTaskTimeoutMs = Number(process.env.VERIFY_TASK_TIMEOUT_MS ?? 15 * 60_000);
const taskTimeoutMs =
  Number.isFinite(configuredTaskTimeoutMs) && configuredTaskTimeoutMs > 0
    ? configuredTaskTimeoutMs
    : 15 * 60_000;
let activeChild: ChildProcess | undefined;
let interrupted = false;

function stopChild(child: ChildProcess | undefined) {
  if (!child?.pid) return;
  if (process.platform === "win32") {
    spawnSync("taskkill", ["/pid", String(child.pid), "/t", "/f"], {
      stdio: "ignore",
      windowsHide: true,
    });
  } else {
    child.kill("SIGTERM");
  }
}

function runTask(task: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const invocation = pnpmSpawnSpec([task]);
    const child = spawn(invocation.command, invocation.args, {
      cwd: process.cwd(),
      stdio: "inherit",
      env: process.env,
      shell: false,
      windowsHide: true,
    });
    activeChild = child;
    let finished = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const finish = (error?: Error, code?: number) => {
      if (finished) return;
      finished = true;
      if (timer) clearTimeout(timer);
      if (activeChild === child) activeChild = undefined;
      if (error) reject(error);
      else resolve(code ?? 1);
    };
    if (Number.isFinite(taskTimeoutMs) && taskTimeoutMs > 0) {
      timer = setTimeout(() => {
        stopChild(child);
        finish(new Error(`pnpm ${task} exceeded the ${taskTimeoutMs}ms task timeout`));
      }, taskTimeoutMs);
    }
    child.once("error", (error) => finish(error));
    child.once("exit", (code, signal) => {
      if (signal) finish(new Error(`pnpm ${task} exited with signal ${signal}`));
      else finish(undefined, code ?? 1);
    });
  });
}

const abortVerification = () => {
  interrupted = true;
  stopChild(activeChild);
};
process.once("SIGINT", abortVerification);
process.once("SIGTERM", abortVerification);

async function main() {
  for (const task of tasks) {
    console.log(`\n[verify] pnpm ${task}`);
    const status = await runTask(task);
    if (interrupted) throw new Error("Verification interrupted by process signal");
    if (status !== 0) throw new Error(`pnpm ${task} exited with ${status}`);
    if (tasksThatRegenerateFumadocsSource.has(task)) normalizeFumadocsSource(process.cwd());
    completed.push(task);
    writeEvidence("running", completed);
  }

  // Development servers may finish their Fumadocs watcher after the child task
  // exits. Normalize once more after every task so the final source identity
  // cannot be invalidated by a late generated-file rewrite.
  normalizeFumadocsSource(process.cwd());

  // The aggregate report needs to observe a completed verification receipt so it
  // can verify the full run instead of treating its in-progress state as pending.
  writeEvidence("passed", completed);

  for (const task of ["launch:report", "evidence:bundle"]) {
    console.log(`\n[verify] pnpm ${task}`);
    const status = await runTask(task);
    if (interrupted) throw new Error("Verification interrupted by process signal");
    if (status !== 0) throw new Error(`pnpm ${task} exited with ${status}`);
    completed.push(task);
    writeEvidence("passed", completed);
  }
  console.log(`[verify] ${tasks.length} checks passed.`);
}

main().catch((error) => {
  writeEvidence("failed", completed, error instanceof Error ? error.message : String(error));
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = interrupted ? 130 : 1;
});
