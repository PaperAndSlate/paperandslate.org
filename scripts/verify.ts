import { spawnSync } from "node:child_process";

const command = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const localTasks = [
  "requirements:check",
  "docs:ingest",
  "docs:validate",
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
  "build",
  "e2e",
  "a11y:rc",
  "links",
  "visual:check",
  "sbom:generate",
  "security:scan",
];
const externalTasks = ["lighthouse", "performance:check", "container:check", "vulnerability:scan"];
const tasks =
  process.env.VERIFY_INCLUDE_EXTERNAL === "true" ? [...localTasks, ...externalTasks] : localTasks;
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
    process.exit(result.status ?? 1);
  }
}
const evidence = spawnSync(command, ["evidence:bundle"], {
  cwd: process.cwd(),
  stdio: "inherit",
  env: process.env,
  shell: process.platform === "win32",
});
if (evidence.error) throw evidence.error;
if (evidence.status !== 0) process.exit(evidence.status ?? 1);
console.log(`[verify] ${tasks.length} checks passed.`);
