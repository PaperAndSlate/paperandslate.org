import { existsSync } from "node:fs";
import { userInfo } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";
import { preparePnpmEnv, spawnPnpm } from "./pnpm-command";

export const SUPPORTED_BROWSER_SCRIPTS = ["verify", "lighthouse"] as const;
export type SupportedBrowserScript = (typeof SUPPORTED_BROWSER_SCRIPTS)[number];

export function parseBrowserScriptArgs(args: readonly string[]): SupportedBrowserScript {
  if (
    args.length !== 1 ||
    !SUPPORTED_BROWSER_SCRIPTS.includes(args[0] as SupportedBrowserScript) ||
    args[0].startsWith("-")
  )
    throw new Error("Usage: tsx scripts/ci-browser.ts <verify|lighthouse>");
  return args[0] as SupportedBrowserScript;
}

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

export function main(
  args: readonly string[] = process.argv.slice(2),
  spawnImpl: typeof spawnPnpm = spawnPnpm,
) {
  const script = parseBrowserScriptArgs(args);
  requireUnprivilegedRunner();
  const browserPath = executablePath();
  const child = spawnImpl([script], {
    cwd: process.cwd(),
    env: preparePnpmEnv({
      ...process.env,
      CI_BROWSER_UNPRIVILEGED: "true",
      PLAYWRIGHT_EXECUTABLE_PATH: browserPath,
      CHROME_PATH: browserPath,
    }),
    stdio: "inherit",
  });
  child.once("error", (error) => {
    console.error(error);
    process.exitCode = 1;
  });
  child.once("exit", (code, signal) => {
    if (signal) {
      console.error(`pnpm ${script} exited with signal ${signal}`);
      process.exitCode = 1;
    } else process.exitCode = code ?? 1;
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
