import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { chromium } from "@playwright/test";
import { describe, expect, it } from "vitest";
import { resolveBrowserExecutablePath } from "../scripts/playwright-browser";
import { assertProductionBrowserBuild, browserServerArgs } from "../scripts/playwright-server";

describe("Playwright production server", () => {
  it("uses a validated standalone-server argument vector", () => {
    expect(browserServerArgs("3211")).toEqual(["--hostname", "127.0.0.1", "--port", "3211"]);
    expect(() => browserServerArgs("0")).toThrow("Invalid TCP port");
    expect(() => browserServerArgs("3101; whoami")).toThrow("Invalid TCP port");
  });

  it("uses the managed browser unless an explicit executable is supplied", () => {
    expect(resolveBrowserExecutablePath({})).toBe(chromium.executablePath());
    expect(resolveBrowserExecutablePath({ PLAYWRIGHT_EXECUTABLE_PATH: "  " })).toBe(
      chromium.executablePath(),
    );
    expect(
      resolveBrowserExecutablePath({ PLAYWRIGHT_EXECUTABLE_PATH: "C:\\tools\\chromium.exe" }),
    ).toBe("C:\\tools\\chromium.exe");
  });

  it("requires a completed production build and standalone server", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "eom-playwright-server-"));
    const outputRoot = path.join(root, ".next");
    const standaloneRoot = path.join(outputRoot, "standalone");
    try {
      await mkdir(path.join(outputRoot, "static"), { recursive: true });
      await mkdir(path.join(standaloneRoot, "apps", "web"), { recursive: true });
      await writeFile(path.join(outputRoot, "BUILD_ID"), "test-build\n", "utf8");
      await writeFile(path.join(standaloneRoot, "apps", "web", "server.js"), "\n", "utf8");
      await expect(
        assertProductionBrowserBuild(outputRoot, standaloneRoot),
      ).resolves.toBeUndefined();
      await rm(path.join(outputRoot, "BUILD_ID"));
      await expect(assertProductionBrowserBuild(outputRoot, standaloneRoot)).rejects.toThrow(
        "Next production BUILD_ID is missing",
      );
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
