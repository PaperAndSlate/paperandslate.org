import { describe, expect, it } from "vitest";
import jointCases from "../docs/interfaces/fixtures/data-platform-api-key-projection-v3/joint-review-cases.json";
import jointManifest from "../docs/interfaces/fixtures/data-platform-api-key-projection-v3/joint-review-manifest.json";
import {
  JOINT_CASE_SPECS,
  R_IDENTITY,
  validateJointReviewBundle,
  validateJointReviewCaseFile,
  validateRepositoryBoundaries,
} from "../scripts/developer-control-plane-projection-v3-joint-review";

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

describe("projection v3 joint-review bundle", () => {
  it("accepts the exact local candidate manifest and all 31 source-linked cases", () => {
    expect(validateJointReviewBundle(jointManifest)).toEqual([]);
    expect(validateJointReviewCaseFile(jointCases)).toEqual([]);
    expect(jointCases.cases).toHaveLength(31);
    expect(jointCases.cases.map((item) => item.id)).toEqual(
      JOINT_CASE_SPECS.map((item) => item.id),
    );
    expect(
      jointCases.cases.filter((item) => item.evidenceStatus === "blocked_external"),
    ).toHaveLength(2);
    expect(jointManifest.jointAcceptance).toBe(false);
    expect(jointManifest.dcp1bAuthority).toBe(false);
  });

  it("revalidates the bound R/T018/F/Data and historical receipt identities locally", () => {
    expect(validateRepositoryBoundaries()).toEqual([]);
    expect(jointManifest.localEvidence.r).toMatchObject({
      commit: R_IDENTITY.commit,
      parent: R_IDENTITY.parent,
      tree: R_IDENTITY.tree,
    });
    expect(jointManifest.dataDependency).toMatchObject({
      commit: "d21efabb8550578333fee5f62bf0e822fbca1394",
      tree: "5c3a56a25f4eb374e94550f89b9ed1dbd52bb66a",
      status: "producer-local-v2-only",
    });
  });

  it.each([
    ["changed T018 commit", (value: any) => (value.webContract.commit = "0".repeat(40))],
    ["changed R tree", (value: any) => (value.localEvidence.r.tree = "1".repeat(40))],
    ["changed fixture identity", (value: any) => (value.fixtureCorpus[0].sha256 = "A".repeat(64))],
    [
      "positive descriptor object",
      (value: any) => (value.contractRules.descriptor = { scheme: "sha256" }),
    ],
    [
      "string policy semantics",
      (value: any) => (value.contractRules.policyAndOrder = "string-policy-version"),
    ],
    ["unknown root field", (value: any) => (value.unexpected = true)],
    ["forbidden field name", (value: any) => (value.secret = "sentinel")],
  ])("rejects manifest bypass: %s", (_label, mutate) => {
    const mutated = clone(jointManifest) as any;
    mutate(mutated);
    expect(validateJointReviewBundle(mutated)).not.toEqual([]);
  });

  it.each([
    [
      "reordered case",
      (value: any) => ([value.cases[0], value.cases[1]] = [value.cases[1], value.cases[0]]),
    ],
    [
      "changed event expectation",
      (value: any) => (value.cases[0].expected.authorizationEffect = "allow"),
    ],
    ["changed unresolved slot", (value: any) => value.cases[0].unresolved.pop()],
    [
      "Data v2 verifier value",
      (value: any) => (value.cases[0].expected.verifierStatus = "hmac-sha256-v1"),
    ],
    [
      "live bearer sentinel",
      (value: any) => (value.cases[30].expected.redactionRule = "Bearer live-secret-sentinel"),
    ],
    ["forbidden field name", (value: any) => (value.cases[0].expected.header = "x")],
    [
      "accepted wire bytes",
      (value: any) => (value.cases[0].expected.canonicalWireStatus = "full-RFC8785-bytes"),
    ],
  ])("rejects case-file bypass: %s", (_label, mutate) => {
    const mutated = clone(jointCases) as any;
    mutate(mutated);
    expect(validateJointReviewCaseFile(mutated)).not.toEqual([]);
  });

  it.each([
    ["legacy nonnegative vocabulary", "finite-nonnegative-integer-required"],
    ["zero lower bound", "finite-positive-safe-integer-0-to-9007199254740991"],
    ["above maximum safe integer", "finite-positive-safe-integer-1-to-9007199254740992"],
    ["fractional lower bound", "finite-positive-safe-integer-1.5-to-9007199254740991"],
    ["fractional upper bound", "finite-positive-safe-integer-1-to-9007199254740991.5"],
  ])("rejects acknowledgement counter-domain bypass: %s", (_label, sequenceRule) => {
    const expected = JOINT_CASE_SPECS.find(
      (item) => item.id === "ack-noninteger-and-unknown-state-fail-closed",
    );
    expect(expected?.expected.sequenceRule).toBe(
      "finite-positive-safe-integer-1-to-9007199254740991",
    );
    const mutated = clone(jointCases) as any;
    const target = mutated.cases.find(
      (item: { id: string }) => item.id === "ack-noninteger-and-unknown-state-fail-closed",
    );
    target.expected.sequenceRule = sequenceRule;
    expect(validateJointReviewCaseFile(mutated)).not.toEqual([]);
  });

  it("keeps the two descriptor vectors blocked and the local fixture vocabulary reduced", () => {
    expect(jointManifest.localFixtureVocabulary).toMatchObject({
      projectionVersion: "absent-from-F",
      occurredAt: "absent-from-F",
      canonicalization: "restricted-canonicalFixtureJson-six-local-events-only",
      wireStatus: "full-RFC8785-bytes-pending",
    });
    expect(
      jointCases.cases.slice(0, 2).every((item) => item.evidenceStatus === "blocked_external"),
    ).toBe(true);
    expect(jointCases.cases.every((item) => item.unresolved.includes("data-t681-review"))).toBe(
      true,
    );
  });
});
