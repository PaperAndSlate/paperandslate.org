import { createHash } from "node:crypto";

export const T018_IDENTITY = {
  commit: "38449c320e0fbaec1dba38f56c0f9570384f8b60",
  tree: "cf3cac41763938546af9d6f662167b17f3197288",
  files: [
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
  ],
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

export const REVIEWED_SCOPES = [
  "bulk:read",
  "data:read",
  "geometry:read",
  "provenance:read",
] as const;

export const ROTATION_OVERLAP_MS = 86_400_000;
export const MAX_COUNTER = Number.MAX_SAFE_INTEGER;

const UUID_V7 = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const FORBIDDEN_PERSISTED_FIELD =
  /(?:authorization|bearer|header|material|plaintext|secret|session|token)/i;
const SENSITIVE_FIXTURE_VALUE =
  /(?:\bBearer\s+\S+|live[-_ ]?secret[-_ ]?sentinel|(?:authorization|bearer|header|material|plaintext|secret|session|token|volatile)[-_ ]?sentinel|t020-[a-z0-9-]*sentinel)/i;
const SAFE_DECLARATIVE_RULE_TOKEN = "no-session-or-header-data";

const EVENT_ENVELOPE_KEYS = [
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

const DESCRIPTOR_EVENT_CASE_KEYS = [
  "id",
  "event_type",
  "expected",
  "canonicalBytes",
  "canonicalDigest",
  "blockedReason",
  "event",
] as const;

const LOCAL_EVENT_CASE_KEYS = [
  "id",
  "event_type",
  "expected",
  "canonicalBytes",
  "canonicalDigest",
  "event",
] as const;

const ADAPTER_COLLECTION_KEYS = ["schemaVersion", "collection", "cases"] as const;
const ADAPTER_CASE_KEYS = ["id", "classification", "operation", "input", "expected"] as const;
const ACKNOWLEDGEMENT_COLLECTION_KEYS = ["schemaVersion", "collection", "cases"] as const;
const ACKNOWLEDGEMENT_CASE_KEYS = ["id", "expected", "noStateMutation", "rules"] as const;
const FAILURE_COLLECTION_KEYS = ["schemaVersion", "collection", "cases"] as const;
const FAILURE_CASE_KEYS = ["id", "expected", "rules"] as const;

type ClosedEventType = (typeof CLOSED_EVENT_TYPES)[number];

const EVENT_SEQUENCE_BY_TYPE: Record<ClosedEventType, { sequence: number; policyVersion: number }> =
  {
    "key.verifier_published": { sequence: 1, policyVersion: 1 },
    "key.rotated": { sequence: 2, policyVersion: 2 },
    "key.revoked": { sequence: 3, policyVersion: 3 },
    "key.policy_changed": { sequence: 4, policyVersion: 4 },
    "project.activated": { sequence: 5, policyVersion: 5 },
    "project.disabled": { sequence: 6, policyVersion: 6 },
    "organization.disabled": { sequence: 7, policyVersion: 7 },
    "projection.heartbeat": { sequence: 8, policyVersion: 7 },
  };

const EVENT_PAYLOAD_KEYS: Record<ClosedEventType, readonly string[]> = {
  "key.verifier_published": ["descriptorStatus"],
  "key.rotated": ["descriptorStatus", "overlapSeconds"],
  "key.revoked": [],
  "key.policy_changed": ["scopes"],
  "project.activated": [],
  "project.disabled": [],
  "organization.disabled": [],
  "projection.heartbeat": ["watermark_sequence"],
};

const EVENT_CASE_IDS = CLOSED_EVENT_TYPES.map(
  (eventType) => `event-${eventType}`,
) as readonly string[];

const ADAPTER_CASE_SPECS = [
  {
    id: "project-binding-authoritative",
    operation: "authorize",
    input: {
      organizationId: "uuid-v7",
      projectId: "uuid-v7",
      providerReference: "ignored-for-authorization",
    },
    expected: { authority: "separate-web-project-record", organizationMismatch: "deny" },
  },
  {
    id: "create-show-once-redaction",
    operation: "create",
    input: { organizationProjectBinding: "valid", providerResult: "volatile-test-only" },
    expected: {
      create: "allow",
      firstDisplay: "volatile-only",
      secondDisplay: "deny",
      persistedRecord: "metadata-only",
    },
  },
  {
    id: "list-metadata-only",
    operation: "list",
    input: { projectBinding: "valid" },
    expected: { result: "metadata-only", displayValue: "absent", descriptor: "absent" },
  },
  {
    id: "exact-command-retry",
    operation: "retry",
    input: { sameCommandIdentity: true, sameCanonicalBytes: true },
    expected: {
      result: "original-redacted-outcome",
      eventBytes: "reused",
      providerCall: "not-repeated",
    },
  },
  {
    id: "mismatched-command-retry-fail-closed",
    operation: "retry",
    input: { sameCommandIdentity: true, sameCanonicalBytes: false },
    expected: { result: "fail_closed", stateMutation: false },
  },
  {
    id: "provider-failure-no-event",
    operation: "create",
    input: { providerResult: "failure" },
    expected: { result: "fail_closed", outboxEvent: "absent", display: "absent" },
  },
  {
    id: "provider-success-web-failure-no-reveal",
    operation: "create",
    input: { providerResult: "success", webCommit: "failure" },
    expected: {
      display: "absent",
      orphan: "recoverable",
      compensation: "disable-before-retry",
    },
  },
  {
    id: "rotation-overlap-boundaries",
    operation: "rotate",
    input: {
      committedAt: "2026-08-31T00:00:00.000Z",
      predecessor: "active",
      replacement: "active",
    },
    expected: {
      overlapMs: ROTATION_OVERLAP_MS,
      startsAt: "committed_at",
      boundary: "exclusive_after_86400_seconds",
    },
  },
  {
    id: "revoke-overrides-overlap",
    operation: "revoke",
    input: { duringOverlap: true },
    expected: {
      revokePrecedence: "immediate",
      predecessor: "deny",
      replacement: "unchanged-unless-targeted",
    },
  },
  {
    id: "project-and-organization-disable-precedence",
    operation: "disable",
    input: { replayedActivation: true, organizationDisabled: true },
    expected: { projectAndDescendantKeys: "deny", replayReactivation: "fail_closed" },
  },
] as const;

const ACKNOWLEDGEMENT_CASE_SPECS = [
  {
    id: "durable-applied-acknowledgement",
    expected: "applied",
    noStateMutation: false,
    rules: ["durable-before-return", "exact-canonical-digest", "closed-fields-only"],
  },
  {
    id: "durable-quarantined-acknowledgement",
    expected: "quarantined",
    noStateMutation: false,
    rules: ["durable-before-return", "closed-reason-code"],
  },
  {
    id: "exact-duplicate-original-bytes",
    expected: "original_bytes",
    noStateMutation: true,
    rules: ["same-event-id", "same-counters", "same-canonical-bytes"],
  },
  {
    id: "mismatched-duplicate-quarantine",
    expected: "quarantined",
    noStateMutation: true,
    rules: ["same-event-id-different-bytes", "never-authorize"],
  },
  {
    id: "gap-rollback-policy-rollback-fail-closed",
    expected: "fail_closed",
    noStateMutation: true,
    rules: ["exact-next-sequence", "monotonic-policy-version"],
  },
  {
    id: "replay-from-last-durable-ack-plus-one",
    expected: "replay_next",
    noStateMutation: false,
    rules: ["at-least-once", "original-bytes", "never-skip"],
  },
  {
    id: "heartbeat-stale-and-watermark-mismatch",
    expected: "fail_closed",
    noStateMutation: true,
    rules: ["30-warning", "45-critical", "60-fail-closed", "watermark-equality"],
  },
  {
    id: "noninteger-and-unknown-state-fail-closed",
    expected: "fail_closed",
    noStateMutation: true,
    rules: ["NaN", "Infinity", "negative", "fractional", "unknown-version", "unknown-binding"],
  },
] as const;

const FAILURE_CASE_SPECS = [
  {
    id: "unknown-event-or-version",
    expected: "fail_closed",
    rules: ["unknown-event", "unknown-projection-version", "unknown-policy-version"],
  },
  {
    id: "unknown-binding-or-key-reference",
    expected: "fail_closed",
    rules: ["unknown-organization", "unknown-project", "unknown-key", "unknown-key-reference"],
  },
  {
    id: "malformed-counters-and-scopes",
    expected: "fail_closed",
    rules: [
      "nonfinite",
      "negative",
      "fractional",
      "duplicate-scope",
      "unsorted-scope",
      "unknown-scope",
    ],
  },
  {
    id: "revocation-disable-replay-precedence",
    expected: "fail_closed",
    rules: [
      "revoke-during-overlap",
      "project-disable",
      "organization-disable",
      "replay-cannot-reactivate",
    ],
  },
  {
    id: "outage-retry-and-redaction-sentinels",
    expected: "fail_closed",
    rules: [
      "Data-unavailable",
      "provider-success-web-failure",
      "no-one-time-value-in-persistence",
      SAFE_DECLARATIVE_RULE_TOKEN,
    ],
  },
] as const;

export const ADAPTER_CASE_IDS = ADAPTER_CASE_SPECS.map(({ id }) => id) as readonly string[];
export const ACKNOWLEDGEMENT_CASE_IDS = ACKNOWLEDGEMENT_CASE_SPECS.map(
  ({ id }) => id,
) as readonly string[];
export const FAILURE_CASE_IDS = FAILURE_CASE_SPECS.map(({ id }) => id) as readonly string[];

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPositiveSafeInteger(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    Number.isSafeInteger(value) &&
    value > 0 &&
    value <= MAX_COUNTER
  );
}

function isClosedEventType(value: unknown): value is ClosedEventType {
  return typeof value === "string" && (CLOSED_EVENT_TYPES as readonly string[]).includes(value);
}

function hasExactKeys(value: JsonRecord, expectedKeys: readonly string[]) {
  const actual = Object.keys(value).sort();
  const expected = [...expectedKeys].sort();
  return actual.length === expected.length && actual.every((key, index) => key === expected[index]);
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

function eventRequiresKey(eventType: string) {
  return eventType.startsWith("key.");
}

function eventRequiresProject(eventType: string) {
  return eventType === "project.activated" || eventType === "project.disabled";
}

function containsForbiddenPersistedField(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(containsForbiddenPersistedField);
  if (!isRecord(value)) return false;
  return Object.entries(value).some(
    ([key, child]) => FORBIDDEN_PERSISTED_FIELD.test(key) || containsForbiddenPersistedField(child),
  );
}

function containsSensitiveFixtureValue(value: unknown): boolean {
  if (typeof value === "string") {
    return value !== SAFE_DECLARATIVE_RULE_TOKEN && SENSITIVE_FIXTURE_VALUE.test(value);
  }
  if (Array.isArray(value)) return value.some(containsSensitiveFixtureValue);
  if (!isRecord(value)) return false;
  return Object.values(value).some(containsSensitiveFixtureValue);
}

function containsForbiddenFixtureData(value: unknown): boolean {
  return containsForbiddenPersistedField(value) || containsSensitiveFixtureValue(value);
}

function validateExactScopes(value: unknown): string[] {
  if (!Array.isArray(value)) return ["policy_changed scopes must be an array"];
  if (value.length === 0) return [];
  if (value.some((scope) => typeof scope !== "string"))
    return ["policy_changed scopes must contain only strings"];
  const scopes = value as string[];
  if (scopes.some((scope) => !(REVIEWED_SCOPES as readonly string[]).includes(scope)))
    return ["policy_changed scopes contain an unknown scope"];
  if (new Set(scopes).size !== scopes.length) return ["policy_changed scopes must be unique"];
  if (!deepEqual(scopes, [...scopes].sort()))
    return ["policy_changed scopes must be lexically sorted"];
  return [];
}

function isExactUtcFixtureTimestamp(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value))
    return false;
  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString() === value;
}

