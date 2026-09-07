import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import {
  ACKNOWLEDGEMENT_CASE_IDS as LOCAL_ACK_CASE_IDS,
  ADAPTER_CASE_IDS,
  FAILURE_CASE_IDS,
  validateEventCase,
  validateFixtureCollection,
  validateManifest,
} from "../packages/developer-control-plane/src/projection-v3-readiness";
import {
  validateJointReviewBundle,
  validateJointReviewCaseFile,
} from "./developer-control-plane-projection-v3-joint-review";

type JsonPrimitive = null | boolean | number | string;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };
type JsonRecord = Record<string, unknown>;

const ROOT = process.cwd();
const FIXTURE_ROOT = "docs/interfaces/fixtures/data-platform-api-key-projection-v3";
const MANIFEST_PATH = FIXTURE_ROOT + "/acceptance-input-manifest.json";
const EVENT_CASES_PATH = FIXTURE_ROOT + "/wire-event-cases.json";
const ACK_CASES_PATH = FIXTURE_ROOT + "/wire-acknowledgement-cases.json";
const SLOT_PATH = FIXTURE_ROOT + "/external-receipt-slots.json";
const DATA_REVIEW_HANDOFF_PATH =
  "docs/interfaces/data-platform-api-key-projection-v3-data-review-handoff.md";

export const T018_IDENTITY = {
  commit: "38449c320e0fbaec1dba38f56c0f9570384f8b60",
  parent: "ee7e6341f9ce52edf51766f540af3864ed565cfd",
  tree: "cf3cac41763938546af9d6f662167b17f3197288",
} as const;

export const F_IDENTITY = {
  commit: "83548d8fdd636f3ceb222036ad115983401ce0fb",
  parent: T018_IDENTITY.commit,
  tree: "42bd3051e2196c32f640e0ef032af6cd2519d851",
} as const;

export const R_IDENTITY = {
  commit: "52e120253c60047f4eadec30dafb5fa7981ac947",
  parent: F_IDENTITY.commit,
  tree: "5d517f9ba396acffaa81ed01325f237a4acfd92f",
} as const;

export const T023_IDENTITY = {
  commit: "f2e0672d026381aaeee2863b2c4144405c924bf2",
  parent: "48a58d5f2551fd35e6b481c50ded3ffea3831983",
  tree: "ae11ad69fc0ec3781ed5c4dc995bbfbbf0772384",
} as const;

export const T023_BASE_IDENTITY = {
  commit: "48a58d5f2551fd35e6b481c50ded3ffea3831983",
  parent: R_IDENTITY.commit,
  tree: "2a60695fd81a713ae63ddee3ef6a793148732f84",
} as const;

export const K_IDENTITY = {
  commit: "6bf23285e3763f8ed76c2d5d2ed57d3067fefde1",
  parent: T023_IDENTITY.commit,
  tree: "c20ab665c32551df8f5bd4405c66d5bbac1f0c7c",
} as const;

export const T026_IDENTITY = {
  commit: "c2b5c40d4a363a55dc8f4e84cd9674318bac885e",
  parent: K_IDENTITY.commit,
  tree: "3cafb90820e1c90b92fd82ec563c2c86c8e5b135",
} as const;

export const T027_IDENTITY = {
  commit: "eb4e6f6d6d231e832f4afa279dd3fd6b9a214a20",
  parent: T026_IDENTITY.commit,
  tree: "b94b3252ec7a2897fb20aebb44bec0cfa3ea2129",
} as const;

export const N_IDENTITY = {
  commit: "7cc6443ea0aedb505ce047ce12bda985c7f2d268",
  parent: T027_IDENTITY.commit,
  tree: "bd62615183e4fc1946e3ecbc7fe0df7e2a531ec7",
} as const;

export const DATA_T681_IDENTITY = {
  commit: "d21efabb8550578333fee5f62bf0e822fbca1394",
  tree: "5c3a56a25f4eb374e94550f89b9ed1dbd52bb66a",
} as const;

export const CLOSED_EVENT_TYPES = [
  "key.verifier_published",
  "key.rotated",
  "key.revoked",
  "key.policy_changed",
  "project.activated",
  "project.disabled",
  "organization.disabled",
  "projection.heartbeat",
] as const;

export const ACK_CASE_IDS = [
  "ack-durable-applied-acknowledgement",
  "ack-exact-duplicate-original-bytes",
  "ack-mismatched-duplicate-quarantine",
  "ack-gap-rollback-policy-rollback-fail-closed",
  "ack-replay-from-last-durable-ack-plus-one",
  "ack-heartbeat-stale-and-watermark-mismatch",
  "ack-noninteger-and-unknown-state-fail-closed",
  "ack-durable-quarantined-acknowledgement",
] as const;

export const RECEIPT_SLOT_IDS = [
  "web-source-identity",
  "provider-web-primitives",
  "security-verifier-registry",
  "operations-transport-and-managed-references",
  "privacy-data-handling",
  "joint-web-data-fixtures",
  "data-t681-review",
] as const;

const WIRE_CASE_POLICIES = [
  {
    eventType: "key.verifier_published",
    expected: "blocked_external",
    blockedReason: "provider-security-registry-entry-missing",
    unresolved: ["provider-registry", "security-registry", "data-t681-review"],
  },
  {
    eventType: "key.rotated",
    expected: "blocked_external",
    blockedReason: "provider-security-registry-entry-missing",
    unresolved: ["provider-registry", "security-registry", "data-t681-review"],
  },
  {
    eventType: "key.revoked",
    expected: "local_candidate",
    blockedReason: null,
    unresolved: ["data-t681-review", "authenticated-acknowledgement"],
  },
  {
    eventType: "key.policy_changed",
    expected: "local_candidate",
    blockedReason: null,
    unresolved: ["data-t681-review", "authenticated-acknowledgement"],
  },
  {
    eventType: "project.activated",
    expected: "local_candidate",
    blockedReason: null,
    unresolved: ["data-t681-review", "authenticated-acknowledgement"],
  },
  {
    eventType: "project.disabled",
    expected: "local_candidate",
    blockedReason: null,
    unresolved: ["data-t681-review", "authenticated-acknowledgement"],
  },
  {
    eventType: "organization.disabled",
    expected: "local_candidate",
    blockedReason: null,
    unresolved: ["data-t681-review", "authenticated-acknowledgement"],
  },
  {
    eventType: "projection.heartbeat",
    expected: "local_candidate",
    blockedReason: null,
    unresolved: ["data-t681-review", "authenticated-acknowledgement"],
  },
] as const;

