import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import {
  CLOSED_EVENT_TYPES,
  DATA_T681_IDENTITY,
  FAILURE_CASE_IDS,
  ACKNOWLEDGEMENT_CASE_IDS,
  ADAPTER_CASE_IDS,
  T018_IDENTITY,
  validateEventCase,
  validateFixtureCollection,
  validateManifest,
} from "../packages/developer-control-plane/src/projection-v3-readiness";

type JsonRecord = Record<string, unknown>;

const ROOT = process.cwd();
const FIXTURE_ROOT = "docs/interfaces/fixtures/data-platform-api-key-projection-v3";
const JOINT_MANIFEST_PATH = `${FIXTURE_ROOT}/joint-review-manifest.json`;
const JOINT_CASES_PATH = `${FIXTURE_ROOT}/joint-review-cases.json`;
const SCHEMA_PATH = "docs/interfaces/data-platform-api-key-projection-v3-joint-review.schema.json";

export const F_IDENTITY = {
  commit: "83548d8fdd636f3ceb222036ad115983401ce0fb",
  parent: "38449c320e0fbaec1dba38f56c0f9570384f8b60",
  tree: "42bd3051e2196c32f640e0ef032af6cd2519d851",
  diffPaths: [
    `${FIXTURE_ROOT}/acknowledgement-replay-cases.json`,
    `${FIXTURE_ROOT}/adapter-cases.json`,
    `${FIXTURE_ROOT}/event-cases.json`,
    `${FIXTURE_ROOT}/failure-redaction-cases.json`,
    `${FIXTURE_ROOT}/manifest.json`,
    "packages/developer-control-plane/src/projection-v3-readiness.ts",
    "scripts/developer-control-plane-projection-v3-readiness.ts",
    "tests/developer-control-plane-projection-v3-readiness.test.ts",
  ],
} as const;

export const R_IDENTITY = {
  commit: "52e120253c60047f4eadec30dafb5fa7981ac947",
  parent: F_IDENTITY.commit,
  tree: "5d517f9ba396acffaa81ed01325f237a4acfd92f",
  diffPaths: [
    "packages/developer-control-plane/src/projection-v3-readiness.ts",
    "tests/developer-control-plane-projection-v3-readiness.test.ts",
  ],
} as const;

const RECEIPT_HASHES = {
  historicalBlockedT020: "CF67A0792F2CC4E3898D24A48EC7D2520D9CEAD72DA0B9DF11E5773873B17D49",
  t020Completion: "5354FDBD752ABBFDB51F44AE20EA11B80391EFA5FDB8C5D29984AEBB3225FC4D",
  t021: "163F35E1354E73C08F15EE0206E8B451CD7275F15058251CB2B25E9EA54474C4",
  t022: "86DE210F82FE291BF0806F5EAD264317936C56A23567DA50A6FA49768FA2EF8E",
} as const;

const T018_FILES = [
  {
    path: "plans/13-developer-control-plane/01-foundation-and-interface-contract.md",
    blob: "2bce690dacd927af5742872c6a69f8a6633a3bf2",
    sha256: "36B2F1A4C66D1FEE8754EB47AC49B3BDCF823CD3C2375FC6C333A098C96EC5BB",
  },
  {
    path: "plans/11-implementation/01-phased-implementation-plan.md",
    blob: "6be1cbcbdc04eb5f117a3c21bafe2276c7c1a62e",
    sha256: "63EAB6D1B69BA1C7EE9FC94C4EF85AC62D0C5822A53B1BBF6AFE71CF412FF4BD",
  },
  {
    path: "docs/decisions/ADR-0016-developer-control-plane-projection-and-verifier-contract.md",
    blob: "a9de1e96308c39923ffbdcec3db210d87c139efd",
    sha256: "2F8CA59E6A8AF28F1DAF7524AB2DCEC461F2E401C98163FB527F6A3564D93D13",
  },
  {
    path: "docs/interfaces/data-platform-api-key-projection-v3-web-proposal.md",
    blob: "d3eda869a30a5af235f916f5bd982fdeb2cb70e0",
    sha256: "BC3F7942AA2368C3D50068F1EE6ACD536AEFA14599EEB43EFD619C1E3539F4F0",
  },
] as const;

const T020_FIXTURES = [
  {
    path: `${FIXTURE_ROOT}/manifest.json`,
    blob: "25b2ac777cf3ccb3a67a3170038adaa68776b0f4",
    sha256: "716EC2E23E17FD3F603ED509FE0122665AB43934641B7309EFFFBDD88FAC2167",
  },
  {
    path: `${FIXTURE_ROOT}/adapter-cases.json`,
    blob: "43dc34320d0f89d2cb6b1f7de0cf2b2ff94fc776",
    sha256: "D0CD1A6F093C1CC4DB9C4D7B6CE53F519B80DACEB9F0E6235ECE15D974E708E3",
  },
  {
    path: `${FIXTURE_ROOT}/event-cases.json`,
    blob: "2b09662ab3db2d58f05d3b44baa59cf9601c2af0",
    sha256: "C21876A364980C349AAE3DFC863A083F3DED68B678260809969050568FE6F950",
  },
  {
    path: `${FIXTURE_ROOT}/acknowledgement-replay-cases.json`,
    blob: "29afb740633a037d2a17191ab05dd82cb9f461f3",
    sha256: "BA95726D69F0A56E1D3F9C93D091BEDE3798539DA03AA1E37C3C60EC2E010D2B",
  },
  {
    path: `${FIXTURE_ROOT}/failure-redaction-cases.json`,
    blob: "1686ac5a96c0f621d0730e8b5b9fc0f8a227ab95",
    sha256: "174D57B2A1F9484F9752353C24520AF0236E2E966658EDB32C0C597B01C55AD6",
  },
] as const;

const MANIFEST_KEYS = [
  "schemaVersion",
  "evidenceClass",
  "contractStatus",
  "jointAcceptance",
  "dcp1bAuthority",
  "webContract",
  "localEvidence",
  "dataDependency",
  "fixtureCorpus",
  "jointCaseFile",
  "localFixtureVocabulary",
  "contractRules",
  "jointOwnership",
  "unresolvedInputs",
  "authorityDenials",
] as const;

