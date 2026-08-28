import { existsSync } from "node:fs";
import { chromium } from "@playwright/test";

/**
 * Lighthouse uses chrome-launcher, which does not automatically discover the
 * Chromium binary installed by Playwright in a clean CI runner.
 */
export function withLighthouseChrome(env: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
  if (env.CHROME_PATH) return env;
  if (env.PLAYWRIGHT_EXECUTABLE_PATH && existsSync(env.PLAYWRIGHT_EXECUTABLE_PATH))
    return { ...env, CHROME_PATH: env.PLAYWRIGHT_EXECUTABLE_PATH };
  const playwrightChromePath = chromium.executablePath();
  return existsSync(playwrightChromePath) ? { ...env, CHROME_PATH: playwrightChromePath } : env;
}
