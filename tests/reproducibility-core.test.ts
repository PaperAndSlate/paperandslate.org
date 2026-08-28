import { describe, expect, it } from "vitest";
import { equalBytes, sha256Bytes } from "../scripts/reproducibility-core";

describe("reproducibility helpers", () => {
  it("compares complete byte sequences rather than normalized text", () => {
    expect(equalBytes(new Uint8Array([1, 2]), new Uint8Array([1, 2]))).toBe(true);
    expect(equalBytes(new Uint8Array([1, 2]), new Uint8Array([1, 3]))).toBe(false);
    expect(equalBytes(new Uint8Array([1, 2]), new Uint8Array([1, 2, 0]))).toBe(false);
  });

  it("uses a stable cryptographic digest", () => {
    expect(sha256Bytes(new TextEncoder().encode("same"))).toBe(
      "0967115f2813a3541eaef77de9d9d5773f1c0c04314b0bbfe4ff3b3b1c55b5d5",
    );
  });
});
