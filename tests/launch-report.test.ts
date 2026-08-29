import { describe, expect, it } from "vitest";
import { requirementsCheckFromReport } from "../scripts/launch-report";

describe("launch requirements evidence", () => {
  it("does not pass while substantive requirements are partial or blocked", () => {
    const result = requirementsCheckFromReport({
      requirements: [
        { category: "traceability", status: "verified-local" },
        { category: "implementation", status: "verified-local" },
        { category: "implementation", status: "partial" },
        { category: "implementation", status: "blocked-external" },
        { category: "implementation", status: "human-approval-pending" },
      ],
    });

    expect(result.status).toBe("pending");
    expect(result.detail).toContain("3 remain unresolved");
  });

  it("passes only when every substantive requirement is accepted or not applicable", () => {
    const result = requirementsCheckFromReport({
      requirements: [
        { category: "traceability", status: "verified-local" },
        { category: "implementation", status: "verified-local" },
        { category: "implementation", status: "verified-ci" },
        { category: "implementation", status: "verified-staging" },
        { category: "implementation", status: "not-applicable" },
      ],
    });

    expect(result.status).toBe("passed");
    expect(result.detail).toContain("0 remain unresolved");
  });
});