function validateEventPayload(eventType: ClosedEventType, payload: JsonRecord, sequence: number) {
  const errors: string[] = [];
  const expectedKeys = EVENT_PAYLOAD_KEYS[eventType];
  if (!hasExactKeys(payload, expectedKeys)) errors.push("event payload fields are not exact");

  switch (eventType) {
    case "key.verifier_published":
      if (payload.descriptorStatus !== "unbound")
        errors.push("verifier payload must remain unbound");
      break;
    case "key.rotated":
      if (payload.descriptorStatus !== "unbound")
        errors.push("rotation payload must remain unbound");
      if (payload.overlapSeconds !== 86_400)
        errors.push("rotation payload must retain the exact 24-hour overlap");
      break;
    case "key.policy_changed":
      errors.push(...validateExactScopes(payload.scopes));
      break;
    case "projection.heartbeat":
      if (!isPositiveSafeInteger(payload.watermark_sequence))
        errors.push("heartbeat watermark must be a positive safe integer");
      if (payload.watermark_sequence !== sequence)
        errors.push("heartbeat watermark must equal organization_sequence");
      break;
    default:
      break;
  }

  if (containsForbiddenFixtureData(payload)) errors.push("event payload contains sensitive data");
  return errors;
}

function validateAdapterCases(cases: unknown[]) {
  const errors: string[] = [];
  ADAPTER_CASE_SPECS.forEach((spec, index) => {
    const value = cases[index];
    if (!isRecord(value)) {
      errors.push(`adapter case ${spec.id} is not an object`);
      return;
    }
    if (!hasExactKeys(value, ADAPTER_CASE_KEYS))
      errors.push(`adapter case ${spec.id} fields are not exact`);
    if (value.id !== spec.id) errors.push(`adapter case ${spec.id} is out of order or renamed`);
    if (value.classification !== "local") errors.push(`adapter case ${spec.id} is not local`);
    if (value.operation !== spec.operation)
      errors.push(`adapter case ${spec.id} operation is invalid`);
    if (!deepEqual(value.input, spec.input))
      errors.push(`adapter case ${spec.id} input semantics are invalid`);
    if (!deepEqual(value.expected, spec.expected))
      errors.push(`adapter case ${spec.id} expected semantics are invalid`);
  });
  return errors;
}

