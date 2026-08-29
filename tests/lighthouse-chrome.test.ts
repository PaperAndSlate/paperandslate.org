import { describe, expect, it } from "vitest";
import { withLighthouseChrome } from "../scripts/lighthouse-chrome";

describe("Lighthouse browser resolution", () => {
  it("preserves an explicit Chrome path", () => {
    expect(withLighthouseChrome({ ...process.env, CHROME_PATH: "custom-chrome" }).CHROME_PATH).toBe(
      "custom-chrome",
    );
  });

  it("maps an existing Playwright executable override to Chrome path", () => {
    const env: NodeJS.ProcessEnv = {
      ...process.env,
      PLAYWRIGHT_EXECUTABLE_PATH: process.execPath,
    };
    // The hosted browser wrapper also supplies CHROME_PATH. Keep this unit
    // test focused on the Playwright-to-Chrome fallback instead of inheriting
    // that unrelated ambient setting.
    delete env.CHROME_PATH;
    expect(withLighthouseChrome(env).CHROME_PATH).toBe(process.execPath);
  });
});
