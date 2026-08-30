# Developer Control Plane Foundation and Interface Contract

## Status and boundary

DCP-0 is a complete non-production planning artifact succeeding, but not changing, D-018. D-018 remains the public-site/RC3 decision: no authentication, user models, API keys, organization claims, or authenticated console. DCP-1A is the separately authorized repository-only, fixture-gated kernel described below. Neither phase implements a public route, console, provider integration, Tower resource, deployment, or RC3 reclassification.

## Ownership

Better Auth is the preferred future human-identity system, subject to implementation approval. In a separate logical Web-owned identity/control database it owns users, sessions, accounts, organizations, and memberships. Tower Keycloak is rejected as application identity.

The ownership chain is `organization → project → key`; a key never belongs directly to a user. Web owns organization RBAC, human mutation authorization, the lifecycle control plane, audit records, and a transactional outbox. Data Platform owns only the projected machine verifier and usage enforcement. Users, accounts, memberships, and sessions never enter that projection.

## Provider decision gate

Better Auth core, its organization plugin, and direct PostgreSQL support are selected for DCP-1A's fixture-gated human identity and organization/session configuration. Better Auth's API-key plugin remains only a candidate: official documentation describes organization-owned keys, key creation/management/verification, metadata, expiry, and secondary storage, but does not by itself prove Paper & Slate's required project binding, portable Data Platform verifier, audit model, rotation/revocation propagation, runtime, or security fit. Select no API-key provider and invent no key format until a later review establishes every one of those items.

Official primary sources consulted for this narrow candidate characterization:

- [Better Auth organization plugin](https://better-auth.com/docs/plugins/organization)
- [Better Auth API-key plugin](https://better-auth.com/docs/plugins/api-key)
- [Better Auth API-key reference](https://better-auth.com/docs/plugins/api-key/reference)

These sources do not establish project binding, portable verification, audit, rotation/revocation propagation, runtime acceptance, or security acceptance for Paper & Slate. Provider selection remains pending.

## Lifecycle and security invariants

- Generate a plaintext key only server-side, show it once, and never persist it, log it, email it, expose it to analytics/session replay, or include it in audit payloads. Store only future provider-approved non-secret metadata/verifier material.
- Support create, list (redacted metadata only), rotate, and revoke. Every mutation requires a current session, organization authorization, CSRF protection where cookie-authenticated, and recent-auth revalidation.
- A replacement key overlaps its predecessor for exactly **24 hours** from the recorded rotation time. Revocation overrides that overlap immediately.
- A revoked key must become unusable at Data Platform within **60 seconds** at most; uncertainty, stale policy, unknown event version, unavailable verifier state, or missing authorization fails closed.
- Audit actor, organization, project, key identifier, action, result, policy version, correlation ID, and redacted reason; never audit secrets or authorization headers.
- Validate command and correlation identities as UUIDv7 strings and accept reason codes only from the bounded DCP allowlist before entering a repository transaction or calling a provider. Invalid input returns a stable redacted error and produces no persisted, audit, outbox, metric, or serialized-input record.
- Projection ages and policy versions are finite, safe, non-negative integers. NaN, infinity, negative, fractional, duplicate, gap, rollback, stale, and unknown states fail closed.

## DCP-1A repository-only kernel

DCP-1A may implement only the Web-owned domain and safety boundary:

- Better Auth core and organization configuration behind `DCP_ENABLED=false` and `DCP_FIXTURE_AUTH_ENABLED=false` defaults, with exact trusted origins, origin/CSRF checks, host-only cookies, database sessions, seven-day expiry, one-day refresh, and five-minute freshness;
- organization, project, membership-role, authorization, key-metadata, redacted audit, transactional outbox, retention, and metrics contracts;
- a provider-neutral `ApiKeyProvider` port and deterministic test-only adapter that accepts caller-supplied fake material and never defines a real key format or verifier;
- create, redacted-list, rotate, and revoke orchestration with exactly 24 hours of overlap, immediate revocation precedence, one-time return behavior, UUIDv7 internal identities, monotonic per-organization policy versions, and idempotency/replay metadata;
- a disabled `ProjectionTransport` port only. DCP-1A does not map or emit the Data Platform wire contract;
- deterministic, generate/validate-only PostgreSQL migrations for separate `auth` and `control` schemas and least-privilege role intent.
- migration parity is derived from the installed pinned Better Auth 1.7.2 `getAuthTables` surface, including model names, physical field names/types, requiredness, indexes, foreign keys, defaults, and the configured organization role mapping. The custom UUIDv7 generator therefore has text IDs in the auth schema; this remains generate/validate-only.

The kernel remains server-only and cannot initialize when enabled without database and Better Auth secret references. It must not add public auth routes, signup, UI, email/OAuth, billing, provider credentials, live database connections, Data transport, or Tower apply.

## Deferred DCP-1B gates

The Data Platform's source-owned v2 receipt is producer-defined but still awaits Web acceptance. DCP-1B remains blocked on an immutable accepted Web/Data artifact identity, agreed IDs/scopes/policy version, verifier/provider selection, transport authentication, managed secret binding, joint fixtures, and security/privacy review. The Tower file remains reviewed desired-state intent only, not an apply request.
