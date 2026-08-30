import { describe, expect, it } from "vitest";
import { parseEnv } from "../packages/config/src/env";
import {
  createDeveloperAuthOptions,
  DCP_REASON_CODES,
  DeveloperAuthConfigurationError,
  DeveloperControlPlane,
  disabledProjectionTransport,
  DuplicateCommandError,
  evaluateProjectionSequence,
  InvalidLifecycleInputError,
  outboxPurgeEligible,
  revocationDeliveryState,
  type AuthorizedActor,
  type DeveloperProject,
} from "../packages/developer-control-plane/src";
import {
  CollectingMetrics,
  DeterministicFixtureApiKeyProvider,
  InMemoryControlPlaneRepository,
} from "../packages/developer-control-plane/src/fixtures";

const organizationId = "00000000-0000-7000-8000-000000000201";
const projectId = "00000000-0000-7000-8000-000000000202";
const project: DeveloperProject = {
  id: projectId,
  organizationId,
  name: "Security fixture",
  status: "active",
  createdAt: new Date("2026-08-30T00:00:00.000Z"),
};
const actor: AuthorizedActor = {
  userId: "00000000-0000-7000-8000-000000000203",
  sessionId: "fixture-session-material-must-not-persist",
  organizationId,
  role: "owner",
  sessionFresh: true,
};