const EXPECTED_RECEIPT_SLOTS = {
  schemaVersion: "1.0.0",
  collection: "v3-external-receipt-slots",
  classification: "pending-identity-bound-external-inputs",
  contractStatus: "T018-Proposed-local-identity-only",
  aggregate: {
    status: "blocked_external",
    jointAcceptance: false,
    dcp1bAuthority: false,
    positiveVerifierVectors: "blocked_external",
  },
  slots: [
    {
      id: "web-source-identity",
      status: "pending",
      owner: "Web",
      requiredEvidence: [
        "immutable T030 direct-child commit/tree and eight file blob and SHA-256 identities",
        "exact T018, F, R, T023, M, and Data T681 identity bindings",
        "fresh independent local Judge receipt",
      ],
      identityBinding: "T030-M-plus-T018-F-R-T023-Data-T681",
      acceptanceOwner: "Web coordinator",
    },
    {
      id: "provider-web-primitives",
      status: "pending",
      owner: "Provider plus Web",
      requiredEvidence: [
        "Better Auth 1.7.2 organization ownership and lifecycle capability",
        "separate Web project binding and database source of truth",
        "show-once and hashing controls with API-key sessions disabled",
        "portable opaque descriptor feasibility, key reference behavior, rotation and revoke compensation",
        "availability and fail-closed behavior",
      ],
      identityBinding: "T030-M-plus-T018-four-proposal-blobs",
      acceptanceOwner: "Provider, Web, Security, Operations",
    },
    {
      id: "security-verifier-registry",
      status: "pending",
      owner: "Security",
      requiredEvidence: [
        "one approved versioned scheme registry entry",
        "exact non-plaintext material type, length, binding, and migration rules",
        "constant-time comparison or independently reviewed equivalent",
        "unknown, malformed, stale, unavailable, rotation, revoke, and redaction behavior",
      ],
      identityBinding: "T030-M-plus-provider-receipt-plus-exact-fixtures",
      acceptanceOwner: "Independent Security reviewer",
    },
    {
      id: "operations-transport-and-managed-references",
      status: "pending",
      owner: "Operations",
      requiredEvidence: [
        "ordered authenticated transport and acknowledgement integrity",
        "producer and consumer workload identity with least privilege",
        "reference-only managed credential names, rotation, revocation, and cleanup",
        "limits, replay, retry, dead-letter, monitoring, SLO, on-call, and rollback",
      ],
      identityBinding: "T030-M-plus-exact-staged-workload-identity",
      acceptanceOwner: "Operations and Security",
    },
    {
      id: "privacy-data-handling",
      status: "pending",
      owner: "Privacy",
      requiredEvidence: [
        "field minimization for events, acknowledgements, audits, telemetry, and receipts",
        "exclusion of human identity, plaintext, headers, sessions, and credentials",
        "retention, deletion, legal hold, incident, and evidence-redaction rules",
      ],
      identityBinding: "T030-M-plus-exact-fixture-and-receipt-manifest",
      acceptanceOwner: "Independent Privacy reviewer",
    },
    {
      id: "joint-web-data-fixtures",
      status: "pending",
      owner: "Web, Data, Security, Privacy, Operations",
      requiredEvidence: [
        "valid and hostile lifecycle, order, scope, rotation, revoke, disable, and heartbeat fixtures",
        "exact and mismatched duplicates, gap, rollback, replay, stale, unknown, and malformed cases",
        "provider/Web compensation, acknowledgement durability, transport failure, DLQ, and redaction cases",
      ],
      identityBinding: "T030-M-plus-all-owner-receipts",
      acceptanceOwner: "Joint owner review",
    },
    {
      id: "data-t681-review",
      status: "pending",
      owner: "Data",
      requiredEvidence: [
        "fresh read-only compatibility verdict for the exact T030 identity",
        "unchanged Data T681 commit/tree and historical v2 artifact identities",
        "consumer mapping, raw-wire duplicate handling, ordered apply, acknowledgement, and usage-denial result",
      ],
      identityBinding: "T030-M-plus-A-to-F-plus-Data-T681",
      acceptanceOwner: "Data T681 owner and Web coordinator",
    },
  ],
  authorityDenials: [
    "no-final-verifier-scheme",
    "no-final-key-format",
    "no-provider-activation",
    "no-transport-or-managed-reference-binding",
    "no-live-database-or-network",
    "no-Data-v2-semantic-adoption",
    "no-DCP-1B-or-production-acceptance",
    "no-hosted-or-release-evidence",
    "no-legal-human-or-publication-acceptance",
  ],
} as const;

const ENVELOPE_FIELDS = [
  "projection_version",
  "event_id",
  "event_type",
  "occurred_at",
  "committed_at",
  "organization_id",
  "project_id",
  "key_id",
  "policy_version",
  "organization_sequence",
  "payload",
] as const;

const ACK_FIELDS = [
  "acknowledgement_version",
  "projection_version",
  "event_id",
  "organization_id",
  "organization_sequence",
  "canonical_event_digest",
  "outcome",
  "reason_code",
  "decided_at",
] as const;

const REVIEWED_SCOPES = ["bulk:read", "data:read", "geometry:read", "provenance:read"] as const;
const MAX_SAFE_COUNTER = Number.MAX_SAFE_INTEGER;
const UUID_V7 = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const UTC_Z = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
const DIGEST = /^sha256:[0-9a-f]{64}$/;
const QUARANTINE_REASON_CODES = [
  "duplicate_mismatch",
  "sequence_violation",
  "stale_heartbeat",
  "unknown_binding",
  "malformed_event",
  "unknown_version",
  "unknown_scope",
  "verifier_unavailable",
] as const;
const FORBIDDEN_KEYS =
  /^(authorization|bearer|header|material|plaintext|secret|session|token|key[_-]?ref|client[_-]?secret|credential|provider)$/i;
const SENSITIVE_VALUES =
  /(?:Bearer\s+\S+|live[-_ ]?secret[-_ ]?sentinel|hmac-sha256-v1|fixture[-_ ]?key[-_ ]?ref|client[-_ ]?secret)/i;

const ACK_RULES: readonly (readonly string[])[] = [
  [
    "durable-before-return",
    "applied-reason-code-null",
    "exact-event-digest",
    "authorization-state-applied",
  ],
  [
    "original-ack-durable",
    "same-event-counters-and-bytes",
    "same-event-id",
    "return-original-bytes",
    "no-state-mutation",
  ],
  [
    "same-event-id-different-bytes",
    "mismatch-never-authorizes",
    "quarantine-durable",
    "no-authorizing-state-mutation",
  ],
  [
    "no-durable-apply",
    "exact-next-and-monotonic-policy",
    "gap-or-rollback-fail-closed",
    "no-state-mutation",
  ],
  ["last-ack-is-durable", "original-event-bytes", "last-plus-one", "at-least-once", "no-skip"],
  [
    "no-authorizing-apply",
    "watermark-equality",
    "30-warning-45-critical-60-fail-closed",
    "no-state-mutation",
  ],
  [
    "no-authorizing-apply",
    "unknown-binding-fail-closed",
    "finite-positive-safe-integer-1-to-9007199254740991",
    "unknown-version-fail-closed",
    "no-state-mutation",
  ],
  [
    "durable-before-return",
    "quarantined-reason-code-required",
    "quarantine-state-only",
    "no-authorization-grant",
  ],
] as const;

const ACK_CASE_POLICIES = [
  { disposition: "durable", reasonCode: null, outcome: "applied" },
  { disposition: "return-original", reasonCode: null, outcome: "applied" },
  { disposition: "durable", reasonCode: "duplicate_mismatch", outcome: "quarantined" },
  { disposition: "durable", reasonCode: "sequence_violation", outcome: "quarantined" },
  { disposition: "replay-instruction", reasonCode: null, outcome: null },
  { disposition: "durable", reasonCode: "stale_heartbeat", outcome: "quarantined" },
  { disposition: "none", reasonCode: null, outcome: null },
  { disposition: "durable", reasonCode: "unknown_binding", outcome: "quarantined" },
] as const;

const ACK_NO_ACK_REASONS = [
  null,
  null,
  null,
  null,
  "replay-is-a-control-instruction-no-new-ack",
  null,
  "malformed-or-unknown-input-produces-no-ack",
  null,
] as const;

const F_SOURCE_PATHS = [
  {
    id: "f-manifest",
    path: FIXTURE_ROOT + "/manifest.json",
    commit: F_IDENTITY.commit,
    blob: "25b2ac777cf3ccb3a67a3170038adaa68776b0f4",
    sha256: "716EC2E23E17FD3F603ED509FE0122665AB43934641B7309EFFFBDD88FAC2167",
  },
  {
    id: "f-adapter-cases",
    path: FIXTURE_ROOT + "/adapter-cases.json",
    commit: F_IDENTITY.commit,
    blob: "43dc34320d0f89d2cb6b1f7de0cf2b2ff94fc776",
    sha256: "D0CD1A6F093C1CC4DB9C4D7B6CE53F519B80DACEB9F0E6235ECE15D974E708E3",
  },
  {
    id: "f-event-cases",
    path: FIXTURE_ROOT + "/event-cases.json",
    commit: F_IDENTITY.commit,
    blob: "2b09662ab3db2d58f05d3b44baa59cf9601c2af0",
    sha256: "C21876A364980C349AAE3DFC863A083F3DED68B678260809969050568FE6F950",
  },
  {
    id: "f-acknowledgement-replay-cases",
    path: FIXTURE_ROOT + "/acknowledgement-replay-cases.json",
    commit: F_IDENTITY.commit,
    blob: "29afb740633a037d2a17191ab05dd82cb9f461f3",
    sha256: "BA95726D69F0A56E1D3F9C93D091BEDE3798539DA03AA1E37C3C60EC2E010D2B",
  },
  {
    id: "f-failure-redaction-cases",
    path: FIXTURE_ROOT + "/failure-redaction-cases.json",
    commit: F_IDENTITY.commit,
    blob: "1686ac5a96c0f621d0730e8b5b9fc0f8a227ab95",
    sha256: "174D57B2A1F9484F9752353C24520AF0236E2E966658EDB32C0C597B01C55AD6",
  },
] as const;

