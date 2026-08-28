import path from "node:path";
import { describe, expect, it } from "vitest";
import { withOwnedPuppeteerBrowser } from "../scripts/lighthouse-config";

describe("Lighthouse browser configuration", () => {
  it("activates a caller-owned Puppeteer profile without discarding options", () => {
    const profile = path.join(process.cwd(), "runner", "temp", "lighthouse profile");
    expect(
      withOwnedPuppeteerBrowser({ url: ["http://127.0.0.1:3210/"], numberOfRuns: 2 }, profile),
    ).toEqual({
      url: ["http://127.0.0.1:3210/"],
      numberOfRuns: 2,
      puppeteerScript: "scripts/lighthouse-puppeteer-bootstrap.cjs",
      puppeteerLaunchOptions: { userDataDir: profile },
    });
  });

  it("preserves valid launch options and replaces the profile owner", () => {
    const profile = path.join(process.cwd(), "temp");
    expect(
      withOwnedPuppeteerBrowser(
        { puppeteerLaunchOptions: { headless: false, args: ["--disable-gpu"] } },
        profile,
        "scripts/custom-bootstrap.cjs",
      ).puppeteerLaunchOptions,
    ).toEqual({ headless: false, args: ["--disable-gpu"], userDataDir: profile });
  });
});
