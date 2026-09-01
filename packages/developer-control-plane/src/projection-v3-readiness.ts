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

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPositiveSafeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
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
  const event = value.event;
  const eventType = value.event_type;
  const knownEventType =
    typeof eventType === "string" && CLOSED_EVENT_TYPES.includes(eventType as never)
      ? eventType
      : null;
  if (!knownEventType) errors.push("event type is not in the closed v3 set");
  if (!isRecord(event)) return [...errors, "local event payload is missing"];
  if (event.event_type !== eventType) errors.push("event type mapping is inconsistent");
  if (typeof event.event_id !== "string" || !UUID_V7.test(event.event_id))
    errors.push("event_id is not UUIDv7");
  if (typeof event.organization_id !== "string" || !UUID_V7.test(event.organization_id))
    errors.push("organization_id is not UUIDv7");
  if (!isPositiveSafeInteger(event.policy_version) || event.policy_version > MAX_COUNTER)
    errors.push("policy_version is not a positive safe integer");
  if (
    !isPositiveSafeInteger(event.organization_sequence) ||
    event.organization_sequence > MAX_COUNTER
  )
    errors.push("organization_sequence is not a positive safe integer");
  if (typeof event.committed_at !== "string" || !event.committed_at.endsWith("Z"))
    errors.push("committed_at is not an exact UTC timestamp");
  if (!isRecord(event.payload)) errors.push("payload is not an object");

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

  if (knownEventType === "projection.heartbeat" && isRecord(event.payload)) {
    if (event.payload.watermark_sequence !== event.organization_sequence)
      errors.push("heartbeat watermark must equal organization_sequence");
  }
  if (containsForbiddenPersistedField(event))
    errors.push("event contains forbidden persisted field");

  const expected = value.expected;
  const canonicalBytes = value.canonicalBytes;
  const canonicalDigest = value.canonicalDigest;
  const descriptorPending =
    knownEventType === "key.verifier_published" || knownEventType === "key.rotated";
  if (descriptorPending) {
    if (expected !== "blocked_external")
      errors.push("descriptor event must remain blocked_external");
    if (canonicalBytes !== null || canonicalDigest !== null)
      errors.push("unbound descriptor event must not claim canonical applied bytes");
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
  if (!isRecord(value) || value.schemaVersion !== 1 || !Array.isArray(value.cases))
    return ["fixture collection schema is invalid"];
  const ids = value.cases.map((item) => (isRecord(item) ? item.id : undefined));
  if (ids.some((id) => typeof id !== "string") || new Set(ids).size !== ids.length)
    errors.push("fixture IDs must be unique strings");
  if (expectedIds.some((id) => !ids.includes(id))) errors.push("required fixture ID is missing");
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
  if (containsForbiddenPersistedField(value))
    errors.push("manifest contains forbidden persisted field");
  return errors;
}

export function verifyVolatileBoundary(input: {
  persisted: unknown;
  sentinels: readonly string[];
}) {
  const serialized = JSON.stringify(input.persisted);
  return input.sentinels.every((sentinel) => !serialized.includes(sentinel));
}