export const FIXTURE_EVIDENCE = {
  status: "local-candidate-external-owner-receipts-pending",
  identityBoundary: {
    t023Base: T023_BASE_IDENTITY,
    t024Correction: T023_IDENTITY,
    t026ValidatorRepair: T026_IDENTITY,
    t027Reconciliation: T027_IDENTITY,
  },
  fullEnvelope: {
    path: EVENT_CASES_PATH,
    caseCount: 8,
    fields: ENVELOPE_FIELDS,
    eventTypes: CLOSED_EVENT_TYPES,
    canonicalization: "RFC8785-UTF8-no-BOM-closed-fixture-domain",
    status: "local-candidate-only",
  },
  acknowledgement: {
    path: ACK_CASES_PATH,
    caseCount: 8,
    fields: ACK_FIELDS,
    outcomes: ["applied", "quarantined", "original_bytes", "replay_next", "fail_closed"],
    quarantineReasonCodes: QUARANTINE_REASON_CODES,
    status: "local-candidate-only",
  },
  fSourcePaths: F_SOURCE_PATHS,
  jointReview: {
    manifestPath: FIXTURE_ROOT + "/joint-review-manifest.json",
    casePath: FIXTURE_ROOT + "/joint-review-cases.json",
    caseCount: 31,
    categoryCounts: { events: 8, adapters: 10, acknowledgements: 8, failures: 5 },
    status: "local-candidate-external-owner-receipts-pending",
  },
  boundaryFixtures: [
    {
      id: "provider-success-web-failure-compensation",
      sourceCaseId: "adapter-provider-success-web-failure-no-reveal",
      sourceCollection: "joint-review-cases.json",
      actual: "local-fixture-present",
      expected: "disable-before-retry",
      status: "provider-web-acceptance-pending",
    },
    {
      id: "outage-retry-dead-letter",
      sourceCaseId: "failure-outage-retry-and-redaction-sentinels",
      sourceCollection: "joint-review-cases.json",
      actual: "local-fixture-present",
      expected: "compensate-before-retry-and-operations-dlq-receipt",
      status: "operations-transport-acceptance-pending",
    },
    {
      id: "revoke-disable-replay-precedence",
      sourceCaseId: "adapter-project-and-organization-disable-precedence",
      sourceCollection: "joint-review-cases.json",
      actual: "local-fixture-present",
      expected: "disable-wins-and-replay-cannot-reactivate",
      status: "data-security-acceptance-pending",
    },
    {
      id: "telemetry-retention",
      sourceCaseId: "failure-outage-retry-and-redaction-sentinels",
      sourceCollection: "joint-review-cases.json",
      actual: "local-sensitive-value-rejection-only",
      expected: "privacy-retention-deletion-redaction-receipt",
      status: "privacy-acceptance-pending",
    },
    {
      id: "redaction",
      sourceCaseId: "failure-outage-retry-and-redaction-sentinels",
      sourceCollection: "joint-review-cases.json",
      actual: "no-sensitive-values-in-serialized-evidence",
      expected: "no-plaintext-session-header-or-credential-data",
      status: "privacy-security-acceptance-pending",
    },
  ],
} as const;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPlainRecord(value: unknown): value is JsonRecord {
  if (!isRecord(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function exactKeys(value: JsonRecord, expected: readonly string[]): boolean {
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

function hasUnpairedSurrogate(value: string): boolean {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code >= 0xd800 && code <= 0xdbff) {
      const next = value.charCodeAt(index + 1);
      if (Number.isNaN(next) || next < 0xdc00 || next > 0xdfff) return true;
      index += 1;
    } else if (code >= 0xdc00 && code <= 0xdfff) {
      return true;
    }
  }
  return false;
}

/**
 * JCS serialization for the closed JSON value domain used by this fixture
 * bundle. It is fixture tooling, not a raw-wire parser or a runtime export.
 */
export function canonicalizeJcs(value: unknown): string {
  if (value === null) return "null";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "string") {
    if (hasUnpairedSurrogate(value)) throw new Error("unpaired surrogate");
    return JSON.stringify(value);
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new Error("non-finite number");
    const serialized = JSON.stringify(value);
    if (serialized === undefined) throw new Error("unsupported number");
    return serialized;
  }
  if (Array.isArray(value)) return "[" + value.map(canonicalizeJcs).join(",") + "]";
  if (isPlainRecord(value)) {
    for (const key of Object.keys(value)) {
      if (hasUnpairedSurrogate(key)) throw new Error("unpaired surrogate in property name");
    }
    const keys = Object.keys(value).sort((left, right) =>
      left < right ? -1 : left > right ? 1 : 0,
    );
    return (
      "{" +
      keys.map((key) => JSON.stringify(key) + ":" + canonicalizeJcs(value[key])).join(",") +
      "}"
    );
  }
  throw new Error("non-plain JSON value");
}

export function canonicalDigest(value: unknown): string {
  return (
    "sha256:" +
    createHash("sha256")
      .update(Buffer.from(canonicalizeJcs(value), "utf8"))
      .digest("hex")
  );
}

function readJson(relativePath: string): unknown {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8")) as unknown;
}

function sha256File(relativePath: string): string | null {
  try {
    return createHash("sha256")
      .update(fs.readFileSync(path.join(ROOT, relativePath)))
      .digest("hex")
      .toUpperCase();
  } catch {
    return null;
  }
}

function push(errors: string[], condition: boolean, message: string) {
  if (!condition) errors.push(message);
}

function validateNoSensitiveData(value: unknown, location: string, errors: string[]) {
  if (typeof value === "string") {
    if (SENSITIVE_VALUES.test(value)) errors.push(location + " contains a forbidden sentinel");
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) =>
      validateNoSensitiveData(item, location + "[" + index + "]", errors),
    );
    return;
  }
  if (!isRecord(value)) return;
  for (const [key, child] of Object.entries(value)) {
    if (FORBIDDEN_KEYS.test(key)) errors.push(location + "." + key + " is forbidden");
    validateNoSensitiveData(child, location + "." + key, errors);
  }
}

function validCounter(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    Number.isSafeInteger(value) &&
    value >= 1 &&
    value <= MAX_SAFE_COUNTER
  );
}

function validScopeList(value: unknown, allowEmpty: boolean): value is string[] {
  if (!Array.isArray(value)) return false;
  if (!allowEmpty && value.length === 0) return false;
  if (
    !value.every((scope) => typeof scope === "string" && REVIEWED_SCOPES.includes(scope as never))
  )
    return false;
  const scopes = value as string[];
  return (
    new Set(scopes).size === scopes.length &&
    scopes.every((scope, index) => index === 0 || scopes[index - 1] < scope)
  );
}

function validTimestamp(value: unknown): value is string {
  if (typeof value !== "string" || !UTC_Z.test(value)) return false;
  const date = new Date(value);
  return !Number.isNaN(date.valueOf()) && date.toISOString().replace(".000", "") === value;
}

function validateCanonicalFields(
  value: JsonRecord,
  source: JsonRecord,
  errors: string[],
  location: string,
) {
  try {
    const expectedBytes = canonicalizeJcs(source);
    push(errors, value.canonicalBytes === expectedBytes, location + " canonical bytes changed");
    push(
      errors,
      value.canonicalDigest === canonicalDigest(source),
      location + " canonical digest changed",
    );
  } catch (error) {
    errors.push(location + " canonicalization failed: " + String(error));
  }
}

export function validateDataReviewHandoff(value: unknown): string[] {
  if (typeof value !== "string") return ["Data review handoff is not text"];
  const errors: string[] = [];
  const matches = [
    ...value.matchAll(
      /Data T681's immutable producer-local identity\s+`([^`\r\n]+)` with tree\r?\n`([^`\r\n]+)`\./g,
    ),
  ];
  push(errors, matches.length === 1, "Data review handoff identity occurrence changed");
  const commit = matches[0]?.[1];
  const tree = matches[0]?.[2];
  push(
    errors,
    commit === DATA_T681_IDENTITY.commit && /^[0-9a-f]{40}$/.test(commit ?? ""),
    "Data review handoff commit identity changed",
  );
  push(
    errors,
    tree === DATA_T681_IDENTITY.tree && /^[0-9a-f]{40}$/.test(tree ?? ""),
    "Data review handoff tree identity changed",
  );
  return errors;
}

