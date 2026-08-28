import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { pnpmSpawnSpec } from "./pnpm-command";
import { withProductionOutputLock } from "./production-output-lock";

const root = process.cwd();
const nextEnvFile = path.join(root, "apps", "web", "next-env.d.ts");

withProductionOutputLock(async () => {
  const originalNextEnv = fs.existsSync(nextEnvFile) ? fs.readFileSync(nextEnvFile) : undefined;
  try {
    const invocation = pnpmSpawnSpec(["--filter", "@paper-and-slate/web", "build"]);
    const result = spawnSync(invocation.command, invocation.args, {
      cwd: root,
      env: process.env,
      stdio: "inherit",
      shell: false,
      windowsHide: true,
    });
    if (result.error) throw result.error;
    if (result.status === null) throw new Error("Next.js web build did not return an exit status");
    process.exitCode = result.status;
  } finally {
    if (originalNextEnv) fs.writeFileSync(nextEnvFile, originalNextEnv);
    else if (fs.existsSync(nextEnvFile)) fs.rmSync(nextEnvFile, { force: true });
  }
}).catch((error: unknown) => {
  process.stderr.write(
    `${error instanceof Error ? (error.stack ?? error.message) : String(error)}\n`,
  );
  process.exitCode = 1;
});
