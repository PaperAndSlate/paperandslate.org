# Developer Control Plane Foundation and Interface Contract

## Status and boundary

DCP-0 is a complete non-production planning artifact succeeding, but not changing, D-018. D-018 remains the public-site/RC3 decision: no authentication, user models, API keys, organization claims, or authenticated console. DCP-1A is the separately authorized repository-only, fixture-gated kernel described below. DCP-1A.5 adds a documentation-only **Proposed** Web-owned projection/verifier contract candidate. None of these phases implements a public route, console, provider integration, transport, managed-secret binding, Tower resource, deployment, DCP-1B, or RC3 reclassification.

## Ownership

Better Auth is the preferred future human-identity system, subject to implementation approval. In a separate logical Web-owned identity/control database it owns users, sessions, accounts, organizations, and memberships. Tower Keycloak is rejected as application identity.

The ownership chain is `organization → project → key`; a key never belongs directly to a user. Web owns organization RBAC, human mutation authorization, the lifecycle control plane, audit records, and a transactional outbox. Data Platform owns only the projected machine verifier and usage enforcement. Users, accounts, memberships, and sessions never enter that projection.

## Conditional provider boundary

Better Auth core, its organization plugin, and direct PostgreSQL support are selected for DCP-1A's fixture-gated human identity and organization/session configuration. The T012 local probe conditionally accepts `@better-auth/api-key@1.7.2` only as a candidate source of Web-side organization-scoped create, list, show-once, hashing, and revoke primitives. Any later use must keep database storage authoritative, hashing enabled, starting characters and free-form metadata disabled for tenant authorization, and `enableSessionForAPIKeys=false`.

That conditional acceptance is not provider activation or production acceptance. Web continues to own a separate organization/project/key binding, lifecycle state, authorization, audit, policy ordering, and transactional outbox. Better Auth's stored hash is not automatically portable verifier material. Project binding, exact 24-hour replacement overlap, immediate revoke precedence, portable verification, cross-store compensation, and security/privacy acceptance remain Paper & Slate adapter responsibilities and open review gates. No production key format, verifier scheme, or `key_ref` is selected by DCP-1A.5. Unkey requires a separate explicit package/version and evaluation authorization if this adapter boundary is rejected.

Official primary sources consulted for this narrow candidate characterization:

