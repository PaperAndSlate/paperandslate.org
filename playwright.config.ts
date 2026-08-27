import { defineConfig, devices } from "@playwright/test";

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
    baseURL: "http://127.0.0.1:3101",
    trace: "retain-on-failure",
    launchOptions: systemChromePath ? { executablePath: systemChromePath } : undefined,
  },
  webServer: {
    command: "pnpm --filter @paper-and-slate/web exec next dev --hostname 127.0.0.1 --port 3101",
    url: "http://127.0.0.1:3101",
    reuseExistingServer: false,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