function validateFixtureEvidence(value: unknown): string[] {
  const errors: string[] = [];
  if (!isRecord(value)) return ["fixture evidence is not an object"];
  push(
    errors,
    exactKeys(value, [
      "status",
      "identityBoundary",
      "fullEnvelope",
      "acknowledgement",
      "fSourcePaths",
      "jointReview",
      "boundaryFixtures",
    ]),
    "fixture evidence fields changed",
  );
  push(errors, deepEqual(value, FIXTURE_EVIDENCE), "fixture evidence contract changed");
  for (const source of F_SOURCE_PATHS) {
    push(errors, sha256File(source.path) === source.sha256, source.id + " SHA-256 changed");
    push(
      errors,
      gitText(["hash-object", "--", source.path]) === source.blob,
      source.id + " blob changed",
    );
  }
  const sourceManifest = readJson(FIXTURE_ROOT + "/manifest.json");
  const sourceAdapter = readJson(FIXTURE_ROOT + "/adapter-cases.json");
  const sourceEvents = readJson(FIXTURE_ROOT + "/event-cases.json");
  const sourceAcknowledgements = readJson(FIXTURE_ROOT + "/acknowledgement-replay-cases.json");
  const sourceFailures = readJson(FIXTURE_ROOT + "/failure-redaction-cases.json");
  errors.push(...validateManifest(sourceManifest).map((error) => "F manifest: " + error));
  errors.push(
    ...validateFixtureCollection(sourceAdapter, ADAPTER_CASE_IDS).map(
      (error) => "F adapter cases: " + error,
    ),
  );
  if (isRecord(sourceEvents) && Array.isArray(sourceEvents.cases))
    sourceEvents.cases.forEach((item) =>
      errors.push(...validateEventCase(item).map((error) => "F event cases: " + error)),
    );
  else errors.push("F event cases are not an array");
  errors.push(
    ...validateFixtureCollection(sourceAcknowledgements, LOCAL_ACK_CASE_IDS).map(
      (error) => "F acknowledgement cases: " + error,
    ),
  );
  errors.push(
    ...validateFixtureCollection(sourceFailures, FAILURE_CASE_IDS).map(
      (error) => "F failure cases: " + error,
    ),
  );
  const jointManifest = readJson(FIXTURE_ROOT + "/joint-review-manifest.json");
  const jointCases = readJson(FIXTURE_ROOT + "/joint-review-cases.json");
  errors.push(
    ...validateJointReviewBundle(jointManifest).map((error) => "joint manifest: " + error),
  );
  errors.push(...validateJointReviewCaseFile(jointCases).map((error) => "joint cases: " + error));
  const jointCaseIds =
    isRecord(jointCases) && Array.isArray(jointCases.cases)
      ? jointCases.cases.filter(isRecord).map((item) => item.id)
      : [];
  if (Array.isArray(value.boundaryFixtures))
    value.boundaryFixtures.forEach((item, index) => {
      if (!isRecord(item)) return;
      push(
        errors,
        jointCaseIds.includes(item.sourceCaseId),
        "fixture boundary " + index + " source case is not present",
      );
    });
  validateNoSensitiveData(value, "fixture evidence", errors);
  return errors;
}

function validateEventPayload(
  event: JsonRecord,
  errors: string[],
  location: string,
  blocked: boolean,
) {
  const eventType = event.event_type;
  const payload = event.payload;
  if (!isRecord(payload)) {
    errors.push(location + " payload is not an object");
    return;
  }
  if (eventType === "key.verifier_published") {
    push(
      errors,
      exactKeys(payload, ["state", "scopes", "expires_at", "verifier"]),
      location + " publication payload fields changed",
    );
    push(errors, payload.state === "active", location + " publication state changed");
    push(errors, validScopeList(payload.scopes, false), location + " publication scopes changed");
    push(
      errors,
      payload.expires_at === null || validTimestamp(payload.expires_at),
      location + " expiry changed",
    );
    push(
      errors,
      blocked ? payload.verifier === null : isPlainRecord(payload.verifier),
      location + " descriptor status changed",
    );
  } else if (eventType === "key.rotated") {
    push(
      errors,
      exactKeys(payload, [
        "predecessor_key_id",
        "replacement_key_id",
        "replacement_scopes",
        "replacement_expires_at",
        "replacement_verifier",
        "overlap_ends_at",
      ]),
      location + " rotation payload fields changed",
    );
    push(
      errors,
      typeof payload.predecessor_key_id === "string" && UUID_V7.test(payload.predecessor_key_id),
      location + " predecessor ID changed",
    );
    push(
      errors,
      payload.replacement_key_id === event.key_id &&
        typeof payload.replacement_key_id === "string" &&
        UUID_V7.test(payload.replacement_key_id),
      location + " replacement ID changed",
    );
    push(
      errors,
      payload.predecessor_key_id !== payload.replacement_key_id,
      location + " rotation IDs must differ",
    );
    push(
      errors,
      validScopeList(payload.replacement_scopes, false),
      location + " replacement scopes changed",
    );
    push(
      errors,
      payload.replacement_expires_at === null || validTimestamp(payload.replacement_expires_at),
      location + " replacement expiry changed",
    );
    push(
      errors,
      blocked ? payload.replacement_verifier === null : isPlainRecord(payload.replacement_verifier),
      location + " replacement descriptor status changed",
    );
    if (validTimestamp(event.committed_at) && validTimestamp(payload.overlap_ends_at)) {
      push(
        errors,
        new Date(payload.overlap_ends_at).valueOf() - new Date(event.committed_at).valueOf() ===
          86_400_000,
        location + " overlap is not exactly 86400 seconds",
      );
    } else errors.push(location + " rotation timestamps are invalid");
  } else if (eventType === "key.policy_changed") {
    push(errors, exactKeys(payload, ["scopes"]), location + " policy payload fields changed");
    push(errors, validScopeList(payload.scopes, true), location + " policy scopes changed");
  } else if (eventType === "projection.heartbeat") {
    push(
      errors,
      exactKeys(payload, ["watermark_sequence"]),
      location + " heartbeat payload fields changed",
    );
    push(
      errors,
      payload.watermark_sequence === event.organization_sequence &&
        validCounter(payload.watermark_sequence),
      location + " heartbeat watermark changed",
    );
  } else {
    push(errors, exactKeys(payload, []), location + " empty payload changed");
  }
}

