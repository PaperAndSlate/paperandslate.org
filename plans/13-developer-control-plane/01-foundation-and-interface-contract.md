# Developer Control Plane Foundation and Interface Contract

## Status and boundary

DCP-0 is a non-production planning artifact succeeding, but not changing, D-018. D-018 remains the public-site/RC3 decision: no authentication, user models, API keys, organization claims, or authenticated console. This plan neither implements nor reclassifies RC3 requirements.

## Ownership

Better Auth is the preferred future human-identity system, subject to implementation approval. In a separate logical Web-owned identity/control database it owns users, sessions, accounts, organizations, and memberships. Tower Keycloak is rejected as application identity.

The ownership chain is `organization → project → key`; a key never belongs directly to a user. Web owns organization RBAC, human mutation authorization, the lifecycle control plane, audit records, and a transactional outbox. Data Platform owns only the projected machine verifier and usage enforcement. Users, accounts, memberships, and sessions never enter that projection.

## Provider decision gate

The Better Auth organization plugin is the preferred organization/RBAC candidate. Its API-key plugin is a candidate only: official documentation describes organization-owned keys, key creation/management/verification, metadata, expiry, and secondary storage, but does not by itself prove Paper & Slate's required project binding, portable Data Platform verifier, audit model, rotation/revocation propagation, runtime, or security fit. Select no provider and invent no key format until a review establishes every one of those items.

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

## Implementation gates

Do not implement until an ADR follow-up selects a provider, transport, database topology/migration, verifier material, outbox delivery, monitoring, retention, incident handling, fixtures, and security/privacy approval. The Tower file is disabled intent only, not a provider schema or apply request.
