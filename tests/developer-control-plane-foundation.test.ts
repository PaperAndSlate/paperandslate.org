import { describe, expect, it } from "vitest";
import {
  createDeveloperAuthOptions,
  authorizeProject,
  DCP_BETTER_AUTH_ROLE_MAP,
  DCP_BETTER_AUTH_STORAGE_ROLES,
  DCP_SESSION_FRESH_SECONDS,
  DCP_SESSION_REFRESH_SECONDS,
  DCP_SESSION_SECONDS,
  DeveloperControlPlane,
  rolePermissions,
  ROTATION_OVERLAP_MS,
  type AuthorizedActor,
  type DeveloperProject,
  type OrganizationRole,
  type Permission,
} from "../packages/developer-control-plane/src";
import {
  CollectingMetrics,
  DeterministicFixtureApiKeyProvider,
  InMemoryControlPlaneRepository,
} from "../packages/developer-control-plane/src/fixtures";

const ids = [
  "00000000-0000-7000-8000-000000000101",
  "00000000-0000-7000-8000-000000000102",
  "00000000-0000-7000-8000-000000000103",
  "00000000-0000-7000-8000-000000000104",
  "00000000-0000-7000-8000-000000000105",
  "00000000-0000-7000-8000-000000000106",
  "00000000-0000-7000-8000-000000000107",
  "00000000-0000-7000-8000-000000000108",
];
const organizationId = "00000000-0000-7000-8000-000000000001";
const projectId = "00000000-0000-7000-8000-000000000002";
const project: DeveloperProject = {
  id: projectId,
  organizationId,
  name: "Fixture project",
  status: "active",
  createdAt: new Date("2026-08-30T00:00:00.000Z"),
};
const owner: AuthorizedActor = {
  userId: "00000000-0000-7000-8000-000000000003",
  sessionId: "fixture-session-reference",
  organizationId,
  role: "owner",
  sessionFresh: true,
};

function createFixture() {
  const repository = new InMemoryControlPlaneRepository([project]);
  const provider = new DeterministicFixtureApiKeyProvider({
    environment: "test",
    material: [
      { providerKeyId: "fixture-provider-1", displayMaterial: "fixture-display-create" },
      { providerKeyId: "fixture-provider-2", displayMaterial: "fixture-display-rotate" },
    ],
  });
  const metrics = new CollectingMetrics();
  let index = 0;
  const service = new DeveloperControlPlane({
    repository,
    provider,
    metrics,
    idFactory: () => ids[index++],
  });
  return { repository, provider, metrics, service };
}

