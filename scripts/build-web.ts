import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { preparePnpmEnv, spawnPnpmSync } from "./pnpm-command";
import { withProductionOutputLock } from "./production-output-lock";

const root = process.cwd();
const nextEnvFile = path.join(root, "apps", "web", "next-env.d.ts");

export function runBuildWeb(spawnSyncImpl: typeof spawnPnpmSync = spawnPnpmSync) {
  return spawnSyncImpl(["--filter", "@paper-and-slate/web", "build"], {
    cwd: root,
    env: preparePnpmEnv(process.env),
    stdio: "inherit",
  });
}

async function main() {
  await withProductionOutputLock(async () => {
    const originalNextEnv = fs.existsSync(nextEnvFile) ? fs.readFileSync(nextEnvFile) : undefined;
    try {
      const result = runBuildWeb();
      if (result.error) throw result.error;
      if (result.status === null)
        throw new Error("Next.js web build did not return an exit status");
      process.exitCode = result.status;
    } finally {
      if (originalNextEnv) fs.writeFileSync(nextEnvFile, originalNextEnv);
      else if (fs.existsSync(nextEnvFile)) fs.rmSync(nextEnvFile, { force: true });
    }
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error: unknown) => {
    process.stderr.write(
      `${error instanceof Error ? (error.stack ?? error.message) : String(error)}\n`,
    );
    process.exitCode = 1;
  });
}
