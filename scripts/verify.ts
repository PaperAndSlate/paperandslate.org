import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const command = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const sourceDocsAvailable = fs.existsSync(path.resolve(process.cwd(), "..", "standards"));
const docsTasks = sourceDocsAvailable ? ["docs:ingest", "docs:validate"] : ["docs:bundle:check"];
const localTasks = [
  "requirements:check",
  ...docsTasks,
  "search:index",
  "content:validate",
  "feeds:check",
  "release:check",
  "routes:check",
  "security:check",
  "seo:check",
  "rollback:check",
  "format:check",
  "lint",
  "typecheck",
  "test",
  "build:verify",
  "build:web",
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
const tasks =
  process.env.VERIFY_SKIP_EXTERNAL === "true" ? localTasks : [...localTasks, ...externalTasks];
const evidencePath = path.join(process.cwd(), ".generated", "launch", "verify.json");
const startedAt = new Date().toISOString();
const writeEvidence = (
  status: "running" | "passed" | "failed",
  completed: string[],
  error?: string,
) => {
  fs.mkdirSync(path.dirname(evidencePath), { recursive: true });
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
        gitSha: process.env.GIT_SHA ?? null,
      },
      null,
      2,
    )}\n`,
  );
};
const completed: string[] = [];
writeEvidence("running", completed);
for (const task of tasks) {
  console.log(`\n[verify] pnpm ${task}`);
  const result = spawnSync(command, [task], {
    cwd: process.cwd(),
    stdio: "inherit",
    env: process.env,
    shell: process.platform === "win32",
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    writeEvidence("failed", completed, `pnpm ${task} exited with ${result.status ?? "unknown"}`);
    process.exit(result.status ?? 1);
  }
  completed.push(task);
  writeEvidence("running", completed);
}
writeEvidence("passed", completed);
const report = spawnSync(command, ["launch:report"], {
  cwd: process.cwd(),
  stdio: "inherit",
  env: process.env,
  shell: process.platform === "win32",
});
if (report.error) throw report.error;
if (report.status !== 0) {
  writeEvidence(
    "failed",
    completed,
    `pnpm launch:report exited with ${report.status ?? "unknown"}`,
  );
  process.exit(report.status ?? 1);
}
completed.push("launch:report");
const evidence = spawnSync(command, ["evidence:bundle"], {
  cwd: process.cwd(),
  stdio: "inherit",
  env: process.env,
  shell: process.platform === "win32",
});
if (evidence.error) throw evidence.error;
if (evidence.status !== 0) {
  writeEvidence(
    "failed",
    completed,
    `pnpm evidence:bundle exited with ${evidence.status ?? "unknown"}`,
  );
  process.exit(evidence.status ?? 1);
}
completed.push("evidence:bundle");
writeEvidence("passed", completed);
console.log(`[verify] ${tasks.length} checks passed.`);
