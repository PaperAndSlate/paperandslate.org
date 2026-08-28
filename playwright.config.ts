import { defineConfig, devices } from "@playwright/test";

const hostedStagingOrigin = "https://paper-and-slate-web.dev.tower";
const configuredBaseUrl = process.env.PLAYWRIGHT_BASE_URL;
const baseURL = (() => {
  if (!configuredBaseUrl) return "http://127.0.0.1:3101";
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

const systemChromePath =
  process.env.PLAYWRIGHT_EXECUTABLE_PATH ||
  (process.platform === "win32"
    ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
    : undefined);

export default defineConfig({
  testDir: "./tests/browser",
  snapshotDir: "./tests/browser/snapshots",
  snapshotPathTemplate: "{snapshotDir}/{arg}{ext}",
  use: {
    baseURL,
    trace: "retain-on-failure",
    launchOptions: systemChromePath ? { executablePath: systemChromePath } : undefined,
  },
  webServer: configuredBaseUrl
    ? undefined
    : {
        command:
          "pnpm --filter @paper-and-slate/web exec next dev --hostname 127.0.0.1 --port 3101",
        url: "http://127.0.0.1:3101",
        reuseExistingServer: false,
      },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
