import { describe, expect, it } from "vitest";
import { assertExactSourceRevision } from "../scripts/evidence-identity";

describe("evidence source identity", () => {
  it("accepts an exact configured revision", () => {
    expect(() =>
      assertExactSourceRevision({
        currentRevision: "abc123",
        candidateRevision: "abc123",
        context: "Lighthouse",
        kind: "configured",
      }),
    ).not.toThrow();
  });

  it("rejects a configured revision from another checkout", () => {
    expect(() =>
      assertExactSourceRevision({
        currentRevision: "abc123",
        candidateRevision: "def456",
        context: "Lighthouse",
        kind: "configured",
      }),
    ).toThrow(
      "Lighthouse GIT_SHA does not match the checked-out source: expected abc123, got def456",
    );
  });

  it("rejects missing current Git state", () => {
    expect(() =>
      assertExactSourceRevision({
        currentRevision: null,
        candidateRevision: "abc123",
        context: "Performance budgets",
        kind: "evidence",
      }),
    ).toThrow("Performance budgets requires a readable current Git source revision");
  });

  it("rejects missing evidence identity", () => {
    expect(() =>
      assertExactSourceRevision({
        currentRevision: "abc123",
        candidateRevision: undefined,
        context: "Lighthouse",
        kind: "evidence",
      }),
    ).toThrow(
      "Lighthouse evidence identity does not match the current source: expected abc123, got missing",
    );
  });
});
