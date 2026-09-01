import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import adapterCases from "../docs/interfaces/fixtures/data-platform-api-key-projection-v3/adapter-cases.json";
import acknowledgementCases from "../docs/interfaces/fixtures/data-platform-api-key-projection-v3/acknowledgement-replay-cases.json";
import eventCases from "../docs/interfaces/fixtures/data-platform-api-key-projection-v3/event-cases.json";
import failureCases from "../docs/interfaces/fixtures/data-platform-api-key-projection-v3/failure-redaction-cases.json";
import manifest from "../docs/interfaces/fixtures/data-platform-api-key-projection-v3/manifest.json";
import {
  ACKNOWLEDGEMENT_CASE_IDS,
  ADAPTER_CASE_IDS,
  CLOSED_EVENT_TYPES,
  DATA_T681_IDENTITY,
  FAILURE_CASE_IDS,
  REVIEWED_SCOPES,
  ROTATION_OVERLAP_MS,
  T018_IDENTITY,
  canonicalFixtureJson,
  sha256Hex,
  validateEventCase,
  validateFixtureCollection,
  validateManifest,
  verifyVolatileBoundary,
} from "../packages/developer-control-plane/src/projection-v3-readiness";

const organizationId = "00000000-0000-7000-8000-000000000401";
const projectId = "00000000-0000-7000-8000-000000000402";
const keyId = "00000000-0000-7000-8000-000000000403";

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

