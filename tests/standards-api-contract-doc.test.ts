import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const contract = readFileSync(
  resolve(process.cwd(), "docs/interfaces/standards-registry-web-acceptance-contract.md"),
  "utf8",
);

describe("Standards Registry Web acceptance contract", () => {
  it("documents exact release maturity and owner boundaries", () => {
    expect(contract).toContain("Status: Web-owned candidate contract; not an acceptance receipt");
    expect(contract).toContain("Candidate preview");
    expect(contract).toContain("Stable/public");
    expect(contract).toContain("Docs ingestion");
    expect(contract).toContain("Registry/Data API projection");
    expect(contract).toContain("Hosted/staging");
    expect(contract).toContain("Release and production");
  });

  it("documents adapter-grounded safety fields and fail-closed behavior", () => {
    for (const field of [
      "releaseId",
      "candidateOnly",
      "public",
      "stable",
      "current",
      "publishable",
      "rightsStatus",
      "sourceLocator",
      "sourceReleaseId",
      "snapshotId",
      "manifestId",
      "STANDARDS_API_BEARER",
    ]) {
      expect(contract).toContain(field);
    }
    expect(contract).toContain("never infer relationships");
    expect(contract).toContain("returns an explicit unavailable/denied state");
    expect(contract).toContain("No fallback may mix releases");
  });
});