function validateAcknowledgementCases(cases: unknown[]) {
  const errors: string[] = [];
  ACKNOWLEDGEMENT_CASE_SPECS.forEach((spec, index) => {
    const value = cases[index];
    if (!isRecord(value)) {
      errors.push(`acknowledgement case ${spec.id} is not an object`);
      return;
    }
    if (!hasExactKeys(value, ACKNOWLEDGEMENT_CASE_KEYS))
      errors.push(`acknowledgement case ${spec.id} fields are not exact`);
    if (!deepEqual(value, spec))
      errors.push(`acknowledgement case ${spec.id} semantics are invalid`);
  });
  return errors;
}

function validateFailureCases(cases: unknown[]) {
  const errors: string[] = [];
  FAILURE_CASE_SPECS.forEach((spec, index) => {
    const value = cases[index];
    if (!isRecord(value)) {
      errors.push(`failure case ${spec.id} is not an object`);
      return;
    }
    if (!hasExactKeys(value, FAILURE_CASE_KEYS))
      errors.push(`failure case ${spec.id} fields are not exact`);
    if (!deepEqual(value, spec)) errors.push(`failure case ${spec.id} semantics are invalid`);
  });
  return errors;
}

/**
 * Canonicalizes the restricted JSON fixture vocabulary used by this package.
 * It is only a deterministic fixture helper; it does not claim to implement
 * the complete RFC 8785 algorithm or select a production verifier.
 */