const LOCAL_ENVELOPE_FIELDS = [
  "committed_at",
  "event_id",
  "event_type",
  "key_id",
  "organization_id",
  "organization_sequence",
  "payload",
  "policy_version",
  "project_id",
] as const;

const AUTHORITY_DENIALS = [
  "no-final-verifier-scheme",
  "no-final-key-format",
  "no-provider-activation",
  "no-transport-or-secret-binding",
  "no-live-database-or-network",
  "no-Data-v2-semantic-adoption",
  "no-DCP-1B-or-production-acceptance",
  "no-relabeling-F-as-wire-acceptance",
] as const;

const JOINT_OWNERSHIP = [
  {
    evidence:
      "producer lifecycle, project binding, policy/order, idempotency, redaction, and compensation",
    producer: "Web",
    acceptanceOwners: ["Web", "Data", "Security", "Privacy", "Operations"],
  },
  {
    evidence:
      "ordered application, verifier binding after approval, acknowledgement, watermark, and usage denial",
    producer: "Data",
    acceptanceOwners: ["Data", "Web", "Security", "Operations"],
  },
  {
    evidence:
      "provider lifecycle, portable descriptor feasibility, binding, rotation, and availability",
    producer: "Provider",
    acceptanceOwners: ["Provider", "Web", "Security", "Operations"],
  },
  {
    evidence: "scheme registry, comparison behavior, malformed handling, and failure boundaries",
    producer: "Security",
    acceptanceOwners: ["Security", "Web", "Data"],
  },
  {
    evidence: "field minimization, retention, deletion, telemetry, and evidence redaction",
    producer: "Privacy",
    acceptanceOwners: ["Privacy", "Web", "Security"],
  },
  {
    evidence: "authenticated delivery, credential references, limits, monitoring, and rollback",
    producer: "Operations",
    acceptanceOwners: ["Operations", "Web", "Data", "Security"],
  },
] as const;

const UNRESOLVED_INPUTS = [
  {
    id: "provider-registry",
    status: "pending",
    owner: "Provider plus Web",
    requiredEvidence:
      "Better Auth lifecycle and project-binding receipt with portable descriptor feasibility, compensation, and availability",
  },
  {
    id: "security-registry",
    status: "pending",
    owner: "Security",
    requiredEvidence:
      "approved opaque scheme registry, comparison boundary, malformed handling, rotation, and failure receipt",
  },
  {
    id: "wire-canonical-bytes",
    status: "pending",
    owner: "Web plus Data",
    requiredEvidence:
      "full wire envelope with occurred_at, RFC 8785 bytes and digest, and exact lifecycle mapping",
  },
  {
    id: "quarantine-reason-codes",
    status: "pending",
    owner: "Data plus Security",
    requiredEvidence:
      "closed acknowledgement outcomes, reason registry, replay, gap, rollback, freshness, and unknown handling",
  },
  {
    id: "authenticated-acknowledgement",
    status: "pending",
    owner: "Operations plus Data",
    requiredEvidence:
      "authenticated acknowledgement integrity, at-least-once delivery, limits, dead-letter handling, and monitoring",
  },
  {
    id: "transport-credential-binding",
    status: "pending",
    owner: "Operations plus Security",
    requiredEvidence:
      "managed credential references, workload identity, rotation, least privilege, and cleanup evidence",
  },
  {
    id: "joint-owner-receipts",
    status: "pending",
    owner: "Web, Data, Provider, Security, Privacy, Operations",
    requiredEvidence:
      "joint fixtures for lifecycle, ordering, duplicate, replay, compensation, disable, redaction, and acknowledgement cases",
  },
  {
    id: "data-t681-review",
    status: "pending",
    owner: "Data",
    requiredEvidence:
      "fresh T681 compatibility review bound to T023 and the unchanged producer-local identity",
  },
] as const;

const SAFE_NEGATIVE_STRINGS = new Set([
  "no-transport-or-secret-binding",
  "no-one-time-or-session-header-data",
  "no-sensitive-fields",
  "no-live-database-or-network",
  "no-Data-v2-semantic-adoption",
]);

const FORBIDDEN_KEYS = /^(authorization|bearer|header|material|plaintext|secret|session|token)$/i;
const POSITIVE_DESCRIPTOR_KEYS =
  /^(scheme|schemeVersion|key_ref|keyRef|encodedBytes|canonicalBytes|canonicalDigest)$/i;
const SENSITIVE_VALUE =
  /(?:\bBearer\s+\S+|live[-_ ]?secret[-_ ]?sentinel|t020[-_ ]?[a-z0-9-]*sentinel|fixture[-_ ]?key[-_ ]?ref|hmac-sha256-v1)/i;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function exactKeys(value: JsonRecord, expected: readonly string[]) {
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  return actual.length === wanted.length && actual.every((key, index) => key === wanted[index]);
}

function deepEqual(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) return true;
  if (Array.isArray(left) || Array.isArray(right)) {
    return (
      Array.isArray(left) &&
      Array.isArray(right) &&
      left.length === right.length &&
      left.every((item, index) => deepEqual(item, right[index]))
    );
  }
  if (isRecord(left) || isRecord(right)) {
    if (!isRecord(left) || !isRecord(right)) return false;
    const leftKeys = Object.keys(left).sort();
    const rightKeys = Object.keys(right).sort();
    return (
      deepEqual(leftKeys, rightKeys) && leftKeys.every((key) => deepEqual(left[key], right[key]))
    );
  }
  return false;
}

function readJson(relativePath: string): unknown {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8")) as unknown;
}

function sha256File(relativePath: string) {
  return createHash("sha256")
    .update(fs.readFileSync(path.join(ROOT, relativePath)))
    .digest("hex")
    .toUpperCase();
}