export function validateWireEventCase(value: unknown, index: number): string[] {
  const errors: string[] = [];
  if (!isRecord(value)) return ["wire event case is not an object"];
  push(
    errors,
    exactKeys(value, [
      "id",
      "event_type",
      "expected",
      "blockedReason",
      "unresolved",
      "event",
      "canonicalBytes",
      "canonicalDigest",
    ]),
    "wire event " + index + " fields changed",
  );
  const eventType = value.event_type;
  const policy = WIRE_CASE_POLICIES.find((item) => item.eventType === eventType);
  push(
    errors,
    typeof eventType === "string" && (CLOSED_EVENT_TYPES as readonly string[]).includes(eventType),
    "wire event " + index + " type changed",
  );
  push(errors, value.id === "wire-" + String(eventType), "wire event " + index + " ID changed");
  push(
    errors,
    policy !== undefined && value.expected === policy.expected,
    "wire event " + index + " evidence class changed",
  );
  push(
    errors,
    policy !== undefined && deepEqual(value.unresolved, policy.unresolved),
    "wire event " + index + " unresolved review missing",
  );
  if (policy?.expected === "blocked_external")
    push(
      errors,
      value.blockedReason === policy.blockedReason,
      "wire event " + index + " blocked reason changed",
    );
  else if (policy !== undefined)
    push(
      errors,
      value.blockedReason === policy.blockedReason,
      "wire event " + index + " local blocked reason changed",
    );
  else errors.push("wire event " + index + " has no closed policy");
  if (!isRecord(value.event))
    return errors.concat("wire event " + index + " envelope is not an object");
  const event = value.event;
  push(
    errors,
    exactKeys(event, ENVELOPE_FIELDS),
    "wire event " + index + " envelope fields changed",
  );
  push(
    errors,
    event.projection_version === "3.0.0",
    "wire event " + index + " projection version changed",
  );
  push(
    errors,
    typeof event.event_id === "string" && UUID_V7.test(event.event_id),
    "wire event " + index + " event ID changed",
  );
  push(errors, event.event_type === eventType, "wire event " + index + " event type mismatch");
  push(
    errors,
    validTimestamp(event.occurred_at) && validTimestamp(event.committed_at),
    "wire event " + index + " timestamp changed",
  );
  if (validTimestamp(event.occurred_at) && validTimestamp(event.committed_at))
    push(
      errors,
      new Date(event.occurred_at).valueOf() <= new Date(event.committed_at).valueOf(),
      "wire event " + index + " occurred after commit",
    );
  push(
    errors,
    typeof event.organization_id === "string" && UUID_V7.test(event.organization_id),
    "wire event " + index + " organization ID changed",
  );
  push(
    errors,
    validCounter(event.policy_version) && validCounter(event.organization_sequence),
    "wire event " + index + " counter domain changed",
  );
  if (eventType === "organization.disabled" || eventType === "projection.heartbeat") {
    push(
      errors,
      event.project_id === null && event.key_id === null,
      "wire event " + index + " organization identity changed",
    );
  } else if (eventType === "project.activated" || eventType === "project.disabled") {
    push(
      errors,
      typeof event.project_id === "string" &&
        UUID_V7.test(event.project_id) &&
        event.key_id === null,
      "wire event " + index + " project identity changed",
    );
  } else {
    push(
      errors,
      typeof event.project_id === "string" &&
        UUID_V7.test(event.project_id) &&
        typeof event.key_id === "string" &&
        UUID_V7.test(event.key_id),
      "wire event " + index + " key identity changed",
    );
  }
  validateEventPayload(
    event,
    errors,
    "wire event " + index,
    policy?.expected === "blocked_external",
  );
  push(
    errors,
    typeof value.canonicalBytes === "string" && typeof value.canonicalDigest === "string",
    "wire event " + index + " canonical fields missing",
  );
  if (typeof value.canonicalBytes === "string" && typeof value.canonicalDigest === "string")
    validateCanonicalFields(value, event, errors, "wire event " + index);
  return errors;
}

export function validateWireEventCases(value: unknown): string[] {
  if (!isRecord(value)) return ["wire event collection is not an object"];
  const errors: string[] = [];
  push(
    errors,
    exactKeys(value, [
      "schemaVersion",
      "collection",
      "classification",
      "contractStatus",
      "envelopeFields",
      "canonicalization",
      "cases",
    ]),
    "wire event collection fields changed",
  );
  push(errors, value.schemaVersion === "1.0.0", "wire event schema version changed");
  push(errors, value.collection === "v3-wire-events", "wire event collection changed");
  push(
    errors,
    value.classification === "local-provider-neutral-wire-candidate",
    "wire event classification changed",
  );
  push(
    errors,
    value.contractStatus === "T018-Proposed-local-identity-only",
    "wire event contract status changed",
  );
  push(
    errors,
    deepEqual(value.envelopeFields, ENVELOPE_FIELDS),
    "wire envelope field list changed",
  );
  push(
    errors,
    value.canonicalization === "RFC8785-UTF8-no-BOM-closed-fixture-domain",
    "wire event canonicalization changed",
  );
  if (!Array.isArray(value.cases)) return errors.concat("wire event cases are not an array");
  push(errors, value.cases.length === CLOSED_EVENT_TYPES.length, "wire event case count changed");
  value.cases.forEach((item, index) => errors.push(...validateWireEventCase(item, index)));
  const cases = value.cases.filter(isRecord);
  push(
    errors,
    deepEqual(
      cases.map((item) => item.event_type),
      CLOSED_EVENT_TYPES,
    ),
    "wire event order changed",
  );
  push(
    errors,
    deepEqual(
      cases.map((item) => (isRecord(item.event) ? item.event.organization_sequence : null)),
      [1, 2, 3, 4, 5, 6, 7, 8],
    ),
    "wire sequence changed",
  );
  push(
    errors,
    deepEqual(
      cases.map((item) => (isRecord(item.event) ? item.event.policy_version : null)),
      [1, 2, 3, 4, 5, 6, 7, 7],
    ),
    "wire policy sequence changed",
  );
  return errors;
}

function validateAcknowledgement(value: JsonRecord, location: string, errors: string[]) {
  if (!isRecord(value.acknowledgement)) {
    push(errors, value.acknowledgement === null, location + " acknowledgement changed");
    return;
  }
  const ack = value.acknowledgement;
  push(errors, exactKeys(ack, ACK_FIELDS), location + " acknowledgement fields changed");
  push(
    errors,
    ack.acknowledgement_version === "1.0.0" && ack.projection_version === "3.0.0",
    location + " acknowledgement version changed",
  );
  push(
    errors,
    typeof ack.event_id === "string" && UUID_V7.test(ack.event_id),
    location + " acknowledgement event ID changed",
  );
  push(
    errors,
    typeof ack.organization_id === "string" && UUID_V7.test(ack.organization_id),
    location + " acknowledgement organization ID changed",
  );
  push(
    errors,
    validCounter(ack.organization_sequence),
    location + " acknowledgement sequence changed",
  );
  push(
    errors,
    typeof ack.canonical_event_digest === "string" && DIGEST.test(ack.canonical_event_digest),
    location + " acknowledgement digest changed",
  );
  push(
    errors,
    ack.outcome === "applied" || ack.outcome === "quarantined",
    location + " acknowledgement outcome changed",
  );
  if (ack.outcome === "applied")
    push(errors, ack.reason_code === null, location + " applied acknowledgement reason changed");
  else
    push(
      errors,
      typeof ack.reason_code === "string" && ack.reason_code.length > 0,
      location + " quarantine reason missing",
    );
  push(errors, validTimestamp(ack.decided_at), location + " acknowledgement decision time changed");
}

