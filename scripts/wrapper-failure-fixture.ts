import path from "node:path";
import { fileURLToPath } from "node:url";
import { preparePnpmEnv, spawnPnpmSync } from "./pnpm-command";
const root = process.cwd();

export function expectFailure(
  script: string,
  extra: Record<string, string>,
  spawnSyncImpl: typeof spawnPnpmSync = spawnPnpmSync,
) {
  const result = spawnSyncImpl(["exec", "tsx", script], {
    cwd: root,
    env: preparePnpmEnv({ ...process.env, ...extra }),
    stdio: "pipe",
    encoding: "utf8",
  });
  if (result.error) throw result.error;
  if (result.status === 0) throw new Error(`${script} unexpectedly passed its failure fixture`);
  console.log(`${path.basename(script)} returned the expected nonzero fixture status.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  expectFailure("scripts/lighthouse.ts", {
    LIGHTHOUSE_STANDALONE_SERVER: path.join(root, ".generated", "missing", "server.js"),
  });
  expectFailure("scripts/container-check.ts", {
    CONTAINER_CHECK_DOCKERFILE: path.join(root, ".generated", "missing", "Dockerfile"),
  });
  expectFailure("scripts/ci-browser.ts", {});
}
