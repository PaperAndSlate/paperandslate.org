import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { userInfo } from "node:os";
import { chromium } from "@playwright/test";
import { pnpmSpawnSpec } from "./pnpm-command";

const args = process.argv.slice(2);

function requireUnprivilegedRunner() {
  if (process.platform === "win32") return;
  if (typeof process.getuid === "function" && process.getuid() === 0)
    throw new Error(
      "CI browser checks require an explicitly unprivileged runner user; refusing root",
    );
  const expectedUser = process.env.CI_BROWSER_EXPECTED_USER?.trim();
  if (!expectedUser) return;
  let actualUser: string;
  try {
    actualUser = userInfo().username;
  } catch (error) {
    throw new Error(
      `CI browser checks could not verify the runner user: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
  if (actualUser !== expectedUser)
    throw new Error(`CI browser checks require runner user ${expectedUser}; found ${actualUser}`);
}

function executablePath() {
  const resolved = process.env.PLAYWRIGHT_EXECUTABLE_PATH ?? chromium.executablePath();
  if (!existsSync(resolved))
    throw new Error(`Playwright Chromium executable is missing: ${resolved}`);
  return resolved;
}

function main() {
  if (args.length === 0) throw new Error("Usage: tsx scripts/ci-browser.ts <pnpm-script>");
  requireUnprivilegedRunner();
  const browserPath = executablePath();
  const invocation = pnpmSpawnSpec(args);
  const child = spawn(invocation.command, invocation.args, {
    cwd: process.cwd(),
    env: {
      ...process.env,
      CI_BROWSER_UNPRIVILEGED: "true",
      PLAYWRIGHT_EXECUTABLE_PATH: browserPath,
      CHROME_PATH: browserPath,
    },
    stdio: "inherit",
    shell: false,
    windowsHide: true,
  });
  child.once("error", (error) => {
    console.error(error);
    process.exitCode = 1;
  });
  child.once("exit", (code, signal) => {
    if (signal) {
      console.error(`pnpm ${args.join(" ")} exited with signal ${signal}`);
      process.exitCode = 1;
    } else process.exitCode = code ?? 1;
  });
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
