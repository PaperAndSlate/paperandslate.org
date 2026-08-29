import { describe, expect, it } from "vitest";
import {
  assertHostedStagingOrigin,
  assertResponseOrigin,
  HOSTED_STAGING_ORIGIN,
} from "../scripts/hosted-origin";

describe("hosted evidence origin binding", () => {
  it("accepts the exact staging origin and rejects sibling or credential-bearing URLs", () => {
    expect(assertHostedStagingOrigin(HOSTED_STAGING_ORIGIN, "target")).toBe(HOSTED_STAGING_ORIGIN);
    expect(() => assertHostedStagingOrigin("https://other.dev.tower", "target")).toThrow();
    expect(() =>
      assertHostedStagingOrigin("https://user:pass@paper-and-slate-web.dev.tower", "target"),
    ).toThrow();
    expect(() => assertHostedStagingOrigin(`${HOSTED_STAGING_ORIGIN}/health`, "target")).toThrow();
  });

  it("rejects a final response URL outside the expected origin", () => {
    expect(
      assertResponseOrigin(`${HOSTED_STAGING_ORIGIN}/health`, HOSTED_STAGING_ORIGIN, "health")
        .pathname,
    ).toBe("/health");
    expect(() =>
      assertResponseOrigin("https://attacker.example/health", HOSTED_STAGING_ORIGIN, "health"),
    ).toThrow(/redirect outside/);
  });
});
