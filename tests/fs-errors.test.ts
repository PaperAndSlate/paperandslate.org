import { describe, expect, it } from "vitest";
import { isMissingPathError } from "../scripts/fs-errors";

describe("filesystem error classification", () => {
  it("recognizes an absent path without requiring an Error instance", () => {
    expect(isMissingPathError({ code: "ENOENT" })).toBe(true);
  });

  it("does not suppress other filesystem failures", () => {
    expect(isMissingPathError({ code: "EACCES" })).toBe(false);
    expect(isMissingPathError(new Error("missing path"))).toBe(false);
    expect(isMissingPathError(null)).toBe(false);
  });
});
