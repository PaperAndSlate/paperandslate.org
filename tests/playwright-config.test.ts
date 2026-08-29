import { describe, expect, it } from "vitest";
import { browserProjects } from "../playwright.config";

describe("Playwright browser projects", () => {
  it("keeps local runs on the managed Chromium baseline", () => {
    expect(browserProjects(false).map((project) => project.name)).toEqual(["chromium"]);
  });

  it("adds Firefox and WebKit only for the hosted browser matrix", () => {
    const projects = browserProjects(true, "C:\\browsers\\chromium.exe");
    expect(projects.map((project) => project.name)).toEqual(["chromium", "firefox", "webkit"]);

    const chromium = projects.find((project) => project.name === "chromium");
    const firefox = projects.find((project) => project.name === "firefox");
    const webkit = projects.find((project) => project.name === "webkit");
    expect((chromium?.use as { launchOptions?: unknown }).launchOptions).toEqual({
      executablePath: "C:\\browsers\\chromium.exe",
    });
    expect((firefox?.use as { browserName?: string }).browserName).toBe("firefox");
    expect((webkit?.use as { browserName?: string }).browserName).toBe("webkit");
    expect("testMatch" in (firefox ?? {})).toBe(true);
    expect("testMatch" in (webkit ?? {})).toBe(true);
    expect("launchOptions" in (firefox?.use ?? {})).toBe(false);
    expect("launchOptions" in (webkit?.use ?? {})).toBe(false);
  });
});
