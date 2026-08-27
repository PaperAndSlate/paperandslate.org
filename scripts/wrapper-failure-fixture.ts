import { spawnSync } from "node:child_process";
import path from "node:path";

const command = process.platform === "win32" ? "cmd.exe" : "pnpm";
const root = process.cwd();

function expectFailure(script: string, extra: Record<string, string>) {
  const args =
    process.platform === "win32"
      ? ["/d", "/s", "/c", `pnpm.cmd exec tsx "${script}"`]
      : ["exec", "tsx", script];
  const result = spawnSync(command, args, {
    cwd: root,
    env: { ...process.env, ...extra },
    stdio: "pipe",
    encoding: "utf8",
  });
  if (result.error) throw result.error;
  if (result.status === 0) throw new Error(`${script} unexpectedly passed its failure fixture`);
  console.log(`${path.basename(script)} returned the expected nonzero fixture status.`);
}

expectFailure("scripts/lighthouse.ts", {
  LIGHTHOUSE_STANDALONE_SERVER: path.join(root, ".generated", "missing", "server.js"),
});
expectFailure("scripts/container-check.ts", {
  CONTAINER_CHECK_DOCKERFILE: path.join(root, ".generated", "missing", "Dockerfile"),
});