function git(args: string[]): string | null {
  try {
    return execFileSync("git", args, {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return null;
  }
}

function pushError(errors: string[], condition: boolean, message: string) {
  if (!condition) errors.push(message);
}

function validateNoSensitiveBundleData(value: unknown, location: string, errors: string[]) {
  if (typeof value === "string") {
    if (!SAFE_NEGATIVE_STRINGS.has(value) && SENSITIVE_VALUE.test(value))
      errors.push(`${location} contains a sensitive fixture value`);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) =>
      validateNoSensitiveBundleData(item, `${location}[${index}]`, errors),
    );
    return;
  }
  if (!isRecord(value)) return;
  for (const [key, child] of Object.entries(value)) {
    if (FORBIDDEN_KEYS.test(key)) errors.push(`${location}.${key} is a forbidden field name`);
    if (POSITIVE_DESCRIPTOR_KEYS.test(key))
      errors.push(`${location}.${key} would bind positive verifier or canonical material`);
    if (key === "policy_version" && typeof child === "string")
      errors.push(`${location}.${key} must not use string policy semantics`);
    validateNoSensitiveBundleData(child, `${location}.${key}`, errors);
  }
}

function validateFileIdentities(
  value: unknown,
  expected: readonly { path: string; blob: string; sha256: string }[],
  label: string,
  errors: string[],
) {
  pushError(errors, Array.isArray(value), `${label} is not an array`);
  if (!Array.isArray(value)) return;
  pushError(
    errors,
    deepEqual(value, expected),
    `${label} does not match the immutable identity list`,
  );
}

function validateCommitIdentity(
  value: unknown,
  expected: { commit: string; parent: string; tree: string; diffPaths: readonly string[] },
  label: string,
  errors: string[],
) {
  if (!isRecord(value)) {
    errors.push(`${label} is not an object`);
    return;
  }
  if (!exactKeys(value, ["commit", "parent", "tree", "diffPaths"]))
    errors.push(`${label} fields are not exact`);
  if (!deepEqual(value, expected)) errors.push(`${label} does not match the pinned identity`);
}

function validateManifestShape(value: unknown, errors: string[]) {
  if (!isRecord(value)) {
    errors.push("joint-review manifest is not an object");
    return;
  }
  if (!exactKeys(value, MANIFEST_KEYS)) errors.push("joint-review manifest fields are not exact");
  pushError(errors, value.schemaVersion === "1.0.0", "joint-review schema version is invalid");
  pushError(
    errors,
    value.evidenceClass === "development-local-joint-review-candidate",
    "joint-review evidence class is invalid",
  );
  pushError(
    errors,
    value.contractStatus === "T018-Proposed-local-identity-only",
    "joint-review contract status is not Proposed-only",
  );
  pushError(errors, value.jointAcceptance === false, "joint acceptance must remain false");
  pushError(errors, value.dcp1bAuthority === false, "DCP-1B authority must remain false");

  if (!isRecord(value.webContract)) errors.push("webContract is not an object");
  else {
    if (!exactKeys(value.webContract, ["projectionVersion", "commit", "tree", "files"]))
      errors.push("webContract fields are not exact");
    pushError(
      errors,
      value.webContract.projectionVersion === "3.0.0",
      "projection version is invalid",
    );
    pushError(errors, value.webContract.commit === T018_IDENTITY.commit, "T018 commit is invalid");
    pushError(errors, value.webContract.tree === T018_IDENTITY.tree, "T018 tree is invalid");
    validateFileIdentities(value.webContract.files, T018_FILES, "T018 file identity", errors);
  }

  if (!isRecord(value.localEvidence)) errors.push("localEvidence is not an object");
  else {
    if (!exactKeys(value.localEvidence, ["f", "r", "receipts"]))
      errors.push("localEvidence fields are not exact");
    validateCommitIdentity(value.localEvidence.f, F_IDENTITY, "F identity", errors);
    validateCommitIdentity(value.localEvidence.r, R_IDENTITY, "R identity", errors);
    if (!isRecord(value.localEvidence.receipts))
      errors.push("receipt identity map is not an object");
    else {
      if (!exactKeys(value.localEvidence.receipts, Object.keys(RECEIPT_HASHES)))
        errors.push("receipt identity fields are not exact");
      if (!deepEqual(value.localEvidence.receipts, RECEIPT_HASHES))
        errors.push("receipt identity map changed");
    }
  }

  if (!isRecord(value.dataDependency)) errors.push("dataDependency is not an object");
  else {
    if (!exactKeys(value.dataDependency, ["commit", "tree", "status", "resumeReview"]))
      errors.push("dataDependency fields are not exact");
    pushError(
      errors,
      value.dataDependency.commit === DATA_T681_IDENTITY.commit,
      "Data T681 commit is invalid",
    );
    pushError(
      errors,
      value.dataDependency.tree === DATA_T681_IDENTITY.tree,
      "Data T681 tree is invalid",
    );
    pushError(
      errors,
      value.dataDependency.status === "producer-local-v2-only",
      "Data evidence status is invalid",
    );
    pushError(
      errors,
      value.dataDependency.resumeReview === "fresh-T681-review-after-T023",
      "Data resume review is invalid",
    );
  }

  validateFileIdentities(value.fixtureCorpus, T020_FIXTURES, "T020 fixture identity", errors);
  pushError(
    errors,
    value.jointCaseFile === "joint-review-cases.json",
    "joint case file reference is invalid",
  );

  if (!isRecord(value.localFixtureVocabulary))
    errors.push("localFixtureVocabulary is not an object");
  else {
    if (
      !exactKeys(value.localFixtureVocabulary, [
        "envelopeFields",
        "projectionVersion",
        "occurredAt",
        "canonicalization",
        "wireStatus",
      ])
    )
      errors.push("localFixtureVocabulary fields are not exact");
    pushError(
      errors,
      deepEqual(value.localFixtureVocabulary.envelopeFields, LOCAL_ENVELOPE_FIELDS),
      "local envelope fields changed",
    );
    pushError(
      errors,
      value.localFixtureVocabulary.projectionVersion === "absent-from-F",
      "F projection field boundary changed",
    );
    pushError(
      errors,
      value.localFixtureVocabulary.occurredAt === "absent-from-F",
      "F occurred_at boundary changed",
    );
    pushError(
      errors,
      value.localFixtureVocabulary.canonicalization ===
        "restricted-canonicalFixtureJson-six-local-events-only",
      "local canonicalization status changed",
    );
    pushError(
      errors,
      value.localFixtureVocabulary.wireStatus === "full-RFC8785-bytes-pending",
      "wire evidence was prematurely accepted",
    );
  }

  if (!isRecord(value.contractRules)) errors.push("contractRules is not an object");
  else {
    if (
      !exactKeys(value.contractRules, [
        "counterRange",
        "policyAndOrder",
        "events",
        "scopes",
        "rotation",
        "acknowledgement",
        "descriptor",
      ])
    )
      errors.push("contractRules fields are not exact");
    pushError(
      errors,
      value.contractRules.counterRange === "finite-positive-safe-integer-1-to-9007199254740991",
      "counter range changed",
    );
    pushError(
      errors,
      value.contractRules.policyAndOrder === "policy_version-distinct-from-organization_sequence",
      "policy/order distinction changed",
    );
    pushError(
      errors,
      deepEqual(value.contractRules.events, CLOSED_EVENT_TYPES),
      "closed event set changed",
    );
    pushError(
      errors,
      value.contractRules.scopes ===
        "bulk:read,data:read,geometry:read,provenance:read-sorted;empty-only-policy-change",
      "scope rule changed",
    );
    pushError(
      errors,
      value.contractRules.rotation === "exactly-86400-seconds-exclusive-boundary",
      "rotation rule changed",
    );
    pushError(
      errors,
      value.contractRules.acknowledgement ===
        "durable-before-return-exact-duplicate-bytes-mismatch-quarantine",
      "acknowledgement rule changed",
    );
    pushError(
      errors,
      value.contractRules.descriptor === "opaque-versioned-non-plaintext-unbound",
      "descriptor was bound",
    );
  }

  pushError(
    errors,
    deepEqual(value.jointOwnership, JOINT_OWNERSHIP),
    "joint ownership records changed",
  );
  pushError(
    errors,
    deepEqual(value.unresolvedInputs, UNRESOLVED_INPUTS),
    "unresolved input records changed",
  );
  pushError(
    errors,
    deepEqual(value.authorityDenials, AUTHORITY_DENIALS),
    "authority denials changed",
  );
  validateNoSensitiveBundleData(value, "joint-review manifest", errors);
}

