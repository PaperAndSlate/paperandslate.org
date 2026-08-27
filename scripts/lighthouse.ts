import { execFile, spawn, spawnSync } from "node:child_process";
import { access, mkdir } from "node:fs/promises";
import { promisify } from "node:util";
import path from "node:path";

const execFileAsync = promisify(execFile);
const root = process.cwd();
const port = process.env.LH_PORT ?? "3200";
const webRoot = path.join(root, "apps", "web");
const nextCli = path.join(webRoot, "node_modules", "next", "dist", "bin", "next");
const outputDir = path.join(root, ".generated", "launch", "lighthouse");

async function waitForServer(url: string) {
  const deadline = Date.now() + 45_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(2_000) });
      if (response.ok) return;
    } catch {
      // The production server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Production server did not become ready at ${url}`);
}

function stopServer(server: ReturnType<typeof spawn>) {
  if (!server.pid) return;
  if (process.platform === "win32")
    spawnSync("taskkill", ["/pid", String(server.pid), "/t", "/f"], { stdio: "ignore" });
  else server.kill("SIGTERM");
}

await access(nextCli);
await mkdir(outputDir, { recursive: true });
const server = spawn(
  process.execPath,
  [nextCli, "start", "--hostname", "127.0.0.1", "--port", port],
  {
    cwd: webRoot,
    env: {
      ...process.env,
      NODE_ENV: "production",
      NEXT_PUBLIC_SITE_URL: `http://127.0.0.1:${port}`,
    },
    stdio: "inherit",
  },
);
try {
  await waitForServer(`http://127.0.0.1:${port}/health`);
  await execFileAsync(
    process.platform === "win32" ? "pnpm.cmd" : "pnpm",
    ["exec", "lhci", "autorun", "--config=lighthouserc.json"],
    { cwd: root, env: { ...process.env, LH_PORT: port }, shell: process.platform === "win32" },
  );
  console.log(
    `Lighthouse CI passed against the production server on port ${port}. Reports: ${path.relative(root, outputDir)}`,
  );
} finally {
  stopServer(server);
}