export function validateAcknowledgementCases(value: unknown): string[] {
  if (!isRecord(value)) return ["acknowledgement collection is not an object"];
  const errors: string[] = [];
  push(
    errors,
    exactKeys(value, [
      "schemaVersion",
      "collection",
      "classification",
      "contractStatus",
      "acknowledgementFields",
      "quarantineReasonCodes",
      "cases",
    ]),
    "acknowledgement collection fields changed",
  );
  push(errors, value.schemaVersion === "1.0.0", "acknowledgement schema version changed");
  push(
    errors,
    value.collection === "v3-wire-acknowledgements",
    "acknowledgement collection changed",
  );
  push(
    errors,
    value.classification === "local-provider-neutral-acknowledgement-candidate",
    "acknowledgement classification changed",
  );
  push(
    errors,
    value.contractStatus === "T018-Proposed-local-identity-only",
    "acknowledgement contract status changed",
  );
  push(
    errors,
    deepEqual(value.acknowledgementFields, ACK_FIELDS),
    "acknowledgement field list changed",
  );
  push(
    errors,
    deepEqual(value.quarantineReasonCodes, QUARANTINE_REASON_CODES),
    "acknowledgement quarantine reason registry changed",
  );
  if (!Array.isArray(value.cases)) return errors.concat("acknowledgement cases are not an array");
  const cases = value.cases;
  push(
    errors,
    deepEqual(
      value.cases.map((item) => (isRecord(item) ? item.id : null)),
      ACK_CASE_IDS,
    ),
    "acknowledgement case order changed",
  );
  cases.forEach((item, index) => {
    if (!isRecord(item)) {
      errors.push("acknowledgement " + index + " is not an object");
      return;
    }
    push(
      errors,
      exactKeys(item, [
        "id",
        "expected",
        "event_id",
        "organization_id",
        "organization_sequence",
        "canonical_event_digest",
        "acknowledgement",
        "canonicalBytes",
        "canonicalDigest",
        "acknowledgementDisposition",
        "reasonCode",
        "noAcknowledgementReason",
        "rules",
        "unresolved",
      ]),
      "acknowledgement " + index + " fields changed",
    );
    push(
      errors,
      item.expected === "local_candidate" || item.expected === "blocked_external",
      "acknowledgement " + index + " evidence class changed",
    );
    push(
      errors,
      typeof item.event_id === "string" && UUID_V7.test(item.event_id),
      "acknowledgement " + index + " event ID changed",
    );
    push(
      errors,
      typeof item.organization_id === "string" && UUID_V7.test(item.organization_id),
      "acknowledgement " + index + " organization ID changed",
    );
    push(
      errors,
      validCounter(item.organization_sequence),
      "acknowledgement " + index + " sequence changed",
    );
    push(
      errors,
      typeof item.canonical_event_digest === "string" && DIGEST.test(item.canonical_event_digest),
      "acknowledgement " + index + " event digest changed",
    );
    push(
      errors,
      deepEqual(item.rules, ACK_RULES[index]),
      "acknowledgement " + index + " rules changed",
    );
    push(
      errors,
      Array.isArray(item.unresolved) && item.unresolved.includes("data-t681-review"),
      "acknowledgement " + index + " unresolved review missing",
    );
    const policy = ACK_CASE_POLICIES[index];
    push(
      errors,
      policy !== undefined && item.acknowledgementDisposition === policy.disposition,
      "acknowledgement " + index + " disposition changed",
    );
    push(
      errors,
      policy !== undefined && item.reasonCode === policy.reasonCode,
      "acknowledgement " + index + " reason code changed",
    );
    push(
      errors,
      policy !== undefined && item.noAcknowledgementReason === ACK_NO_ACK_REASONS[index],
      "acknowledgement " + index + " no-ack reason changed",
    );
    validateAcknowledgement(item, "acknowledgement " + index, errors);
    const acknowledgement = item.acknowledgement;
    push(
      errors,
      policy !== undefined && (acknowledgement === null) === (policy.outcome === null),
      "acknowledgement " + index + " acknowledgement presence changed",
    );
    if (acknowledgement === null) {
      push(
        errors,
        item.canonicalBytes === null && item.canonicalDigest === null,
        "acknowledgement " + index + " null bytes changed",
      );
    } else if (
      isRecord(acknowledgement) &&
      typeof item.canonicalBytes === "string" &&
      typeof item.canonicalDigest === "string"
    ) {
      validateCanonicalFields(item, acknowledgement, errors, "acknowledgement " + index);
      push(
        errors,
        policy !== undefined && acknowledgement.outcome === policy.outcome,
        "acknowledgement " + index + " outcome policy changed",
      );
      push(
        errors,
        policy !== undefined && acknowledgement.reason_code === policy.reasonCode,
        "acknowledgement " + index + " persisted reason code changed",
      );
    } else errors.push("acknowledgement " + index + " canonical bytes missing");
    if (index === 1 && isRecord(cases[0])) {
      push(
        errors,
        deepEqual(item.acknowledgement, cases[0].acknowledgement),
        "exact duplicate acknowledgement bytes changed",
      );
      push(
        errors,
        item.canonicalBytes === cases[0].canonicalBytes &&
          item.canonicalDigest === cases[0].canonicalDigest,
        "exact duplicate canonical bytes changed",
      );
    }
  });
  return errors;
}

function validateCommit(value: unknown, expected: JsonRecord, location: string, errors: string[]) {
  if (!isRecord(value)) {
    errors.push(location + " is not an object");
    return;
  }
  push(
    errors,
    exactKeys(value, ["commit", "parent", "tree", "diffPaths"]),
    location + " fields changed",
  );
  push(errors, deepEqual(value, expected), location + " identity changed");
}

export function validateAcceptanceManifest(value: unknown): string[] {
  if (!isRecord(value)) return ["acceptance manifest is not an object"];
  const errors: string[] = [];
  push(
    errors,
    exactKeys(value, [
      "schemaVersion",
      "evidenceClass",
      "contractStatus",
      "jointAcceptance",
      "dcp1bAuthority",
      "sourceBoundary",
      "wireContract",
      "acknowledgementContract",
      "fixtureEvidence",
      "receiptSlots",
      "dataReview",
      "authorityDenials",
    ]),
    "acceptance manifest fields changed",
  );
  push(errors, value.schemaVersion === "1.0.0", "acceptance manifest schema changed");
  push(
    errors,
    value.evidenceClass === "development-local-provider-neutral-acceptance-input",
    "acceptance evidence class changed",
  );
  push(
    errors,
    value.contractStatus === "T018-Proposed-local-identity-only",
    "acceptance contract status changed",
  );
  push(
    errors,
    value.jointAcceptance === false && value.dcp1bAuthority === false,
    "acceptance authority booleans changed",
  );
  if (!isRecord(value.sourceBoundary)) errors.push("source boundary is not an object");
  else {
    validateCommit(
      value.sourceBoundary.t018,
      {
        ...T018_IDENTITY,
        diffPaths: [
          "plans/13-developer-control-plane/01-foundation-and-interface-contract.md",
          "plans/11-implementation/01-phased-implementation-plan.md",
          "docs/decisions/ADR-0016-developer-control-plane-projection-and-verifier-contract.md",
          "docs/interfaces/data-platform-api-key-projection-v3-web-proposal.md",
        ],
      },
      "T018 source boundary",
      errors,
    );
    validateCommit(
      value.sourceBoundary.f,
      {
        ...F_IDENTITY,
        diffPaths: [
          FIXTURE_ROOT + "/acknowledgement-replay-cases.json",
          FIXTURE_ROOT + "/adapter-cases.json",
          FIXTURE_ROOT + "/event-cases.json",
          FIXTURE_ROOT + "/failure-redaction-cases.json",
          FIXTURE_ROOT + "/manifest.json",
          "packages/developer-control-plane/src/projection-v3-readiness.ts",
          "scripts/developer-control-plane-projection-v3-readiness.ts",
          "tests/developer-control-plane-projection-v3-readiness.test.ts",
        ],
      },
      "F source boundary",
      errors,
    );
    validateCommit(
      value.sourceBoundary.r,
      {
        ...R_IDENTITY,
        diffPaths: [
          "packages/developer-control-plane/src/projection-v3-readiness.ts",
          "tests/developer-control-plane-projection-v3-readiness.test.ts",
        ],
      },
      "R source boundary",
      errors,
    );
    validateCommit(
      value.sourceBoundary.t023,
      {
        ...T023_IDENTITY,
        diffPaths: [
          FIXTURE_ROOT + "/joint-review-cases.json",
          "scripts/developer-control-plane-projection-v3-joint-review.ts",
          "tests/developer-control-plane-projection-v3-joint-review.test.ts",
        ],
      },
      "T023 source boundary",
      errors,
    );
    validateCommit(
      value.sourceBoundary.dataT681,
      {
        commit: DATA_T681_IDENTITY.commit,
        parent: "0000000000000000000000000000000000000000",
        tree: DATA_T681_IDENTITY.tree,
        diffPaths: ["producer-local-v2-identity-only"],
      },
      "Data T681 source boundary",
      errors,
    );
  }
  errors.push(...validateFixtureEvidence(value.fixtureEvidence));
  if (!isRecord(value.wireContract)) errors.push("wire contract is not an object");
  else {
    push(
      errors,
      exactKeys(value.wireContract, [
        "projectionVersion",
        "envelopeFields",
        "eventTypes",
        "counterDomain",
        "canonicalization",
        "status",
      ]),
      "wire contract fields changed",
    );
    push(
      errors,
      value.wireContract.projectionVersion === "3.0.0",
      "wire projection version changed",
    );
    push(
      errors,
      deepEqual(value.wireContract.envelopeFields, ENVELOPE_FIELDS),
      "wire envelope fields changed",
    );
    push(
      errors,
      deepEqual(value.wireContract.eventTypes, CLOSED_EVENT_TYPES),
      "wire event types changed",
    );
    push(
      errors,
      value.wireContract.counterDomain === "finite-positive-safe-integer-1-to-9007199254740991",
      "wire counter domain changed",
    );
    push(
      errors,
      value.wireContract.canonicalization === "RFC8785-UTF8-no-BOM-closed-fixture-domain",
      "wire canonicalization changed",
    );
    push(
      errors,
      value.wireContract.status === "candidate-bytes-provider-security-pending",
      "wire acceptance status changed",
    );
  }
  if (!isRecord(value.acknowledgementContract))
    errors.push("acknowledgement contract is not an object");
  else {
    push(
      errors,
      exactKeys(value.acknowledgementContract, [
        "fields",
        "outcomes",
        "duplicateRule",
        "durability",
        "status",
      ]),
      "acknowledgement contract fields changed",
    );
    push(
      errors,
      deepEqual(value.acknowledgementContract.fields, ACK_FIELDS),
      "acknowledgement contract field list changed",
    );
    push(
      errors,
      deepEqual(value.acknowledgementContract.outcomes, ["applied", "quarantined"]),
      "acknowledgement outcomes changed",
    );
    push(
      errors,
      value.acknowledgementContract.duplicateRule === "exact-original-bytes-mismatched-quarantine",
      "acknowledgement duplicate rule changed",
    );
    push(
      errors,
      value.acknowledgementContract.durability === "durable-before-return",
      "acknowledgement durability changed",
    );
    push(
      errors,
      value.acknowledgementContract.status === "candidate-reason-registry-transport-pending",
      "acknowledgement acceptance status changed",
    );
  }
  push(
    errors,
    value.receiptSlots === "external-receipt-slots.json",
    "receipt slot reference changed",
  );
  if (!isRecord(value.dataReview)) errors.push("Data review is not an object");
  else {
    push(
      errors,
      exactKeys(value.dataReview, ["owner", "sourceIdentity", "mode", "resumeEvent", "status"]),
      "Data review fields changed",
    );
    push(errors, value.dataReview.owner === "Data", "Data review owner changed");
    validateCommit(
      value.dataReview.sourceIdentity,
      {
        commit: DATA_T681_IDENTITY.commit,
        parent: "0000000000000000000000000000000000000000",
        tree: DATA_T681_IDENTITY.tree,
        diffPaths: ["producer-local-v2-identity-only"],
      },
      "Data review identity",
      errors,
    );
    push(
      errors,
      value.dataReview.mode === "fresh-read-only-compatibility-review",
      "Data review mode changed",
    );
    push(
      errors,
      value.dataReview.resumeEvent === "complete-A-to-G-bundle-bound-to-T030-then-recheck-T681",
      "Data review resume event changed",
    );
    push(errors, value.dataReview.status === "blocked_external", "Data review status changed");
  }
  push(
    errors,
    Array.isArray(value.authorityDenials) && value.authorityDenials.length === 10,
    "authority denial count changed",
  );
  validateNoSensitiveData(value, "acceptance manifest", errors);
  return errors;
}