export function canonicalFixtureJson(value: unknown): string {
  if (value === null || typeof value === "string" || typeof value === "boolean")
    return JSON.stringify(value);
  if (typeof value === "number") {
    if (!Number.isSafeInteger(value)) throw new Error("Fixture numbers must be safe integers");
    return String(value);
  }
  if (Array.isArray(value)) return `[${value.map(canonicalFixtureJson).join(",")}]`;
  if (!isRecord(value)) throw new Error("Unsupported fixture value");
  const members = Object.keys(value)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonicalFixtureJson(value[key])}`);
  return `{${members.join(",")}}`;
}

export function sha256Hex(value: string) {
  return createHash("sha256").update(Buffer.from(value, "utf8")).digest("hex");
}

export function validateEventCase(value: unknown): string[] {
  const errors: string[] = [];
  if (!isRecord(value)) return ["event case must be an object"];
  const eventType = value.event_type;
  const knownEventType = isClosedEventType(eventType) ? eventType : null;
  if (!knownEventType) return ["event type is not in the closed v3 set"];

  const descriptorPending =
    knownEventType === "key.verifier_published" || knownEventType === "key.rotated";
  const expectedCaseKeys = descriptorPending ? DESCRIPTOR_EVENT_CASE_KEYS : LOCAL_EVENT_CASE_KEYS;
  if (!hasExactKeys(value, expectedCaseKeys)) errors.push("event case fields are not exact");
  if (value.id !== `event-${knownEventType}`) errors.push("event case ID is not the closed ID");
  if (value.event_type !== knownEventType) errors.push("event case type is inconsistent");

  const event = value.event;
  if (!isRecord(event)) return [...errors, "local event payload is missing"];
  if (!hasExactKeys(event, EVENT_ENVELOPE_KEYS)) errors.push("event envelope fields are not exact");
  if (event.event_type !== eventType) errors.push("event type mapping is inconsistent");
  if (typeof event.event_id !== "string" || !UUID_V7.test(event.event_id))
    errors.push("event_id is not UUIDv7");
  if (typeof event.organization_id !== "string" || !UUID_V7.test(event.organization_id))
    errors.push("organization_id is not UUIDv7");
  if (!isPositiveSafeInteger(event.policy_version))
    errors.push("policy_version is not a positive safe integer");
  if (!isPositiveSafeInteger(event.organization_sequence))
    errors.push("organization_sequence is not a positive safe integer");
  if (!isExactUtcFixtureTimestamp(event.committed_at))
    errors.push("committed_at is not an exact UTC timestamp");

  const sequence = isPositiveSafeInteger(event.organization_sequence)
    ? event.organization_sequence
    : 0;
  const expectedCounters = EVENT_SEQUENCE_BY_TYPE[knownEventType];
  if (sequence !== expectedCounters.sequence)
    errors.push("organization_sequence does not match the frozen F event sequence");
  if (event.policy_version !== expectedCounters.policyVersion)
    errors.push("policy_version does not match the frozen F policy sequence");

  if (!isRecord(event.payload)) {
    errors.push("payload is not an object");
  } else {
    errors.push(...validateEventPayload(knownEventType, event.payload, sequence));
  }

  const keyId = event.key_id;
  const projectId = event.project_id;
  if (knownEventType && eventRequiresKey(knownEventType)) {
    if (typeof projectId !== "string" || !UUID_V7.test(projectId))
      errors.push("key event requires a project UUIDv7");
    if (typeof keyId !== "string" || !UUID_V7.test(keyId))
      errors.push("key event requires a key UUIDv7");
  } else if (knownEventType && eventRequiresProject(knownEventType)) {
    if (typeof projectId !== "string" || !UUID_V7.test(projectId))
      errors.push("project event requires a project UUIDv7");
    if (keyId !== null) errors.push("project event requires key_id null");
  } else if (
    knownEventType === "organization.disabled" ||
    knownEventType === "projection.heartbeat"
  ) {
    if (projectId !== null || keyId !== null)
      errors.push("organization-wide event requires project_id and key_id null");
  }

  if (containsForbiddenFixtureData(value)) errors.push("event case contains forbidden data");

  const expected = value.expected;
  const canonicalBytes = value.canonicalBytes;
  const canonicalDigest = value.canonicalDigest;
  if (descriptorPending) {
    if (expected !== "blocked_external")
      errors.push("descriptor event must remain blocked_external");
    if (canonicalBytes !== null || canonicalDigest !== null)
      errors.push("unbound descriptor event must not claim canonical applied bytes");
    if (value.blockedReason !== "provider-security-registry-entry-missing")
      errors.push("descriptor event is missing its blocked reason");
  } else {
    if (expected !== "local") errors.push("non-descriptor event must be local");
    if (typeof canonicalBytes !== "string" || typeof canonicalDigest !== "string") {
      errors.push("local event is missing canonical bytes or digest");
    } else {
      try {
        if (canonicalFixtureJson(event) !== canonicalBytes)
          errors.push("canonical fixture bytes do not match the event");
        if (canonicalDigest !== `sha256:${sha256Hex(canonicalBytes)}`)
          errors.push("canonical fixture digest does not match the bytes");
      } catch {
        errors.push("canonical fixture bytes cannot be produced");
      }
    }
  }
  return errors;
}

export function validateFixtureCollection(value: unknown, expectedIds: readonly string[]) {
  const errors: string[] = [];
  if (!isRecord(value)) return ["fixture collection schema is invalid"];
  const collection = value.collection;
  const collectionKeys =
    collection === "web-adapter-boundary"
      ? ADAPTER_COLLECTION_KEYS
      : collection === "acknowledgement-and-replay"
        ? ACKNOWLEDGEMENT_COLLECTION_KEYS
        : collection === "failure-and-redaction"
          ? FAILURE_COLLECTION_KEYS
          : collection === "v3-events"
            ? ADAPTER_COLLECTION_KEYS
            : null;
  if (!collectionKeys) return ["fixture collection is not in the closed set"];
  if (!hasExactKeys(value, collectionKeys)) errors.push("fixture collection fields are not exact");
  if (value.schemaVersion !== 1) errors.push("fixture collection schema version is invalid");
  if (!Array.isArray(value.cases)) return [...errors, "fixture collection cases are invalid"];

  const fixedIds =
    collection === "web-adapter-boundary"
      ? ADAPTER_CASE_IDS
      : collection === "acknowledgement-and-replay"
        ? ACKNOWLEDGEMENT_CASE_IDS
        : collection === "failure-and-redaction"
          ? FAILURE_CASE_IDS
          : EVENT_CASE_IDS;
  if (!deepEqual([...expectedIds], [...fixedIds]))
    errors.push("caller expected IDs do not match the fixed fixture identity");
  if (value.cases.length !== fixedIds.length) errors.push("fixture case count is not exact");
  value.cases.forEach((item, index) => {
    if (!isRecord(item)) {
      errors.push(`fixture case ${index} is not an object`);
      return;
    }
    if (item.id !== fixedIds[index]) errors.push(`fixture case ${index} ID or order is invalid`);
  });

  if (containsForbiddenFixtureData(value))
    errors.push("fixture collection contains forbidden data");
  if (collection === "web-adapter-boundary") errors.push(...validateAdapterCases(value.cases));
  if (collection === "acknowledgement-and-replay")
    errors.push(...validateAcknowledgementCases(value.cases));
  if (collection === "failure-and-redaction") errors.push(...validateFailureCases(value.cases));
  if (collection === "v3-events")
    value.cases.forEach((item) => errors.push(...validateEventCase(item)));
  return errors;
}

export function validateManifest(value: unknown) {
  const errors: string[] = [];
  if (!isRecord(value)) return ["manifest is not an object"];
  if (value.schemaVersion !== 1 || value.evidenceClass !== "local-fixture-only")
    errors.push("manifest schema or evidence class is invalid");
  if (!isRecord(value.webContract) || value.webContract.commit !== T018_IDENTITY.commit)
    errors.push("manifest is not bound to T018 commit");
  if (!isRecord(value.webContract) || value.webContract.tree !== T018_IDENTITY.tree)
    errors.push("manifest is not bound to T018 tree");
  if (!isRecord(value.dataDependency) || value.dataDependency.commit !== DATA_T681_IDENTITY.commit)
    errors.push("manifest is not bound to Data T681 commit");
  if (!isRecord(value.dataDependency) || value.dataDependency.tree !== DATA_T681_IDENTITY.tree)
    errors.push("manifest is not bound to Data T681 tree");
  if (!isRecord(value.provider) || value.provider.status !== "unbound")
    errors.push("provider boundary is not unbound");
  if (
    !Array.isArray(value.eventTypes) ||
    JSON.stringify(value.eventTypes) !== JSON.stringify([...CLOSED_EVENT_TYPES])
  )
    errors.push("manifest event set is not the closed v3 set");
  if (
    !isRecord(value.fixtureFiles) ||
    Object.values(value.fixtureFiles).some((item) => typeof item !== "string")
  )
    errors.push("fixture file references are invalid");
  if (containsForbiddenFixtureData(value))
    errors.push("manifest contains forbidden persisted data");
  return errors;
}

export function verifyVolatileBoundary(input: {
  persisted: unknown;
  sentinels: readonly string[];
}) {
  const serialized = JSON.stringify(input.persisted);
  return input.sentinels.every((sentinel) => !serialized.includes(sentinel));
}
