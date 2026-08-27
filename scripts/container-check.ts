import { execFileSync, spawn, type ChildProcess } from "node:child_process";
import fs from "node:fs";

const docker = process.platform === "win32" ? "docker.exe" : "docker";
const image = "paper-and-slate-web:local";
const container = `paper-and-slate-web-check-${process.pid}`;
const port = 3211;
const run = (args: string[], inherit = false) =>
  execFileSync(docker, args, {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: inherit ? "inherit" : ["ignore", "pipe", "pipe"],
  });
let child: ChildProcess | undefined;
try {
  if (!fs.existsSync("infrastructure/docker/Dockerfile")) throw new Error("Dockerfile is missing");
  run(["version"]);
  run(["build", "--file", "infrastructure/docker/Dockerfile", "--tag", image, "."], true);
  const inspect = JSON.parse(run(["image", "inspect", image])) as Array<{
    Config?: { User?: string; Healthcheck?: { Test?: string[] } };
  }>;
  const config = inspect[0]?.Config;
  if (!config || config.User !== "node" || !config.Healthcheck?.Test?.length)
    throw new Error("Container image must run as node and declare a healthcheck");
  child = spawn(docker, ["run", "--rm", "--name", container, "-p", `${port}:3000`, image], {
    cwd: process.cwd(),
    stdio: "ignore",
    windowsHide: true,
  });
  const deadline = Date.now() + 30_000;
  let healthy = false;
  while (Date.now() < deadline) {
    try {
      const response = fetch(`http://127.0.0.1:${port}/health`);
      const result = await response;
      if (result.ok) {
        healthy = true;
        break;
      }
    } catch {
      // The container may still be starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  if (!healthy) throw new Error("Container health endpoint did not become ready");
  const identity = run(["exec", container, "id", "-u"]).trim();
  if (identity === "0") throw new Error("Container process is running as root");
  console.log(`Container check passed: ${image}, runtime uid ${identity}.`);
} catch (error) {
  if ((error as NodeJS.ErrnoException).code === "ENOENT")
    throw new Error("Docker is unavailable; container acceptance remains blocked");
  throw error;
} finally {
  try {
    run(["rm", "--force", container]);
  } catch {
    // The --rm container may already have exited.
  }
  child?.kill();
}