export function validateReceiptSlots(value: unknown): string[] {
  if (!isRecord(value)) return ["receipt slots are not an object"];
  const errors: string[] = [];
  push(
    errors,
    exactKeys(value, [
      "schemaVersion",
      "collection",
      "classification",
      "contractStatus",
      "aggregate",
      "slots",
      "authorityDenials",
    ]),
    "receipt slot fields changed",
  );
  push(errors, value.schemaVersion === "1.0.0", "receipt slot schema changed");
  push(errors, value.collection === "v3-external-receipt-slots", "receipt slot collection changed");
  push(
    errors,
    value.classification === "pending-identity-bound-external-inputs",
    "receipt slot classification changed",
  );
  push(
    errors,
    value.contractStatus === "T018-Proposed-local-identity-only",
    "receipt slot contract changed",
  );
  if (!isRecord(value.aggregate)) errors.push("receipt aggregate is not an object");
  else {
    push(
      errors,
      exactKeys(value.aggregate, [
        "status",
        "jointAcceptance",
        "dcp1bAuthority",
        "positiveVerifierVectors",
      ]),
      "receipt aggregate fields changed",
    );
    push(
      errors,
      value.aggregate.status === "blocked_external" &&
        value.aggregate.jointAcceptance === false &&
        value.aggregate.dcp1bAuthority === false &&
        value.aggregate.positiveVerifierVectors === "blocked_external",
      "receipt aggregate became accepted",
    );
  }
  if (!Array.isArray(value.slots)) return errors.concat("receipt slots are not an array");
  push(
    errors,
    deepEqual(
      value.slots.map((item) => (isRecord(item) ? item.id : null)),
      RECEIPT_SLOT_IDS,
    ),
    "receipt slot order changed",
  );
  value.slots.forEach((item, index) => {
    if (!isRecord(item)) {
      errors.push("receipt slot " + index + " is not an object");
      return;
    }
    push(
      errors,
      exactKeys(item, [
        "id",
        "status",
        "owner",
        "requiredEvidence",
        "identityBinding",
        "acceptanceOwner",
      ]),
      "receipt slot " + index + " fields changed",
    );
    push(errors, item.status === "pending", "receipt slot " + index + " is not pending");
    push(
      errors,
      typeof item.owner === "string" &&
        typeof item.identityBinding === "string" &&
        typeof item.acceptanceOwner === "string",
      "receipt slot " + index + " metadata changed",
    );
    push(
      errors,
      Array.isArray(item.requiredEvidence) &&
        item.requiredEvidence.length > 0 &&
        item.requiredEvidence.every((entry) => typeof entry === "string"),
      "receipt slot " + index + " evidence changed",
    );
  });
  push(
    errors,
    deepEqual(value, EXPECTED_RECEIPT_SLOTS),
    "receipt slot identity or authority metadata changed",
  );
  validateNoSensitiveData(value, "receipt slots", errors);
  return errors;
}

export function validateAcceptanceInputBundle(bundle?: {
  manifest?: unknown;
  events?: unknown;
  acknowledgements?: unknown;
  slots?: unknown;
  handoff?: unknown;
}): string[] {
  const manifest = bundle?.manifest ?? readJson(MANIFEST_PATH);
  const events = bundle?.events ?? readJson(EVENT_CASES_PATH);
  const acknowledgements = bundle?.acknowledgements ?? readJson(ACK_CASES_PATH);
  const slots = bundle?.slots ?? readJson(SLOT_PATH);
  const handoff =
    bundle?.handoff ?? fs.readFileSync(path.join(ROOT, DATA_REVIEW_HANDOFF_PATH), "utf8");
  return [
    ...validateAcceptanceManifest(manifest),
    ...validateWireEventCases(events),
    ...validateAcknowledgementCases(acknowledgements),
    ...validateReceiptSlots(slots),
    ...validateDataReviewHandoff(handoff),
    ...validateNoCrossArtifactSecrets(manifest, events, acknowledgements, slots, handoff),
  ];
}

function validateNoCrossArtifactSecrets(...values: unknown[]): string[] {
  const errors: string[] = [];
  values.forEach((value, index) =>
    validateNoSensitiveData(value, "acceptance artifact " + index, errors),
  );
  return errors;
}

const REPAIR_PATHS = [
  "docs/interfaces/data-platform-api-key-projection-v3-acceptance-input.schema.json",
  "docs/interfaces/fixtures/data-platform-api-key-projection-v3/acceptance-input-manifest.json",
  "docs/interfaces/fixtures/data-platform-api-key-projection-v3/wire-event-cases.json",
  "docs/interfaces/fixtures/data-platform-api-key-projection-v3/wire-acknowledgement-cases.json",
  "docs/interfaces/fixtures/data-platform-api-key-projection-v3/external-receipt-slots.json",
  "docs/interfaces/data-platform-api-key-projection-v3-data-review-handoff.md",
  "scripts/developer-control-plane-projection-v3-acceptance-input.ts",
  "tests/developer-control-plane-projection-v3-acceptance-input.test.ts",
] as const;

const REPAIR_DELTA_PATHS = [
  DATA_REVIEW_HANDOFF_PATH,
  "scripts/developer-control-plane-projection-v3-acceptance-input.ts",
  "tests/developer-control-plane-projection-v3-acceptance-input.test.ts",
] as const;

