import { describe, expect, it } from "vitest";
import { validateTraceability } from "../scripts/traceability-check-core";

const root = "C:/repo";
const validRecord = {
  id: "PLAN-REQ-1",
  sourcePlanPath: "plans/README.md",
  sourceSection: "Overview",
  requirement: "Index-only traceability record for this planning source section.",
  status: "not-applicable",
  implementationFiles: [],
  tests: [],
  verificationCommands: ["pnpm traceability:check"],
  generatedEvidence: [".generated/requirements/traceability-check.json"],
  notes: "Index row only.",
};

describe("validateTraceability", () => {
  it("accepts a mapped plan index row", () => {
    expect(validateTraceability([validRecord], ["plans/README.md"], root)).toEqual([]);
  });

  it("rejects duplicate IDs and unmapped plan files", () => {
    const errors = validateTraceability(
      [validRecord, validRecord],
      ["plans/README.md", "plans/other.md"],
      root,
    );
    expect(errors).toContain("duplicate requirement ID: PLAN-REQ-1");
    expect(errors).toContain("plan file is not mapped by a PLAN-REQ row: plans/other.md");
  });

  it("rejects verified records with unsafe or incomplete evidence", () => {
    const errors = validateTraceability(
      [
        {
          id: "WEB-REQ-1",
          sourcePlanPath: "master implementation brief",
          sourceSection: "Quality",
          requirement: "A check exists.",
          status: "verified-local",
          implementationFiles: ["../outside.ts"],
          tests: [],
          verificationCommands: [],
          generatedEvidence: [],
        },
        validRecord,
      ],
      ["plans/README.md"],
      root,
    );
    expect(errors).toContain("WEB-REQ-1.implementationFiles escapes the repository: ../outside.ts");
    expect(errors).toContain("WEB-REQ-1 verified status has no tests or verification commands");
    expect(errors).toContain("WEB-REQ-1 verified status has no generated evidence");
  });
});
