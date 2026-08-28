import { describe, expect, it } from "vitest";
import { validateLicensePolicy } from "../scripts/license-check";

const validFiles = {
  LICENSE: "Apache License\nVersion 2.0",
  "LICENSE-DOCS.md": "CC BY 4.0",
  NOTICE: "Paper & Slate",
  "TRADEMARKS.md": "marks are reserved",
};

describe("license policy", () => {
  it("accepts the repository notice and private package contract", () => {
    expect(
      validateLicensePolicy({
        rootFiles: validFiles,
        packages: [{ path: "packages/example/package.json", private: true, license: "Apache-2.0" }],
      }),
    ).toEqual([]);
  });

  it("rejects missing notices and publishable package metadata", () => {
    const errors = validateLicensePolicy({
      rootFiles: { ...validFiles, NOTICE: "" },
      packages: [{ path: "packages/example/package.json", private: false, license: "MIT" }],
    });
    expect(errors).toEqual(
      expect.arrayContaining([
        "NOTICE must identify Paper & Slate",
        "packages/example/package.json must remain private until publication is authorized",
        "packages/example/package.json must declare license Apache-2.0",
      ]),
    );
  });
});
