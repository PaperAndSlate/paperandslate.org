import { describe, expect, it } from "vitest";
import {
  countCompletedVerificationTasks,
  isEvidenceIdentityCurrent,
} from "../scripts/evidence-bundle-core";
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

  it("rejects stale identity-bearing evidence from a current bundle", () => {
    expect(
      isEvidenceIdentityCurrent({
        value: "stale-commit",
        candidateSha: "current-commit",
        sourceSha: "current-commit",
        root: process.cwd(),
      }),
    ).toBe(false);
  });

  it("accepts identity-bearing evidence for the candidate revision", () => {
    expect(
      isEvidenceIdentityCurrent({
        value: "current-commit",
        candidateSha: "current-commit",
        sourceSha: "current-commit",
        root: process.cwd(),
      }),
    ).toBe(true);
  });

  it("counts declared verification tasks without counting evidence finalizers", () => {
    expect(
      countCompletedVerificationTasks({
        tasks: ["lint", "test", "build"],
        completed: ["lint", "test", "build", "launch:report", "evidence:bundle"],
      }),
    ).toBe(3);
  });
});