describe("Developer Control Plane foundation", () => {
  it("builds database-backed Better Auth organization options with exact session controls", () => {
    const options = createDeveloperAuthOptions({
      enabled: true,
      fixtureAuthEnabled: true,
      database: {} as never,
      secret: "fixture-only-secret-reference-value-0001",
      baseURL: "https://console.dev.tower",
      trustedOrigins: ["https://console.dev.tower"],
    });
    expect(options.database).toBeDefined();
    expect(options.trustedOrigins).toEqual(["https://console.dev.tower"]);
    expect(options.session).toMatchObject({
      expiresIn: DCP_SESSION_SECONDS,
      updateAge: DCP_SESSION_REFRESH_SECONDS,
      freshAge: DCP_SESSION_FRESH_SECONDS,
      cookieCache: { enabled: false },
    });
    expect(DCP_SESSION_SECONDS).toBe(7 * 24 * 60 * 60);
    expect(DCP_SESSION_REFRESH_SECONDS).toBe(24 * 60 * 60);
    expect(DCP_SESSION_FRESH_SECONDS).toBe(5 * 60);
    expect(options.advanced).toMatchObject({
      crossSubDomainCookies: { enabled: false },
      disableCSRFCheck: false,
      disableOriginCheck: false,
    });
    expect(options.advanced?.defaultCookieAttributes).not.toHaveProperty("domain");
    expect(options.plugins).toHaveLength(1);
    const organizationPlugin = options.plugins?.[0] as unknown as {
      options?: { creatorRole?: string; roles?: Record<string, unknown> };
    };
    expect(organizationPlugin.options?.creatorRole).toBe("owner");
    expect(Object.keys(organizationPlugin.options?.roles ?? {}).sort()).toEqual(
      [...DCP_BETTER_AUTH_STORAGE_ROLES].sort(),
    );
    expect(DCP_BETTER_AUTH_ROLE_MAP).toMatchObject({
      owner: "owner",
      admin: "admin",
      developer: "developer",
      read_only_analyst: "read_only_analyst",
    });
  });

  it("defines every role permission allow and deny edge", () => {
    const all: Permission[] = [
      "project.create",
      "project.read",
      "project.update",
      "project.delete",
      "key.create",
      "key.list",
      "key.rotate",
      "key.revoke",
      "audit.read",
      "membership.manage",
    ];
    const expected: Record<OrganizationRole, Permission[]> = {
      owner: all,
      admin: all.filter((permission) => permission !== "project.delete"),
      developer: ["project.read", "key.create", "key.list", "key.rotate"],
      read_only_analyst: ["project.read", "key.list", "audit.read"],
    };
    for (const [role, permissions] of Object.entries(expected) as Array<
      [OrganizationRole, Permission[]]
    >)
      for (const permission of all)
        expect(rolePermissions[role].has(permission), `${role}:${permission}`).toBe(
          permissions.includes(permission),
        );

    for (const [role, permissions] of Object.entries(expected) as Array<
      [OrganizationRole, Permission[]]
    >) {
      const actor = { ...owner, role };
      for (const permission of all) {
        const action = () => authorizeProject(actor, project, permission);
        if (permissions.includes(permission)) expect(action, `${role}:${permission}`).not.toThrow();
        else expect(action, `${role}:${permission}`).toThrow("not authorized");
      }
    }
    expect(() =>
      authorizeProject({ ...owner, organizationId: ids[0] }, project, "key.list"),
    ).toThrow("not authorized");
    expect(() =>
      authorizeProject({ ...owner, sessionFresh: false }, project, "key.revoke", {
        requireFreshSession: true,
      }),
    ).toThrow("not authorized");
  });

  it("creates, lists, rotates, and revokes metadata with exact overlap and revoke precedence", async () => {
    const { repository, service } = createFixture();
    const now = new Date("2026-08-30T12:00:00.000Z");
    const created = await service.createKey({
      actor: owner,
      projectId,
      commandId: "00000000-0000-7000-8000-000000000011",
      correlationId: "00000000-0000-7000-8000-000000000012",
      name: "Build client",
      now,
    });
    expect(created.reveal.consume()).toBe("fixture-display-create");
    expect(() => created.reveal.consume()).toThrow("unavailable or invalid");
    expect(await service.listKeys({ actor: owner, projectId })).toEqual([created.metadata]);
    const rotated = await service.rotateKey({
      actor: owner,
      keyId: created.metadata.id,
      commandId: "00000000-0000-7000-8000-000000000013",
      correlationId: "00000000-0000-7000-8000-000000000014",
      now,
    });
    expect(rotated.predecessor.overlapEndsAt!.getTime() - now.getTime()).toBe(ROTATION_OVERLAP_MS);
    expect(rotated.reveal.consume()).toBe("fixture-display-rotate");
    const revoked = await service.revokeKey({
      actor: owner,
      keyId: rotated.predecessor.id,
      commandId: "00000000-0000-7000-8000-000000000015",
      correlationId: "00000000-0000-7000-8000-000000000016",
      reasonCode: "owner-request",
      now,
    });
    expect(revoked.status).toBe("revoked");
    expect(revoked.overlapEndsAt).toBeNull();
    const snapshot = repository.snapshot();
    expect(snapshot.policyVersions.get(organizationId)).toBe(3);
    expect(snapshot.audits).toHaveLength(3);
    expect(snapshot.outbox).toHaveLength(3);
    expect(snapshot.outbox.every((record) => record.state === "pending")).toBe(true);
  });
});
