import { describe, expect, it } from "vitest";
import { withLighthouseChrome } from "../scripts/lighthouse-chrome";

describe("Lighthouse browser resolution", () => {
  it("preserves an explicit Chrome path", () => {
    expect(withLighthouseChrome({ CHROME_PATH: "custom-chrome" }).CHROME_PATH).toBe(
      "custom-chrome",
    );
  });

  it("maps an existing Playwright executable override to Chrome path", () => {
    expect(withLighthouseChrome({ PLAYWRIGHT_EXECUTABLE_PATH: process.execPath }).CHROME_PATH).toBe(
      process.execPath,
    );
  });
});