type JointCase = {
  id: string;
  kind: string;
  sourceCollection: string;
  sourceCaseId: string;
  evidenceStatus: string;
  producerOwner: string;
  acceptanceOwners: readonly string[];
  expected: JsonRecord;
  unresolved: readonly string[];
};

function eventCase(
  id: string,
  evidenceStatus: string,
  acceptanceOwners: readonly string[],
  expected: JsonRecord,
  unresolved: readonly string[],
): JointCase {
  return {
    id,
    kind: "event",
    sourceCollection: "v3-events",
    sourceCaseId: id,
    evidenceStatus,
    producerOwner: "Web",
    acceptanceOwners,
    expected,
    unresolved,
  };
}

function adapterCase(
  id: string,
  acceptanceOwners: readonly string[],
  expected: JsonRecord,
  unresolved: readonly string[],
): JointCase {
  return {
    id: `adapter-${id}`,
    kind: "adapter",
    sourceCollection: "web-adapter-boundary",
    sourceCaseId: id,
    evidenceStatus: "local-structural-candidate",
    producerOwner: "Web",
    acceptanceOwners,
    expected,
    unresolved,
  };
}

function acknowledgementCase(
  id: string,
  acceptanceOwners: readonly string[],
  expected: JsonRecord,
  unresolved: readonly string[],
): JointCase {
  return {
    id: `ack-${id}`,
    kind: "acknowledgement",
    sourceCollection: "acknowledgement-and-replay",
    sourceCaseId: id,
    evidenceStatus: "local-structural-candidate",
    producerOwner: "Data",
    acceptanceOwners,
    expected,
    unresolved,
  };
}

function failureCase(
  id: string,
  acceptanceOwners: readonly string[],
  expected: JsonRecord,
  unresolved: readonly string[],
): JointCase {
  return {
    id: `failure-${id}`,
    kind: "failure",
    sourceCollection: "failure-and-redaction",
    sourceCaseId: id,
    evidenceStatus: "local-structural-candidate",
    producerOwner: "Web",
    acceptanceOwners,
    expected,
    unresolved,
  };
}

