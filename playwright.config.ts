import { defineConfig, devices } from "@playwright/test";
import { parseTcpPort } from "./scripts/port-check";
import { resolveBrowserExecutablePath } from "./scripts/playwright-browser";

const hostedStagingOrigin = "https://paper-and-slate-web.dev.tower";
const configuredBaseUrl = process.env.PLAYWRIGHT_BASE_URL;
const localPort = parseTcpPort(process.env.PLAYWRIGHT_PORT ?? "3101");
const baseURL = (() => {
  if (!configuredBaseUrl) return `http://127.0.0.1:${localPort}`;
  const url = new URL(configuredBaseUrl);
  if (
    url.origin !== hostedStagingOrigin ||
    url.pathname !== "/" ||
    url.search ||
    url.hash ||
    url.username ||
    url.password
  )
    throw new Error(
      `Hosted Playwright runs are restricted to the exact HTTPS staging origin ${hostedStagingOrigin}`,
    );
  return url.origin;
})();

const browserExecutablePath = resolveBrowserExecutablePath();

const crossBrowserTestMatch = /[\\/]((?:smoke|a11y-rc))\.spec\.ts$/;

export function browserProjects(
  includeCrossBrowser = process.env.PLAYWRIGHT_BROWSER_MATRIX === "true",
  chromiumPath = browserExecutablePath,
) {
  const projects = [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        browserName: "chromium" as const,
        launchOptions: { executablePath: chromiumPath },
      },
    },
  ];
  if (!includeCrossBrowser) return projects;
  return [
    ...projects,
    {
      name: "firefox",
      testMatch: crossBrowserTestMatch,
      use: { ...devices["Desktop Firefox"], browserName: "firefox" as const },
    },
    {
      name: "webkit",
      testMatch: crossBrowserTestMatch,
      use: { ...devices["Desktop Safari"], browserName: "webkit" as const },
    },
  ];
}

export default defineConfig({
  testDir: "./tests/browser",
  snapshotDir: "./tests/browser/snapshots",
  snapshotPathTemplate: "{snapshotDir}/{arg}{ext}",
  use: {
    baseURL,
    trace: "retain-on-failure",
  },
  webServer: configuredBaseUrl
    ? undefined
    : {
        command: "pnpm exec tsx scripts/playwright-server.ts",
        url: `http://127.0.0.1:${localPort}`,
        reuseExistingServer: false,
      },
  projects: browserProjects(),
});
