import { describe, expect, it } from "vitest";
import { decisions, getRfc, policies } from "../packages/content/src";
describe("governance registry", () => {
  it("has a rendered RFC and decision authority", () => {
    expect(getRfc(1)?.status).toBe("accepted");
    expect(decisions[0]?.decisionMaker).toBeTruthy();
    expect(policies.every((p) => p.version && p.effectiveDate)).toBe(true);
  });
});