const HISTORICAL_COMMITS = new Set<string>([
  T018_IDENTITY.commit,
  F_IDENTITY.commit,
  R_IDENTITY.commit,
  T023_BASE_IDENTITY.commit,
  T023_IDENTITY.commit,
  K_IDENTITY.commit,
  T026_IDENTITY.commit,
  T027_IDENTITY.commit,
  N_IDENTITY.commit,
]);

export type RepositorySnapshot = {
  head: string | null;
  headType: string | null;
  headTree: string | null;
  headParent: string | null;
  headSecondParent: string | null;
  headCommitObjectHash: string | null;
  headCommitTree: string | null;
  headCommitParents: string[] | null;
  ancestryCount: number | null;
  nTree: string | null;
  baseDiffPaths: string[] | null;
  branch: string | null;
  originUrl: string | null;
  originReleaseRef: string | null;
  stagedPaths: string[] | null;
  tagsAtHead: string[] | null;
  diffPaths: string[] | null;
};

export function gitCommitObjectId(rawCommit: string | Buffer): string {
  const body = Buffer.isBuffer(rawCommit) ? rawCommit : Buffer.from(rawCommit, "utf8");
  return createHash("sha1")
    .update(Buffer.from("commit " + body.byteLength + "\0", "utf8"))
    .update(body)
    .digest("hex");
}

function gitBuffer(args: string[]): Buffer | null {
  try {
    const output = execFileSync("git", args, {
      cwd: ROOT,
      stdio: ["ignore", "pipe", "ignore"],
    });
    return Buffer.isBuffer(output) ? output : Buffer.from(String(output), "utf8");
  } catch {
    return null;
  }
}

function gitText(args: string[]): string | null {
  const output = gitBuffer(args);
  return output === null ? null : output.toString("utf8").trim();
}

function gitLines(args: string[]): string[] | null {
  const output = gitText(args);
  if (output === null) return null;
  return output === "" ? [] : output.split(/\r?\n/);
}

function readRepositorySnapshot(): RepositorySnapshot {
  const rawCommit = gitBuffer(["cat-file", "commit", "HEAD"]);
  const rawCommitText = rawCommit?.toString("utf8") ?? "";
  const commitLines = rawCommitText.split(/\r?\n/);
  const treeLine = commitLines.find((line) => line.startsWith("tree "));
  const parents = commitLines
    .filter((line) => line.startsWith("parent "))
    .map((line) => line.slice("parent ".length));
  const rawParents = rawCommit === null ? null : parents;
  const rawTree =
    rawCommit === null || treeLine === undefined ? null : treeLine.slice("tree ".length);
  const ancestryText = gitText(["rev-list", "--count", N_IDENTITY.commit + "..HEAD"]);
  const ancestryCount = ancestryText === null ? null : Number(ancestryText);
  return {
    head: gitText(["rev-parse", "HEAD"]),
    headType: gitText(["cat-file", "-t", "HEAD"]),
    headTree: gitText(["rev-parse", "HEAD^{tree}"]),
    headParent: gitText(["rev-parse", "HEAD^"]),
    headSecondParent: gitText(["rev-parse", "HEAD^2"]),
    headCommitObjectHash: rawCommit === null ? null : gitCommitObjectId(rawCommit),
    headCommitTree: rawTree,
    headCommitParents: rawParents,
    ancestryCount: Number.isFinite(ancestryCount) ? ancestryCount : null,
    nTree: gitText(["rev-parse", N_IDENTITY.commit + "^{tree}"]),
    branch: gitText(["branch", "--show-current"]),
    originUrl: gitText(["remote", "get-url", "origin"]),
    originReleaseRef: gitText(["rev-parse", "origin/release/v1-closure"]),
    stagedPaths: gitLines(["diff", "--cached", "--name-only"]),
    tagsAtHead: gitLines(["tag", "--points-at", "HEAD"]),
    diffPaths: gitLines([
      "diff-tree",
      "--no-commit-id",
      "--name-only",
      "-r",
      N_IDENTITY.commit,
      "HEAD",
    ]),
    baseDiffPaths: gitLines([
      "diff-tree",
      "--no-commit-id",
      "--name-only",
      "-r",
      T027_IDENTITY.commit,
      "HEAD",
    ]),
  };
}

function validObjectId(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{40}$/.test(value);
}

export function validateRepositorySnapshot(snapshot: RepositorySnapshot): string[] {
  const errors: string[] = [];
  push(errors, validObjectId(snapshot.head), "repair head is not a Git object ID");
  push(errors, snapshot.head !== N_IDENTITY.commit, "repair head is still N");
  push(errors, !HISTORICAL_COMMITS.has(snapshot.head ?? ""), "historical head substitution");
  push(errors, snapshot.headType === "commit", "repair head is not a commit");
  push(
    errors,
    snapshot.headCommitObjectHash === snapshot.head,
    "repair head object hash is inconsistent",
  );
  push(errors, validObjectId(snapshot.headTree), "repair tree is not a Git object ID");
  push(errors, snapshot.headCommitTree === snapshot.headTree, "repair commit tree is inconsistent");
  push(
    errors,
    snapshot.headCommitParents !== null &&
      deepEqual(snapshot.headCommitParents, [N_IDENTITY.commit]),
    "repair commit parents are not exactly N",
  );
  push(errors, snapshot.headParent === N_IDENTITY.commit, "repair parent is not N");
  push(errors, snapshot.headSecondParent === null, "repair commit has a second parent");
  push(errors, snapshot.ancestryCount === 1, "repair is not exactly one commit after N");
  push(errors, snapshot.nTree === N_IDENTITY.tree, "N tree changed");
  push(errors, snapshot.branch === "release/v1-closure", "branch changed");
  push(
    errors,
    snapshot.originUrl === "https://git.tower/callum/paperandslate-web.git",
    "origin changed",
  );
  push(
    errors,
    snapshot.originReleaseRef === "a32604004cbfeeb90e7c114a9c369834bc3bcfa3",
    "origin release ref changed",
  );
  push(
    errors,
    snapshot.stagedPaths !== null && deepEqual(snapshot.stagedPaths, []),
    "index is not empty",
  );
  push(
    errors,
    snapshot.tagsAtHead !== null && deepEqual(snapshot.tagsAtHead, []),
    "exact tag exists",
  );
  push(
    errors,
    snapshot.diffPaths !== null &&
      deepEqual([...snapshot.diffPaths].sort(), [...REPAIR_DELTA_PATHS].sort()),
    "repair delta is not exactly the three Worker paths",
  );
  push(
    errors,
    snapshot.baseDiffPaths !== null &&
      deepEqual([...snapshot.baseDiffPaths].sort(), [...REPAIR_PATHS].sort()),
    "M-to-repair diff is not exactly the eight T030 paths",
  );
  return errors;
}

type AcceptanceInputBundle = {
  manifest: unknown;
  events: unknown;
  acknowledgements: unknown;
  slots: unknown;
  handoff: unknown;
};

function readAcceptanceInputBundle(): AcceptanceInputBundle {
  return {
    manifest: readJson(MANIFEST_PATH),
    events: readJson(EVENT_CASES_PATH),
    acknowledgements: readJson(ACK_CASES_PATH),
    slots: readJson(SLOT_PATH),
    handoff: fs.readFileSync(path.join(ROOT, DATA_REVIEW_HANDOFF_PATH), "utf8"),
  };
}

export function validateRepositoryBoundaries(snapshot = readRepositorySnapshot()): string[] {
  return validateRepositorySnapshot(snapshot);
}

export function runOfflineCheck(
  snapshot?: RepositorySnapshot,
  bundleLoader: () => AcceptanceInputBundle = readAcceptanceInputBundle,
): string[] {
  const repositoryErrors = validateRepositoryBoundaries(snapshot);
  if (repositoryErrors.length > 0) return repositoryErrors;
  const bundle = bundleLoader();
  return validateAcceptanceInputBundle(bundle);
}

if (process.argv.includes("--check") && process.argv.includes("--offline")) {
  const errors = runOfflineCheck();
  if (errors.length > 0) {
    console.error(errors.join("\n"));
    process.exitCode = 1;
  } else {
    console.log(
      "projection-v3 acceptance-input: pass; providerCalls=0; networkCalls=0; databaseCalls=0; jointAcceptance=false; dcp1bAuthority=false; positiveVerifierVectors=blocked_external",
    );
  }
}
