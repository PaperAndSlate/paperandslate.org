import { describe, expect, it } from "vitest";
import {
  countCompletedVerificationTasks,
  isEvidenceIdentityCurrent,
} from "../scripts/evidence-bundle-core";
import {
  assertExactSourceRevision,
  hasExactCandidateIdentity,
  hasExactCurrentSourceRevision,
} from "../scripts/evidence-identity";

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

  it("rejects an evidence-only ancestor rather than converging it with the candidate", () => {
    expect(
      hasExactCandidateIdentity({
        evidenceRevision: "c57c95ed98c1a3b962f48568197089fabcf131b4",
        candidateRevision: "fcc2273b016fa76bd1b1daf32301e79c68f97522",
        currentRevision: "fcc2273b016fa76bd1b1daf32301e79c68f97522",
      }),
    ).toBe(false);
    expect(
      hasExactCurrentSourceRevision({
        evidenceRevision: "c57c95ed98c1a3b962f48568197089fabcf131b4",
        currentRevision: "fcc2273b016fa76bd1b1daf32301e79c68f97522",
      }),
    ).toBe(false);
  });

  it("requires evidence, candidate, and current revisions to agree exactly", () => {
    expect(
      hasExactCandidateIdentity({
        evidenceRevision: "da1e12b915b1babbb1f313d0a2a30c6e88e52dba",
        candidateRevision: "da1e12b915b1babbb1f313d0a2a30c6e88e52dba",
        currentRevision: "da1e12b915b1babbb1f313d0a2a30c6e88e52dba",
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
