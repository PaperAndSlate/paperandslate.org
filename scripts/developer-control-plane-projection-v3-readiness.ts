import fs from "node:fs";
import path from "node:path";
import {
  CLOSED_EVENT_TYPES,
  T018_IDENTITY,
  DATA_T681_IDENTITY,
  validateEventCase,
  validateFixtureCollection,
  validateManifest,
} from "../packages/developer-control-plane/src/projection-v3-readiness";

type JsonRecord = Record<string, unknown>;

function readJson(root: string, relativePath: string): unknown {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8")) as unknown;
}

function requireCondition(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(`DCP projection v3 readiness check failed: ${message}`);
}

function asRecord(value: unknown, label: string): JsonRecord {
  requireCondition(
    typeof value === "object" && value !== null && !Array.isArray(value),
    `${label} is not an object`,
  );
  return value as JsonRecord;
}

function validateNoSensitiveFixtureValues(value: unknown, label: string) {
  if (Array.isArray(value)) {
    value.forEach((item) => validateNoSensitiveFixtureValues(item, label));
    return;
  }
  if (typeof value !== "object" || value === null) return;
  for (const [key, child] of Object.entries(value as JsonRecord)) {
    requireCondition(
      !/(?:plaintext|authorization|bearer|header|secret|session|token|material)/i.test(key),
      `${label} contains a forbidden field name: ${key}`,
    );
    validateNoSensitiveFixtureValues(child, label);
  }
}

export function runProjectionV3ReadinessCheck() {
  const root = process.cwd();
  requireCondition(process.argv.includes("--check"), "--check is required");
  requireCondition(process.argv.includes("--offline"), "--offline is required");

  const directory = "docs/interfaces/fixtures/data-platform-api-key-projection-v3";
  const manifest = readJson(root, `${directory}/manifest.json`);
  const adapter = readJson(root, `${directory}/adapter-cases.json`);
  const events = readJson(root, `${directory}/event-cases.json`);
  const acknowledgements = readJson(root, `${directory}/acknowledgement-replay-cases.json`);
  const failures = readJson(root, `${directory}/failure-redaction-cases.json`);

  const manifestErrors = validateManifest(manifest);
  requireCondition(manifestErrors.length === 0, manifestErrors.join("; "));
  const manifestRecord = asRecord(manifest, "manifest");
  const webContract = asRecord(manifestRecord.webContract, "web contract");
  const dataDependency = asRecord(manifestRecord.dataDependency, "Data dependency");
  requireCondition(webContract.commit === T018_IDENTITY.commit, "T018 commit mismatch");
  requireCondition(webContract.tree === T018_IDENTITY.tree, "T018 tree mismatch");
  requireCondition(dataDependency.commit === DATA_T681_IDENTITY.commit, "Data commit mismatch");
  requireCondition(dataDependency.tree === DATA_T681_IDENTITY.tree, "Data tree mismatch");

  const adapterIds = [
    "project-binding-authoritative",
    "create-show-once-redaction",
    "list-metadata-only",
    "exact-command-retry",
    "mismatched-command-retry-fail-closed",
    "provider-failure-no-event",
    "provider-success-web-failure-no-reveal",
    "rotation-overlap-boundaries",
    "revoke-overrides-overlap",
    "project-and-organization-disable-precedence",
  ];
  const adapterErrors = validateFixtureCollection(adapter, adapterIds);
  requireCondition(adapterErrors.length === 0, adapterErrors.join("; "));

  const eventIds = CLOSED_EVENT_TYPES.map((eventType) => `event-${eventType}`);
  const eventErrors = validateFixtureCollection(events, eventIds);
  requireCondition(eventErrors.length === 0, eventErrors.join("; "));
  const eventRecords = asRecord(events, "event fixtures").cases as unknown[];
  const eventCaseErrors = eventRecords.flatMap((eventCase) => validateEventCase(eventCase));
  requireCondition(eventCaseErrors.length === 0, eventCaseErrors.join("; "));

  const acknowledgementIds = [
    "durable-applied-acknowledgement",
    "durable-quarantined-acknowledgement",
    "exact-duplicate-original-bytes",
    "mismatched-duplicate-quarantine",
    "gap-rollback-policy-rollback-fail-closed",
    "replay-from-last-durable-ack-plus-one",
    "heartbeat-stale-and-watermark-mismatch",
    "noninteger-and-unknown-state-fail-closed",
  ];
  requireCondition(
    validateFixtureCollection(acknowledgements, acknowledgementIds).length === 0,
    "acknowledgement/replay matrix is incomplete",
  );

  const failureIds = [
    "unknown-event-or-version",
    "unknown-binding-or-key-reference",
    "malformed-counters-and-scopes",
    "revocation-disable-replay-precedence",
    "outage-retry-and-redaction-sentinels",
  ];
  requireCondition(
    validateFixtureCollection(failures, failureIds).length === 0,
    "failure/redaction matrix is incomplete",
  );

  for (const fixture of [adapter, events, acknowledgements, failures])
    validateNoSensitiveFixtureValues(fixture, "fixture corpus");

  const eventCaseValues = eventRecords.map((item) => asRecord(item, "event case"));
  requireCondition(
    eventCaseValues
      .filter(
        (item) => item.event_type === "key.verifier_published" || item.event_type === "key.rotated",
      )
      .every((item) => item.expected === "blocked_external" && item.canonicalBytes === null),
    "positive descriptor vectors must remain unbound and blocked_external",
  );
  requireCondition(
    eventCaseValues.filter((item) => item.expected === "local").length === 6,
    "the local event-byte count must remain six",
  );

  console.log(
    JSON.stringify(
      {
        check: "dcp-projection-v3-readiness",
        mode: "offline-fixture-only",
        evidenceClass: "local-fixture-only",
        t018: { commit: T018_IDENTITY.commit, tree: T018_IDENTITY.tree },
        dataT681: { commit: DATA_T681_IDENTITY.commit, tree: DATA_T681_IDENTITY.tree },
        closedEventTypes: CLOSED_EVENT_TYPES,
        positiveVerifierVectors: "blocked_external",
        fixtureCollections: {
          adapter: adapterIds.length,
          events: eventIds.length,
          acknowledgements: acknowledgementIds.length,
          failures: failureIds.length,
        },
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
    .endsWith("/developer-control-plane-projection-v3-readiness.ts")
)
  runProjectionV3ReadinessCheck();