export const JOINT_CASE_SPECS: readonly JointCase[] = [
  eventCase(
    "event-key.verifier_published",
    "blocked_external",
    ["Web", "Provider", "Security", "Data"],
    {
      authorizationEffect: "publish-unbound",
      localEvidence: "blocked_external",
      canonicalWireStatus: "pending-provider-security-wire",
      verifierStatus: "unbound",
      sequenceRule: "organization-sequence-1-policy-1",
      policyRule: "numeric-policy-distinct-from-order",
    },
    ["provider-registry", "security-registry", "wire-canonical-bytes", "data-t681-review"],
  ),
  eventCase(
    "event-key.rotated",
    "blocked_external",
    ["Web", "Provider", "Security", "Data"],
    {
      authorizationEffect: "replace-with-exact-24-hour-overlap-unbound",
      localEvidence: "blocked_external",
      canonicalWireStatus: "pending-provider-security-wire",
      verifierStatus: "unbound",
      sequenceRule: "organization-sequence-2-policy-2",
      policyRule: "numeric-policy-distinct-from-order",
    },
    ["provider-registry", "security-registry", "wire-canonical-bytes", "data-t681-review"],
  ),
  eventCase(
    "event-key.revoked",
    "local-structural-candidate",
    ["Web", "Security", "Data"],
    {
      authorizationEffect: "immediate-deny",
      localEvidence: "local-structural-candidate",
      canonicalWireStatus: "restricted-fixture-only",
      verifierStatus: "unbound",
      sequenceRule: "organization-sequence-3-policy-3",
      policyRule: "numeric-policy-distinct-from-order",
    },
    ["security-registry", "wire-canonical-bytes", "data-t681-review"],
  ),
  eventCase(
    "event-key.policy_changed",
    "local-structural-candidate",
    ["Web", "Security", "Data", "Privacy"],
    {
      authorizationEffect: "replace-sorted-scope-policy",
      localEvidence: "local-structural-candidate",
      canonicalWireStatus: "restricted-fixture-only",
      verifierStatus: "unbound",
      sequenceRule: "organization-sequence-4-policy-4",
      policyRule: "numeric-policy-distinct-from-order",
    },
    ["security-registry", "wire-canonical-bytes", "data-t681-review"],
  ),
  eventCase(
    "event-project.activated",
    "local-structural-candidate",
    ["Web", "Data", "Security"],
    {
      authorizationEffect: "allow-bound-project",
      localEvidence: "local-structural-candidate",
      canonicalWireStatus: "restricted-fixture-only",
      verifierStatus: "unbound",
      sequenceRule: "organization-sequence-5-policy-5",
      policyRule: "numeric-policy-distinct-from-order",
    },
    ["wire-canonical-bytes", "data-t681-review"],
  ),
  eventCase(
    "event-project.disabled",
    "local-structural-candidate",
    ["Web", "Data", "Security"],
    {
      authorizationEffect: "deny-project-descendants",
      localEvidence: "local-structural-candidate",
      canonicalWireStatus: "restricted-fixture-only",
      verifierStatus: "unbound",
      sequenceRule: "organization-sequence-6-policy-6",
      policyRule: "numeric-policy-distinct-from-order",
    },
    ["wire-canonical-bytes", "data-t681-review"],
  ),
  eventCase(
    "event-organization.disabled",
    "local-structural-candidate",
    ["Web", "Data", "Security", "Privacy"],
    {
      authorizationEffect: "deny-organization-descendants",
      localEvidence: "local-structural-candidate",
      canonicalWireStatus: "restricted-fixture-only",
      verifierStatus: "unbound",
      sequenceRule: "organization-sequence-7-policy-7",
      policyRule: "numeric-policy-distinct-from-order",
    },
    ["wire-canonical-bytes", "data-t681-review"],
  ),
  eventCase(
    "event-projection.heartbeat",
    "local-structural-candidate",
    ["Web", "Data", "Operations"],
    {
      authorizationEffect: "observe-watermark-only",
      localEvidence: "local-structural-candidate",
      canonicalWireStatus: "restricted-fixture-only",
      verifierStatus: "unbound",
      sequenceRule: "organization-sequence-8-policy-7",
      policyRule: "numeric-policy-distinct-from-order",
    },
    ["wire-canonical-bytes", "data-t681-review", "authenticated-acknowledgement"],
  ),
  adapterCase(
    "project-binding-authoritative",
    ["Web", "Provider", "Security", "Data"],
    {
      webBoundary: "separate-project-record-is-authoritative",
      dataBoundary: "not-yet-bound",
      providerBoundary: "provider-reference-cannot-authorize",
      compensationBoundary: "not-applicable",
      overlapRule: "not-applicable",
      revokeRule: "organization-mismatch-deny",
    },
    ["provider-registry", "data-t681-review"],
  ),
  adapterCase(
    "create-show-once-redaction",
    ["Web", "Provider", "Security", "Privacy"],
    {
      webBoundary: "first-display-only-metadata-afterward",
      dataBoundary: "not-yet-bound",
      providerBoundary: "volatile-test-only",
      compensationBoundary: "no-persistence-of-display-value",
      overlapRule: "not-applicable",
      revokeRule: "not-applicable",
    },
    ["provider-registry", "security-registry", "data-t681-review"],
  ),
  adapterCase(
    "list-metadata-only",
    ["Web", "Privacy", "Security"],
    {
      webBoundary: "project-bound-list",
      dataBoundary: "not-yet-bound",
      providerBoundary: "no-provider-read",
      compensationBoundary: "metadata-only",
      overlapRule: "not-applicable",
      revokeRule: "display-absent",
    },
    ["provider-registry", "data-t681-review"],
  ),
  adapterCase(
    "exact-command-retry",
    ["Web", "Data", "Operations", "Security"],
    {
      webBoundary: "same-command-and-bytes-reuse-outcome",
      dataBoundary: "replay-safe",
      providerBoundary: "provider-call-not-repeated",
      compensationBoundary: "original-redacted-outcome",
      overlapRule: "not-applicable",
      revokeRule: "not-applicable",
    },
    ["authenticated-acknowledgement", "data-t681-review"],
  ),
  adapterCase(
    "mismatched-command-retry-fail-closed",
    ["Web", "Data", "Security"],
    {
      webBoundary: "mismatched-command-fail-closed",
      dataBoundary: "no-state-mutation",
      providerBoundary: "provider-call-not-repeated",
      compensationBoundary: "mismatch-quarantine",
      overlapRule: "not-applicable",
      revokeRule: "not-applicable",
    },
    ["authenticated-acknowledgement", "data-t681-review"],
  ),
  adapterCase(
    "provider-failure-no-event",
    ["Web", "Provider", "Operations", "Security"],
    {
      webBoundary: "fail-closed",
      dataBoundary: "no-event",
      providerBoundary: "provider-failure",
      compensationBoundary: "no-outbox-no-display",
      overlapRule: "not-applicable",
      revokeRule: "not-applicable",
    },
    ["provider-registry", "data-t681-review"],
  ),
  adapterCase(
    "provider-success-web-failure-no-reveal",
    ["Web", "Provider", "Operations", "Security", "Privacy"],
    {
      webBoundary: "fail-closed-no-display",
      dataBoundary: "no-publish-before-control-commit",
      providerBoundary: "provider-success-orphan-recoverable",
      compensationBoundary: "disable-before-retry",
      overlapRule: "not-applicable",
      revokeRule: "orphan-disabled-before-retry",
    },
    ["provider-registry", "authenticated-acknowledgement", "data-t681-review"],
  ),
  adapterCase(
    "rotation-overlap-boundaries",
    ["Web", "Provider", "Security", "Data"],
    {
      webBoundary: "replacement-and-predecessor-active-at-commit",
      dataBoundary: "overlap-not-yet-wire-bound",
      providerBoundary: "provider-overlap-pending",
      compensationBoundary: "exactly-86400000-ms",
      overlapRule: "exclusive-after-86400-seconds",
      revokeRule: "not-applicable",
    },
    ["provider-registry", "security-registry", "data-t681-review"],
  ),
  adapterCase(
    "revoke-overrides-overlap",
    ["Web", "Provider", "Security", "Data"],
    {
      webBoundary: "immediate-revocation-precedence",
      dataBoundary: "predecessor-deny",
      providerBoundary: "replacement-unchanged-unless-targeted",
      compensationBoundary: "no-overlap-resurrection",
      overlapRule: "revoke-wins-during-overlap",
      revokeRule: "immediate",
    },
    ["provider-registry", "security-registry", "data-t681-review"],
  ),
  adapterCase(
    "project-and-organization-disable-precedence",
    ["Web", "Data", "Security", "Operations"],
    {
      webBoundary: "descendant-disable-precedence",
      dataBoundary: "deny-disabled-descendants",
      providerBoundary: "provider-state-not-authoritative",
      compensationBoundary: "replay-reactivation-fail-closed",
      overlapRule: "disabled-state-wins",
      revokeRule: "disable-wins",
    },
    ["authenticated-acknowledgement", "data-t681-review"],
  ),
  acknowledgementCase(
    "durable-applied-acknowledgement",
    ["Data", "Web", "Security", "Operations"],
    {
      durability: "durable-before-return",
      duplicateRule: "closed-duplicate-contract-pending",
      sequenceRule: "exact-canonical-digest",
      stalenessRule: "fresh-only",
      mutationRule: "state-applied",
      ackStatus: "applied",
    },
    ["authenticated-acknowledgement", "quarantine-reason-codes", "data-t681-review"],
  ),
  acknowledgementCase(
    "durable-quarantined-acknowledgement",
    ["Data", "Web", "Security", "Operations"],
    {
      durability: "durable-before-return",
      duplicateRule: "closed-duplicate-contract-pending",
      sequenceRule: "closed-reason-code",
      stalenessRule: "quarantine-on-rejected-apply",
      mutationRule: "quarantine-state-only",
      ackStatus: "quarantined",
    },
    ["authenticated-acknowledgement", "quarantine-reason-codes", "data-t681-review"],
  ),
  acknowledgementCase(
    "exact-duplicate-original-bytes",
    ["Data", "Web", "Operations"],
    {
      durability: "original-ack-durable",
      duplicateRule: "same-event-counters-and-bytes",
      sequenceRule: "same-event-id",
      stalenessRule: "return-original-bytes",
      mutationRule: "no-state-mutation",
      ackStatus: "original_bytes",
    },
    ["authenticated-acknowledgement", "data-t681-review"],
  ),
  acknowledgementCase(
    "mismatched-duplicate-quarantine",
    ["Data", "Web", "Security", "Operations"],
    {
      durability: "quarantine-durable",
      duplicateRule: "same-event-id-different-bytes",
      sequenceRule: "mismatch-never-authorizes",
      stalenessRule: "quarantine",
      mutationRule: "no-authorizing-state-mutation",
      ackStatus: "quarantined",
    },
    ["authenticated-acknowledgement", "quarantine-reason-codes", "data-t681-review"],
  ),
  acknowledgementCase(
    "gap-rollback-policy-rollback-fail-closed",
    ["Data", "Web", "Security"],
    {
      durability: "no-durable-apply",
      duplicateRule: "unknown-until-reviewed",
      sequenceRule: "exact-next-and-monotonic-policy",
      stalenessRule: "gap-or-rollback-fail-closed",
      mutationRule: "no-state-mutation",
      ackStatus: "fail_closed",
    },
    ["quarantine-reason-codes", "data-t681-review"],
  ),
  acknowledgementCase(
    "replay-from-last-durable-ack-plus-one",
    ["Data", "Web", "Operations"],
    {
      durability: "last-ack-is-durable",
      duplicateRule: "original-bytes",
      sequenceRule: "last-plus-one",
      stalenessRule: "at-least-once",
      mutationRule: "no-skip",
      ackStatus: "replay_next",
    },
    ["authenticated-acknowledgement", "data-t681-review"],
  ),
  acknowledgementCase(
    "heartbeat-stale-and-watermark-mismatch",
    ["Data", "Web", "Operations", "Security"],
    {
      durability: "no-authorizing-apply",
      duplicateRule: "unknown-until-reviewed",
      sequenceRule: "watermark-equality",
      stalenessRule: "30-warning-45-critical-60-fail-closed",
      mutationRule: "no-state-mutation",
      ackStatus: "fail_closed",
    },
    ["authenticated-acknowledgement", "data-t681-review"],
  ),
  acknowledgementCase(
    "noninteger-and-unknown-state-fail-closed",
    ["Data", "Web", "Security"],
    {
      durability: "no-authorizing-apply",
      duplicateRule: "unknown-binding-fail-closed",
      sequenceRule: "finite-nonnegative-integer-required",
      stalenessRule: "unknown-version-fail-closed",
      mutationRule: "no-state-mutation",
      ackStatus: "fail_closed",
    },
    ["quarantine-reason-codes", "data-t681-review"],
  ),
  failureCase(
    "unknown-event-or-version",
    ["Web", "Data", "Security"],
    {
      outcome: "fail_closed",
      redactionRule: "no-sensitive-fields",
      unknownRule: "unknown-event-or-version",
      mutationRule: "no-state-mutation",
    },
    ["security-registry", "quarantine-reason-codes", "data-t681-review"],
  ),
  failureCase(
    "unknown-binding-or-key-reference",
    ["Web", "Data", "Security", "Provider"],
    {
      outcome: "fail_closed",
      redactionRule: "no-sensitive-fields",
      unknownRule: "unknown-organization-project-key-reference",
      mutationRule: "no-state-mutation",
    },
    ["provider-registry", "security-registry", "data-t681-review"],
  ),
  failureCase(
    "malformed-counters-and-scopes",
    ["Web", "Data", "Security"],
    {
      outcome: "fail_closed",
      redactionRule: "no-sensitive-fields",
      unknownRule: "nonfinite-negative-fractional-or-scope-error",
      mutationRule: "no-state-mutation",
    },
    ["security-registry", "data-t681-review"],
  ),
  failureCase(
    "revocation-disable-replay-precedence",
    ["Web", "Data", "Security"],
    {
      outcome: "fail_closed",
      redactionRule: "no-sensitive-fields",
      unknownRule: "revoke-disable-replay-precedence",
      mutationRule: "no-reactivation",
    },
    ["security-registry", "data-t681-review"],
  ),
  failureCase(
    "outage-retry-and-redaction-sentinels",
    ["Web", "Provider", "Security", "Privacy", "Operations", "Data"],
    {
      outcome: "fail_closed",
      redactionRule: "no-one-time-or-session-header-data",
      unknownRule: "data-or-provider-outage-retry",
      mutationRule: "compensate-before-retry",
    },
    [
      "provider-registry",
      "authenticated-acknowledgement",
      "transport-credential-binding",
      "data-t681-review",
    ],
  ),
];

