# ADR-0015: Developer Control Plane foundation controls

## Status

Accepted for DCP-1A non-production repository implementation only.

## Context

DCP-0 established that Web owns human identity, organizations, projects, role authorization, API-key lifecycle, audit, and the transactional outbox. Data Platform owns only a fail-closed machine-verifier projection. DCP-1A needs a locally testable domain boundary without inventing key cryptography, accepting the Data wire contract, or activating infrastructure.

## Decision

- Pin Better Auth core, its organization plugin, and direct PostgreSQL support for the human identity/session and organization boundary. Do not install Better Auth's API-key plugin or Unkey in DCP-1A.
- Keep `DCP_ENABLED` and `DCP_FIXTURE_AUTH_ENABLED` false by default. Enabled initialization requires server-only database and Better Auth secret references plus an exact trusted-origin allowlist.
- Use database-backed sessions with host-only cookies, seven-day expiry, one-day refresh, five-minute freshness, origin and CSRF checks enabled, and no stateless, cookie-cache, or API-key sessions.
- Configure Better Auth 1.7.2's organization plugin with explicit owner, admin, developer, and read-only-analyst roles. Retain the pinned plugin's `member` storage default as a compatibility alias with the developer permissions; the migration verifier checks this mapping against the installed `getAuthTables` result.
- Model credentials as organization → project → key. Roles are owner, admin, developer, and read-only analyst; every command receives explicit organization and project authorization.
- Keep key generation and verification behind `ApiKeyProvider`. The only DCP-1A adapter is deterministic and test-only, uses caller-supplied fake material, and cannot define a production format, hash, digest, or verifier.
- Persist metadata only. Create and rotate may return caller-supplied fixture plaintext exactly once; list, retries, storage, audit, outbox, metrics, errors, and serialization never contain key/session/header material.
- Rotate with exactly 24 hours of predecessor overlap. Revocation is immediate and always overrides overlap.
- Commit lifecycle metadata, append-only redacted audit, and outbox records in one repository transaction. Use UUIDv7 internal IDs, per-organization monotonic policy versions, immutable command/event IDs, and explicit pending/failed/acknowledged delivery states.
- Keep `ProjectionTransport` disabled. DCP-1A defines sequencing and fail-closed domain invariants but performs no Data-compatible wire mapping or network call.
- Generate and validate PostgreSQL migrations for separate `auth` and `control` schemas and least-privilege role intent. Do not connect or apply them.
- Reject malformed UUIDv7 command/correlation identities and non-allowlisted reason codes before repository/provider access. Reject non-finite, negative, fractional, or unsafe projection ages/policy versions and fail closed on duplicate, gap, rollback, stale, or unknown input.
- Derive migration parity from Better Auth 1.7.2 `getAuthTables`; validate the exact auth model/field surface, direct PostgreSQL types, custom UUIDv7 text-ID strategy, organization defaults, indexes, foreign keys, and configured role set without connecting to a database.

## Operational controls

Revocation delivery age has warning, critical, and fail-closed thresholds at 30, 45, and 60 seconds. Audit records are retained for 400 days, acknowledged outbox records for 30 days, failed outbox records for 90 days, and idempotency records for 30 days; legal hold or active incident state prevents purge. Metrics use bounded names and states only and never carry opaque identifiers or personal/key material.

## Consequences

DCP-1A can prove the Web-owned control-plane kernel locally while API-key provider/verifier choice, Data v2 acceptance, transport, live database/provider use, Tower apply, external security/privacy approval, UI, deployment, and production remain gated. D-018 and all RC3 evidence remain unchanged.
