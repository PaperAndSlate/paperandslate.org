import { describe, expect, it } from "vitest";
import { integrityToCycloneDxHash } from "../scripts/sbom-core";

const digest = Buffer.alloc(64, 0xab).toString("base64");

describe("SBOM integrity conversion", () => {
  it("converts npm SHA-512 SRI to a 128-character hexadecimal digest", () => {
    expect(integrityToCycloneDxHash(`sha512-${digest}`)).toEqual({
      alg: "SHA-512",
      content: "ab".repeat(64),
    });
  });

  it.each(["sha256-abc", "sha512-not-base64!", "sha512-YQ=="])(
    "rejects unsupported or invalid integrity %s",
    (integrity) => {
      expect(() => integrityToCycloneDxHash(integrity)).toThrow(/integrity/);
    },
  );
});