function validateJointCases(value: unknown, errors: string[]) {
  if (!isRecord(value)) {
    errors.push("joint-review case file is not an object");
    return;
  }
  if (!exactKeys(value, ["schemaVersion", "caseSet", "contractIdentity", "cases"]))
    errors.push("joint-review case file fields are not exact");
  pushError(errors, value.schemaVersion === "1.0.0", "joint case schema version is invalid");
  pushError(errors, value.caseSet === "projection-v3-joint-review", "joint case set is invalid");
  pushError(
    errors,
    value.contractIdentity === "T018-Proposed-local-identity-only",
    "joint case contract identity is invalid",
  );
  if (!Array.isArray(value.cases)) {
    errors.push("joint-review cases are not an array");
    return;
  }
  pushError(errors, value.cases.length === JOINT_CASE_SPECS.length, "joint case count is not 31");
  value.cases.forEach((item, index) => {
    const expected = JOINT_CASE_SPECS[index];
    if (!expected) {
      errors.push(`unexpected joint case at index ${index}`);
      return;
    }
    if (!isRecord(item) || !deepEqual(item, expected))
      errors.push(`joint case ${expected.id} does not match its source-backed semantics`);
  });
  validateNoSensitiveBundleData(value, "joint-review cases", errors);
}

export function validateJointReviewCaseFile(value: unknown): string[] {
  const errors: string[] = [];
  validateJointCases(value, errors);
  return errors;
}

