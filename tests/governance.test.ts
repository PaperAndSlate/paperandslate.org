import { describe, expect, it } from "vitest";
import { decisions, filterRfcs, getRfc, policies, rfcs } from "../packages/content/src";
describe("governance registry", () => {
  it("has a rendered RFC and decision authority", () => {
    expect(getRfc(1)).toMatchObject({
      status: "accepted",
      authors: ["Paper & Slate maintainers"],
      sponsor: "Paper & Slate maintainers",
      scope: "Foundation-wide",
      year: 2026,
    });
    expect(decisions[0]?.decisionMaker).toBeTruthy();
    expect(decisions[0]?.relatedRfc).toBe(1);
    expect(
      policies.every(
        (policy) =>
          policy.version &&
          policy.effectiveDate &&
          policy.owner &&
          policy.lastReviewed &&
          Array.isArray(policy.revisionHistory),
      ),
    ).toBe(true);
  });

  it("filters RFCs by lifecycle metadata without collapsing scope fields", () => {
    expect(filterRfcs(rfcs, { q: "stable identifiers" })).toHaveLength(1);
    expect(filterRfcs(rfcs, { status: "accepted" })).toHaveLength(1);
    expect(filterRfcs(rfcs, { project: "missing-project" })).toHaveLength(0);
  });
});