describe("Developer Control Plane security", () => {
  it("is disabled by default and requires server-side references before initialization", () => {
    const env = parseEnv({} as NodeJS.ProcessEnv);
    expect(env.DCP_ENABLED).toBe("false");
    expect(env.DCP_FIXTURE_AUTH_ENABLED).toBe("false");
    expect(() => parseEnv({ DCP_ENABLED: "true" } as unknown as NodeJS.ProcessEnv)).toThrow();
    expect(() =>
      createDeveloperAuthOptions({
        enabled: false,
        fixtureAuthEnabled: false,
        database: undefined,
        secret: undefined,
        baseURL: undefined,
        trustedOrigins: [],
      }),
    ).toThrow(DeveloperAuthConfigurationError);
  });

  it("rejects wildcard, path-bearing, credential-bearing, and base-origin-missing origins", () => {
    const base = {
      enabled: true,
      fixtureAuthEnabled: false,
      database: {} as never,
      secret: "fixture-only-secret-reference-value-0002",
      baseURL: "https://console.dev.tower",
    };
    for (const trustedOrigins of [
      ["https://*.dev.tower"],
      ["https://console.dev.tower/path"],
      ["https://user:pass@console.dev.tower"],
      ["https://different.dev.tower"],
    ])
      expect(() => createDeveloperAuthOptions({ ...base, trustedOrigins })).toThrow(
        DeveloperAuthConfigurationError,
      );
  });

  it("never persists or serializes plaintext, headers, sessions, or key material", async () => {
    const secret = "fixture-secret-do-not-persist";
    const repository = new InMemoryControlPlaneRepository([project]);
    const provider = new DeterministicFixtureApiKeyProvider({
      environment: "test",
      material: [{ providerKeyId: "fixture-provider", displayMaterial: secret }],
    });
    const metrics = new CollectingMetrics();
    const generated = [
      "00000000-0000-7000-8000-000000000211",
      "00000000-0000-7000-8000-000000000212",
      "00000000-0000-7000-8000-000000000213",
    ];
    const service = new DeveloperControlPlane({
      repository,
      provider,
      metrics,
      idFactory: () => generated.shift()!,
    });
    const command = {
      actor,
      projectId,
      commandId: "00000000-0000-7000-8000-000000000214",
      correlationId: "00000000-0000-7000-8000-000000000215",
      name: "Fixture",
      now: new Date("2026-08-30T00:00:00.000Z"),
    };
    const result = await service.createKey(command);
    expect(JSON.stringify(result)).toContain("[REDACTED]");
    expect(JSON.stringify(result)).not.toContain(secret);
    const snapshot = repository.snapshot();
    const persisted = JSON.stringify({
      projects: [...snapshot.projects.values()],
      keys: [...snapshot.keys.values()],
      idempotency: [...snapshot.idempotency.values()],
      audits: snapshot.audits,
      outbox: snapshot.outbox,
      metrics: metrics.records,
    });
    for (const forbidden of [secret, actor.sessionId, "Authorization", "Bearer "])
      expect(persisted).not.toContain(forbidden);
    expect([...snapshot.keys.values()][0]).not.toHaveProperty("secret");
    expect([...snapshot.keys.values()][0]).not.toHaveProperty("verifier");
    await expect(service.createKey(command)).rejects.toBeInstanceOf(DuplicateCommandError);
    expect(provider.calls).toEqual(["create"]);
    expect(JSON.stringify(new DuplicateCommandError())).not.toContain(secret);
  });

  it("rejects hostile lifecycle identity and reason sentinels before repository or provider access", async () => {
    const repository = new InMemoryControlPlaneRepository([project]);
    let repositoryCalls = 0;
    const guardedRepository = {
      transaction: async () => {
        repositoryCalls += 1;
        throw new Error("repository sentinel should not be reached");
      },
    };
    const provider = new DeterministicFixtureApiKeyProvider({
      environment: "test",
      material: [],
    });
    const metrics = new CollectingMetrics();
    const service = new DeveloperControlPlane({
      repository: guardedRepository as never,
      provider,
      metrics,
    });
    const validCorrelationId = "00000000-0000-7000-8000-000000000216";
    const validCommandId = "00000000-0000-7000-8000-000000000217";
    const hostileCases = [
      {
        operation: () =>
          service.createKey({
            actor,
            projectId,
            commandId: "command-id-sentinel-plaintext" as never,
            correlationId: validCorrelationId,
            name: "Fixture",
            now: new Date("2026-08-30T00:00:00.000Z"),
          }),
        sentinel: "command-id-sentinel-plaintext",
      },
      {
        operation: () =>
          service.createKey({
            actor,
            projectId,
            commandId: validCommandId,
            correlationId: "correlation-id-sentinel-authorization-header" as never,
            name: "Fixture",
            now: new Date("2026-08-30T00:00:00.000Z"),
          }),
        sentinel: "correlation-id-sentinel-authorization-header",
      },
      {
        operation: () =>
          service.revokeKey({
            actor,
            keyId: projectId,
            commandId: validCommandId,
            correlationId: validCorrelationId,
            reasonCode: "reason-code-sentinel-secret" as never,
            now: new Date("2026-08-30T00:00:00.000Z"),
          }),
        sentinel: "reason-code-sentinel-secret",
      },
    ];

    for (const { operation, sentinel } of hostileCases) {
      let caught: unknown;
      try {
        await operation();
      } catch (error) {
        caught = error;
      }
      expect(caught).toBeInstanceOf(InvalidLifecycleInputError);
      const serializedError = `${String(caught)} ${JSON.stringify(caught)}`;
      expect(serializedError).not.toContain(sentinel);
    }

    const persisted = JSON.stringify({
      ...repository.snapshot(),
      metrics: metrics.records,
    });
    expect(repositoryCalls).toBe(0);
    expect(provider.calls).toEqual([]);
    expect(metrics.records).toEqual([]);
    for (const sentinel of [
      "command-id-sentinel-plaintext",
      "correlation-id-sentinel-authorization-header",
      "reason-code-sentinel-secret",
    ])
      expect(persisted).not.toContain(sentinel);
    expect(DCP_REASON_CODES).toContain("owner-request");
  });

  it("fails closed for gap, rollback, unknown, stale, and disabled transport states", async () => {
    expect(
      evaluateProjectionSequence({
        currentPolicyVersion: 4,
        incomingPolicyVersion: 5,
        eventVersionKnown: true,
        policyKnown: true,
        ageSeconds: 1,
      }),
    ).toBe("accept");
    expect(
      evaluateProjectionSequence({
        currentPolicyVersion: 4,
        incomingPolicyVersion: 4,
        eventVersionKnown: true,
        policyKnown: true,
        ageSeconds: 1,
      }),
    ).toBe("duplicate");
    for (const partial of [
      { incomingPolicyVersion: 6 },
      { incomingPolicyVersion: 3 },
      { eventVersionKnown: false },
      { policyKnown: false },
      { ageSeconds: 60 },
    ])
      expect(
        evaluateProjectionSequence({
          currentPolicyVersion: 4,
          incomingPolicyVersion: 5,
          eventVersionKnown: true,
          policyKnown: true,
          ageSeconds: 1,
          ...partial,
        }),
      ).toBe("fail_closed");
    for (const invalid of [Number.NaN, Number.POSITIVE_INFINITY, -1, 1.5]) {
      expect(revocationDeliveryState(invalid)).toBe("fail_closed");
      expect(
        evaluateProjectionSequence({
          currentPolicyVersion: 4,
          incomingPolicyVersion: 5,
          eventVersionKnown: true,
          policyKnown: true,
          ageSeconds: invalid,
        }),
      ).toBe("fail_closed");
      expect(
        evaluateProjectionSequence({
          currentPolicyVersion: invalid,
          incomingPolicyVersion: 5,
          eventVersionKnown: true,
          policyKnown: true,
          ageSeconds: 1,
        }),
      ).toBe("fail_closed");
      expect(
        evaluateProjectionSequence({
          currentPolicyVersion: 4,
          incomingPolicyVersion: invalid,
          eventVersionKnown: true,
          policyKnown: true,
          ageSeconds: 1,
        }),
      ).toBe("fail_closed");
    }
    expect(disabledProjectionTransport.enabled).toBe(false);
    await expect(disabledProjectionTransport.publish()).rejects.toThrow("unavailable or invalid");
  });

  it("uses exact 30/45/60 second revocation thresholds and retention holds", () => {
    expect(revocationDeliveryState(29)).toBe("ok");
    expect(revocationDeliveryState(30)).toBe("warning");
    expect(revocationDeliveryState(45)).toBe("critical");
    expect(revocationDeliveryState(60)).toBe("fail_closed");
    const occurredAt = new Date("2026-01-01T00:00:00.000Z");
    const record = {
      id: "00000000-0000-7000-8000-000000000220",
      organizationId,
      projectId,
      keyId: "00000000-0000-7000-8000-000000000221",
      eventType: "key.revoked" as const,
      policyVersion: 1,
      state: "acknowledged" as const,
      attemptCount: 1,
      occurredAt,
      acknowledgedAt: occurredAt,
      failedAt: null,
    };
    expect(
      outboxPurgeEligible({
        record,
        now: new Date("2026-01-31T00:00:00.000Z"),
        legalHold: false,
        activeIncident: false,
      }),
    ).toBe(true);
    expect(
      outboxPurgeEligible({
        record,
        now: new Date("2027-01-01T00:00:00.000Z"),
        legalHold: true,
        activeIncident: false,
      }),
    ).toBe(false);
  });
});