function validateSchemaDocument(value: unknown, errors: string[]) {
  if (!isRecord(value)) {
    errors.push("joint-review schema is not an object");
    return;
  }
  pushError(
    errors,
    value.$schema === "https://json-schema.org/draft/2020-12/schema",
    "joint-review schema dialect changed",
  );
  pushError(
    errors,
    value.$id ===
      "https://paperandslate.org/schemas/data-platform-api-key-projection-v3-joint-review.schema.json",
    "joint-review schema ID changed",
  );
  pushError(errors, value.type === "object", "joint-review schema root type changed");
  pushError(errors, value.additionalProperties === false, "joint-review schema is not strict");
  pushError(
    errors,
    deepEqual(value.required, MANIFEST_KEYS),
    "joint-review schema required fields changed",
  );
  if (!isRecord(value.properties)) errors.push("joint-review schema properties are missing");
  else
    pushError(
      errors,
      deepEqual(Object.keys(value.properties).sort(), [...MANIFEST_KEYS].sort()),
      "joint-review schema properties changed",
    );
  if (!isRecord(value.$defs)) errors.push("joint-review schema definitions are missing");
  else
    pushError(
      errors,
      exactKeys(value.$defs, ["fileIdentity", "commitIdentity"]),
      "joint-review schema definitions changed",
    );
}

export function validateJointReviewBundle(value: unknown): string[] {
  const errors: string[] = [];
  validateManifestShape(isRecord(value) ? value : value, errors);
  if (isRecord(value)) validateNoSensitiveBundleData(value, "joint-review bundle", errors);
  return errors;
}

function validateSourceFixtures(errors: string[]) {
  const manifest = readJson(`${FIXTURE_ROOT}/manifest.json`);
  const adapter = readJson(`${FIXTURE_ROOT}/adapter-cases.json`);
  const events = readJson(`${FIXTURE_ROOT}/event-cases.json`);
  const acknowledgements = readJson(`${FIXTURE_ROOT}/acknowledgement-replay-cases.json`);
  const failures = readJson(`${FIXTURE_ROOT}/failure-redaction-cases.json`);
  errors.push(...validateManifest(manifest).map((error) => `T020 manifest: ${error}`));
  errors.push(
    ...validateFixtureCollection(adapter, ADAPTER_CASE_IDS).map((error) => `adapter: ${error}`),
  );
  errors.push(
    ...validateFixtureCollection(
      events,
      CLOSED_EVENT_TYPES.map((eventType) => `event-${eventType}`),
    ).map((error) => `events: ${error}`),
  );
  if (isRecord(events) && Array.isArray(events.cases))
    events.cases.forEach((item) =>
      errors.push(...validateEventCase(item).map((error) => `event: ${error}`)),
    );
  errors.push(
    ...validateFixtureCollection(acknowledgements, ACKNOWLEDGEMENT_CASE_IDS).map(
      (error) => `acknowledgement: ${error}`,
    ),
  );
  errors.push(
    ...validateFixtureCollection(failures, FAILURE_CASE_IDS).map((error) => `failure: ${error}`),
  );
  const localEvents = isRecord(events) && Array.isArray(events.cases) ? events.cases : [];
  pushError(
    errors,
    localEvents.filter((item) => isRecord(item) && item.expected === "local").length === 6,
    "T020 local event count changed",
  );
  pushError(
    errors,
    localEvents
      .filter(
        (item) =>
          isRecord(item) &&
          (item.event_type === "key.verifier_published" || item.event_type === "key.rotated"),
      )
      .every(
        (item) =>
          isRecord(item) && item.expected === "blocked_external" && item.canonicalBytes === null,
      ),
    "T020 positive verifier vectors are not blocked_external",
  );
}

function verifyGitCommit(
  commit: string,
  expected: { parent: string; tree: string; diffPaths: readonly string[] },
  label: string,
  errors: string[],
) {
  pushError(
    errors,
    git(["rev-parse", `${commit}^{commit}`]) === commit,
    `${label} commit is unavailable`,
  );
  pushError(
    errors,
    git(["rev-parse", `${commit}^{tree}`]) === expected.tree,
    `${label} tree changed`,
  );
  pushError(
    errors,
    git(["rev-parse", `${commit}^`]) === expected.parent,
    `${label} parent changed`,
  );
  const paths = git(["diff-tree", "--no-commit-id", "--name-only", "-r", commit]);
  pushError(
    errors,
    paths !== null &&
      deepEqual(paths ? paths.split(/\r?\n/).filter(Boolean) : [], expected.diffPaths),
    `${label} diff path set changed`,
  );
}