- [Better Auth organization plugin](https://better-auth.com/docs/plugins/organization)
- [Better Auth API-key plugin](https://better-auth.com/docs/plugins/api-key)
- [Better Auth API-key reference](https://better-auth.com/docs/plugins/api-key/reference)

These sources and the fixture-only T012 probe do not establish project binding, portable production verification, runtime activation, transport, managed-secret binding, or security/privacy acceptance for Paper & Slate. Provider selection remains pending; provider acceptance therefore remains pending.

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

## DCP-1A.5 proposed projection/verifier boundary

DCP-1A.5 documents, but does not implement or accept, the Web-owned v3 candidate in [ADR-0016](../../docs/decisions/ADR-0016-developer-control-plane-projection-and-verifier-contract.md) and the [Data Platform projection v3 Web proposal](../../docs/interfaces/data-platform-api-key-projection-v3-web-proposal.md).

The candidate keeps `policy_version` and `organization_sequence` as separate finite positive integers. `policy_version` advances once for each committed authorization-affecting lifecycle mutation; `organization_sequence` orders every committed outbox event, including heartbeats. It defines create/verifier publication, rotation, revocation, project activation/disable, organization disable, scope/policy change, and heartbeat events, plus duplicate, gap, rollback, replay, stale, and unknown-version fail-closed behavior.

The candidate uses an opaque, versioned, non-plaintext verifier descriptor and non-secret immutable `key_ref`. It deliberately chooses no production algorithm or key format and rejects the synthetic Data v2 `hmac-sha256-v1` fixture, its fixture `key_ref`, and string policy values as production semantics. Web owns lifecycle transactions, exact-byte outbox records, redacted audit, policy/sequence allocation, and provider-compensation state. Data Platform would own strict wire validation, ordered durable application, verifier binding, constant-time verification for an accepted scheme, and identity-bound acknowledgement. These responsibilities require a joint acceptance review before implementation.

The exact v3 candidate boundary is:

- `projection_version` is the literal `3.0.0`. All control identifiers are canonical lowercase UUIDv7 strings. `policy_version` and `organization_sequence` are independent JSON safe integers in `1..9007199254740991`; neither may be fractional, non-finite, negative, zero, reset, wrapped, or reused. A committed authorization-affecting mutation allocates exactly the next policy version and next organization sequence in one Web transaction. A heartbeat allocates only the next organization sequence and carries the current policy version.
- The closed event set is exactly `key.verifier_published`, `key.rotated`, `key.revoked`, `project.activated`, `project.disabled`, `organization.disabled`, `key.policy_changed`, and `projection.heartbeat`. There are no v2 aliases or implicit create, reactivation, plaintext, reason, or provider events.
- Key events require non-null organization, project, and key IDs. Project events require non-null organization and project IDs and `key_id: null`. Organization-disabled and heartbeat events require `project_id: null` and `key_id: null`. Every payload is an event-specific strict object with no unknown fields: publication contains active state, sorted unique scopes, nullable expiry, and the opaque verifier; rotation contains distinct predecessor/replacement IDs, replacement metadata, and an overlap end exactly 86,400 seconds after `committed_at`; revoke, project activation/disable, and organization disable use `{}`; policy change contains sorted unique scopes, with `[]` denying all; heartbeat contains `watermark_sequence` equal to the envelope sequence. Wire payloads contain no reason or other authorization metadata.
- The reviewed scope map is exactly `data:read → data.read`, `provenance:read → provenance.read`, `bulk:read → bulk.read`, and `geometry:read → geometry.read`. Only the read capabilities represented by those mappings are eligible, and only for GET/HEAD semantics. Unknown, write, administrative, and unsorted/duplicate scope values fail closed; publication and rotation require a non-empty scope set, while policy change may use `[]`.
- Event and acknowledgement bytes use RFC 8785 JSON Canonicalization Scheme over UTF-8 without a BOM, with exact UTC `Z` timestamps. `canonical_event_digest` is `sha256:` followed by 64 lowercase hexadecimal characters computed over those canonical bytes. The digest is not transport authentication or verifier material, and every retry reuses the original bytes and digest.
- A durable acknowledgement has `acknowledgement_version: "1.0.0"`, `projection_version`, `event_id`, `organization_id`, `organization_sequence`, `canonical_event_digest`, `outcome` (`applied` or `quarantined`), `reason_code` (`null` for applied and one closed code for quarantine), and `decided_at`. An acknowledgement is emitted only after a durable apply or quarantine decision. An exact duplicate returns the original acknowledgement bytes unchanged; a mismatched duplicate is quarantined; malformed identity or counters produce no acknowledgement or state mutation. Acknowledgement canonicalization is the event canonicalization, while transport authentication remains separate.
- Delivery is at-least-once and accepts only the exact next sequence. Gaps replay from the last durable acknowledgement plus one using original bytes; consumers never skip. Duplicate, mismatched-duplicate, gap, rollback, stale, unknown version/binding, unavailable verifier, and malformed input fail closed. Revocation and disable decisions cannot be undone by replay. Heartbeat watermark equality is required, and a heartbeat older than 60 seconds is stale/fail-closed; 30-second warning, 45-second critical, and 60-second fail-closed thresholds remain acceptance inputs, not monitoring proof.

Transport class, workload authentication, message integrity, acknowledgement authentication, managed-secret references/rotation, service limits, replay tooling, monitoring, and on-call ownership remain required inputs rather than decisions in this proposal. Web, Data, Security, and Privacy must jointly approve canonical fixtures and terminal receipts. No runtime mapping, provider call, credential, database connection, transport/secret binding, Tower apply, route/UI, DCP-1B work, deployment, release, publication, or production action is authorized.

## Deferred DCP-1B gates

Data T681 is immutable producer-local evidence for v2, not Web acceptance and not production semantics. DCP-1B remains blocked on joint acceptance of the Proposed v3 contract and immutable Web/Data artifact identities; an approved verifier-scheme registry and provider/security decision; authenticated transport and managed-secret binding; joint fixtures; independent security and privacy receipts; and explicit runtime/database/Tower authority. The Tower file remains reviewed desired-state intent only, not an apply request.