describe("Developer Control Plane projection v3 readiness", () => {
  it("binds the local fixture corpus to T018 and Data T681 without changing either contract", () => {
    expect(validateManifest(manifest)).toEqual([]);
    expect(manifest.webContract).toMatchObject({
      commit: T018_IDENTITY.commit,
      tree: T018_IDENTITY.tree,
    });
    expect(manifest.dataDependency).toMatchObject(DATA_T681_IDENTITY);
    expect(manifest.provider).toEqual({ status: "unbound", positiveVectors: "blocked_external" });
  });

  it("covers the authoritative adapter boundary and lifecycle cases", () => {
    const ids = adapterCases.cases.map((item) => item.id);
    expect(validateFixtureCollection(adapterCases, ids)).toEqual([]);
    expect(ids).toEqual(
      expect.arrayContaining([
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
      ]),
    );
    expect(ROTATION_OVERLAP_MS).toBe(24 * 60 * 60 * 1_000);
    expect(
      adapterCases.cases.find((item) => item.id === "rotation-overlap-boundaries"),
    ).toMatchObject({
      expected: {
        overlapMs: ROTATION_OVERLAP_MS,
        startsAt: "committed_at",
        boundary: "exclusive_after_86400_seconds",
      },
    });
    expect(adapterCases.cases.find((item) => item.id === "revoke-overrides-overlap")).toMatchObject(
      {
        expected: { revokePrecedence: "immediate" },
      },
    );
  });

  it("covers all eight events and keeps positive verifier publication unbound", () => {
    expect(eventCases.cases.map((item) => item.event_type)).toEqual([...CLOSED_EVENT_TYPES]);
    for (const item of eventCases.cases) expect(validateEventCase(item)).toEqual([]);
    expect(eventCases.cases.filter((item) => item.expected === "blocked_external")).toHaveLength(2);
    expect(eventCases.cases.filter((item) => item.expected === "local")).toHaveLength(6);
    expect(
      eventCases.cases.find((item) => item.event_type === "key.verifier_published"),
    ).toMatchObject({
      expected: "blocked_external",
      canonicalBytes: null,
      canonicalDigest: null,
    });
    expect(eventCases.cases.find((item) => item.event_type === "key.rotated")).toMatchObject({
      expected: "blocked_external",
      canonicalBytes: null,
      canonicalDigest: null,
    });
  });

  it("proves deterministic restricted fixture bytes and reviewed scopes", () => {
    const localEvents = eventCases.cases.filter((item) => item.expected === "local");
    for (const item of localEvents) {
      const canonicalBytes = item.canonicalBytes;
      const canonicalDigest = item.canonicalDigest;
      expect(typeof canonicalBytes).toBe("string");
      expect(typeof canonicalDigest).toBe("string");
      if (typeof canonicalBytes !== "string" || typeof canonicalDigest !== "string") continue;
      expect(canonicalFixtureJson(item.event)).toBe(canonicalBytes);
      expect(canonicalDigest).toBe(`sha256:${sha256Hex(canonicalBytes)}`);
    }
    expect(REVIEWED_SCOPES).toEqual(["bulk:read", "data:read", "geometry:read", "provenance:read"]);
    const policyChange = eventCases.cases.find((item) => item.event_type === "key.policy_changed");
    expect(policyChange?.event.payload.scopes).toEqual(["data:read", "provenance:read"]);
  });

  it("covers durable acknowledgement, duplicate, replay, gap, rollback, stale, and fail-closed cases", () => {
    expect(acknowledgementCases.cases.map((item) => item.expected)).toEqual([
      "applied",
      "quarantined",
      "original_bytes",
      "quarantined",
      "fail_closed",
      "replay_next",
      "fail_closed",
      "fail_closed",
    ]);
    expect(
      acknowledgementCases.cases
        .filter((item) => item.expected === "fail_closed")
        .every((item) => item.noStateMutation === true),
    ).toBe(true);
    expect(failureCases.cases.every((item) => item.expected === "fail_closed")).toBe(true);
  });

  it("validates every frozen collection semantically with fixed identities", () => {
    expect(validateFixtureCollection(adapterCases, ADAPTER_CASE_IDS)).toEqual([]);
    expect(
      validateFixtureCollection(
        eventCases,
        CLOSED_EVENT_TYPES.map((type) => `event-${type}`),
      ),
    ).toEqual([]);
    expect(validateFixtureCollection(acknowledgementCases, ACKNOWLEDGEMENT_CASE_IDS)).toEqual([]);
    expect(validateFixtureCollection(failureCases, FAILURE_CASE_IDS)).toEqual([]);
  });

  it("rejects hostile event envelope, payload, scope, and identity mutations", () => {
    const unsortedScopes = clone(eventCases) as unknown as {
      cases: Array<Record<string, unknown>>;
    };
    const unsortedPayload = unsortedScopes.cases[3].event as Record<string, unknown>;
    (unsortedPayload.payload as Record<string, unknown>).scopes = ["provenance:read", "data:read"];
    expect(validateEventCase(unsortedScopes.cases[3])).not.toEqual([]);

    const unknownScope = clone(eventCases) as unknown as { cases: Array<Record<string, unknown>> };
    const unknownPayload = unknownScope.cases[3].event as Record<string, unknown>;
    (unknownPayload.payload as Record<string, unknown>).scopes = ["data:read", "admin:write"];
    expect(validateEventCase(unknownScope.cases[3])).not.toEqual([]);

    const extraEnvelope = clone(eventCases) as unknown as { cases: Array<Record<string, unknown>> };
    (extraEnvelope.cases[2].event as Record<string, unknown>).projection_version = "3.0.0";
    expect(validateEventCase(extraEnvelope.cases[2])).not.toEqual([]);

    const nonEmptyRevocation = clone(eventCases) as unknown as {
      cases: Array<Record<string, unknown>>;
    };
    (nonEmptyRevocation.cases[2].event as Record<string, unknown>).payload = { reason: "revoked" };
    expect(validateEventCase(nonEmptyRevocation.cases[2])).not.toEqual([]);
  });

  it("rejects adapter outcome mutations instead of trusting case IDs", () => {
    const mutated = clone(adapterCases) as unknown as { cases: Array<Record<string, unknown>> };
    const providerFailure = mutated.cases[5].expected as Record<string, unknown>;
    providerFailure.outboxEvent = "present";
    providerFailure.display = "Bearer live-secret-sentinel";
    expect(validateFixtureCollection(mutated, ADAPTER_CASE_IDS)).not.toEqual([]);

    const spoofed = clone(adapterCases) as unknown as { cases: Array<Record<string, unknown>> };
    spoofed.cases[0].id = "project-binding-spoof";
    const spoofedIds = spoofed.cases.map((item) => item.id as string);
    expect(validateFixtureCollection(spoofed, spoofedIds)).not.toEqual([]);

    const wrongExpectedIds = [...ADAPTER_CASE_IDS.slice(1), ADAPTER_CASE_IDS[0]];
    expect(validateFixtureCollection(adapterCases, wrongExpectedIds)).not.toEqual([]);
  });

  it("fails closed for nonfinite, negative, and fractional event counters", () => {
    for (const malformed of [NaN, Infinity, -1, 1.5, 0]) {
      const mutated = clone(eventCases) as unknown as { cases: Array<Record<string, unknown>> };
      const event = mutated.cases[2].event as Record<string, unknown>;
      event.organization_sequence = malformed;
      expect(validateEventCase(mutated.cases[2])).not.toEqual([]);
    }
  });

  it("rejects failure/redaction sensitive rule values while preserving the declarative rule token", () => {
    expect(validateFixtureCollection(failureCases, FAILURE_CASE_IDS)).toEqual([]);
    const mutated = clone(failureCases) as unknown as { cases: Array<Record<string, unknown>> };
    const rules = mutated.cases[4].rules as unknown[];
    rules[3] = "Bearer live-secret-sentinel";
    expect(validateFixtureCollection(mutated, FAILURE_CASE_IDS)).not.toEqual([]);
  });

  it("keeps show-once values out of persisted entities, events, acknowledgements, metrics, errors, and serialization", () => {
    const sentinels = [
      "t020-volatile-display-sentinel",
      "t020-authorization-header-sentinel",
      "t020-session-sentinel",
    ];
    const persisted = {
      entities: [{ organizationId, projectId, keyId, status: "active" }],
      audits: [{ action: "key.created", keyId }],
      outbox: [{ eventType: "key.verifier_published", keyId, descriptorStatus: "unbound" }],
      metrics: [{ name: "dcp.lifecycle.result", state: "fail_closed" }],
      errors: [{ code: "DCP_REDACTED" }],
      serialized: "[REDACTED]",
    };
    expect(verifyVolatileBoundary({ persisted, sentinels })).toBe(true);
    expect(JSON.stringify(persisted)).not.toContain("t020-volatile-display-sentinel");
    const collectKeys = (value: unknown): string[] => {
      if (Array.isArray(value)) return value.flatMap(collectKeys);
      if (typeof value !== "object" || value === null) return [];
      return Object.entries(value).flatMap(([key, child]) => [key, ...collectKeys(child)]);
    };
    const persistedKeys = [...collectKeys(manifest), ...collectKeys(eventCases)];
    expect(
      persistedKeys.some((key) =>
        /plaintext|authorization|bearer|header|secret|session|token|material/i.test(key),
      ),
    ).toBe(false);
  });

  it("keeps fixture evidence local and offline", () => {
    const root = process.cwd();
    expect(
      fs.existsSync(
        path.join(root, "docs", "interfaces", "fixtures", "data-platform-api-key-projection-v3"),
      ),
    ).toBe(true);
    expect(
      JSON.stringify({ adapterCases, acknowledgementCases, eventCases, failureCases }),
    ).not.toContain("@better-auth/api-key");
    expect(
      JSON.stringify({ adapterCases, acknowledgementCases, eventCases, failureCases }),
    ).not.toContain("hmac-sha256-v1");
  });
});