function verifyGitObject(commit: string, tree: string, label: string, errors: string[]) {
  pushError(
    errors,
    git(["rev-parse", `${commit}^{commit}`]) === commit,
    `${label} commit is unavailable`,
  );
  pushError(errors, git(["rev-parse", `${commit}^{tree}`]) === tree, `${label} tree changed`);
}

function verifyRepositoryBoundary(errors: string[]) {
  const head = git(["rev-parse", "HEAD"]);
  pushError(errors, head !== null, "current HEAD is unavailable");
  pushError(
    errors,
    git(["branch", "--show-current"]) === "release/v1-closure",
    "branch is not release/v1-closure",
  );
  pushError(
    errors,
    git(["config", "--get", "remote.origin.url"]) ===
      "https://git.tower/callum/paperandslate-web.git",
    "origin URL changed",
  );
  pushError(
    errors,
    git(["rev-parse", "refs/remotes/origin/release/v1-closure"]) ===
      "a32604004cbfeeb90e7c114a9c369834bc3bcfa3",
    "origin release ref changed",
  );
  pushError(errors, git(["diff", "--cached", "--quiet"]) === "", "staged index is not empty");
  pushError(errors, git(["tag", "--points-at", R_IDENTITY.commit]) === "", "R has an exact tag");
  pushError(
    errors,
    git(["tag", "--points-at", head ?? ""]) === "",
    "current HEAD has an exact tag",
  );
  if (head !== null)
    pushError(
      errors,
      git(["merge-base", "--is-ancestor", R_IDENTITY.commit, head]) === "",
      "current HEAD is not an R descendant",
    );

  verifyGitCommit(F_IDENTITY.commit, F_IDENTITY, "F", errors);
  verifyGitCommit(R_IDENTITY.commit, R_IDENTITY, "R", errors);
  verifyGitObject(T018_IDENTITY.commit, T018_IDENTITY.tree, "T018", errors);

  for (const file of T018_FILES) {
    const blob = git(["rev-parse", `${T018_IDENTITY.commit}:${file.path}`]);
    pushError(errors, blob === file.blob, `T018 blob changed: ${file.path}`);
    if (fs.existsSync(path.join(ROOT, file.path)))
      pushError(
        errors,
        sha256File(file.path) === file.sha256,
        `T018 file bytes changed: ${file.path}`,
      );
    else errors.push(`T018 file is missing: ${file.path}`);
  }
  for (const file of T020_FIXTURES) {
    const blob = git(["rev-parse", `${R_IDENTITY.commit}:${file.path}`]);
    pushError(errors, blob === file.blob, `T020 fixture blob changed: ${file.path}`);
    if (fs.existsSync(path.join(ROOT, file.path)))
      pushError(
        errors,
        sha256File(file.path) === file.sha256,
        `T020 fixture bytes changed: ${file.path}`,
      );
    else errors.push(`T020 fixture is missing: ${file.path}`);
  }
  const receiptPaths = {
    historicalBlockedT020:
      "docs/goals/paperandslate-web-developer-control-plane/notes/T020-projection-v3-readiness-receipt.json",
    t020Completion:
      "docs/goals/paperandslate-web-developer-control-plane/notes/T020-completion-receipt.json",
    t021: "docs/goals/paperandslate-web-developer-control-plane/notes/T021-api-key-source-identity-repair-receipt.json",
    t022: "docs/goals/paperandslate-web-developer-control-plane/notes/T022-projection-v3-validator-repair-receipt.json",
  } as const;
  for (const [key, relativePath] of Object.entries(receiptPaths)) {
    pushError(
      errors,
      fs.existsSync(path.join(ROOT, relativePath)),
      `receipt is missing: ${relativePath}`,
    );
    if (fs.existsSync(path.join(ROOT, relativePath)))
      pushError(
        errors,
        sha256File(relativePath) === RECEIPT_HASHES[key as keyof typeof RECEIPT_HASHES],
        `receipt bytes changed: ${relativePath}`,
      );
  }
  const schema = readJson(SCHEMA_PATH);
  validateSchemaDocument(schema, errors);
}

export function validateRepositoryBoundaries() {
  const errors: string[] = [];
  validateSourceFixtures(errors);
  verifyRepositoryBoundary(errors);
  return errors;
}

export function runProjectionV3JointReviewCheck() {
  if (!process.argv.includes("--check")) throw new Error("--check is required");
  if (!process.argv.includes("--offline")) throw new Error("--offline is required");
  const manifest = readJson(JOINT_MANIFEST_PATH);
  const cases = readJson(JOINT_CASES_PATH);
  const errors = validateJointReviewBundle(manifest);
  validateJointCases(cases, errors);
  validateRepositoryBoundaries().forEach((error) => errors.push(error));
  if (errors.length > 0)
    throw new Error(`DCP projection v3 joint-review check failed: ${errors.join("; ")}`);
  console.log(
    JSON.stringify(
      {
        check: "dcp-projection-v3-joint-review",
        mode: "offline-development-local",
        evidenceClass: "development-local-joint-review-candidate",
        contractStatus: "T018-Proposed-local-identity-only",
        t018: { commit: T018_IDENTITY.commit, tree: T018_IDENTITY.tree },
        f: { commit: F_IDENTITY.commit, parent: F_IDENTITY.parent, tree: F_IDENTITY.tree },
        r: { commit: R_IDENTITY.commit, parent: R_IDENTITY.parent, tree: R_IDENTITY.tree },
        dataT681: { commit: DATA_T681_IDENTITY.commit, tree: DATA_T681_IDENTITY.tree },
        fixtureCollections: { events: 8, adapter: 10, acknowledgements: 8, failures: 5 },
        jointCases: JOINT_CASE_SPECS.length,
        unresolvedInputs: UNRESOLVED_INPUTS.length,
        jointAcceptance: false,
        dcp1bAuthority: false,
        positiveVerifierVectors: "blocked_external",
        providerCalls: 0,
        networkCalls: 0,
        databaseCalls: 0,
      },
      null,
      2,
    ),
  );
}

if (
  process.argv[1]
    ?.replaceAll("\\", "/")
    .endsWith("/developer-control-plane-projection-v3-joint-review.ts")
)
  runProjectionV3JointReviewCheck();
