import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const contract = readFileSync(
  resolve(process.cwd(), "docs/interfaces/standards-registry-web-final-integration-acceptance.md"),
  "utf8",
);

describe("final Standards Registry/Data to Web acceptance contract", () => {
  it("defines the packet identity and every projection gate", () => {
    for (const term of [
      "One immutable packet identity",
      "Source import and docs ingestion",
      "Search and item detail",
      "Framework and source detail",
      "Coverage",
      "Concepts/crosswalks",
      "Comparison/changes",
      "Readiness/downloads",
      "A-to-B-to-A rollback",
      "Hosted, staging, release, and production gates",
    ]) {
      expect(contract).toContain(term);
    }
  });

  it("keeps maturity, ownership, and acceptance fail-closed", () => {
    for (const term of [
      "Planned/Experimental",
      "candidate-only",
      "A content hash or snapshot is not Git identity",
      "No response may mix releases",
      "No owner may accept another owner's gate by inference",
      "Unresolved owner questions",
      "no gate is accepted",
    ]) {
      expect(contract.replace(/\s+/g, " ")).toContain(term);
    }
  });
});
