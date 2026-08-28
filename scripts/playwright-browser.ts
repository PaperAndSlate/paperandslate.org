import { chromium } from "@playwright/test";

/**
 * Keep browser evidence on the Playwright-managed browser by default. An
 * explicit executable is still supported for controlled diagnostics and CI
 * wrappers that have already verified the path.
 */
export function resolveBrowserExecutablePath(
  env: Record<string, string | undefined> = process.env,
) {
  const configured = env.PLAYWRIGHT_EXECUTABLE_PATH?.trim();
  return configured || chromium.executablePath();
}
