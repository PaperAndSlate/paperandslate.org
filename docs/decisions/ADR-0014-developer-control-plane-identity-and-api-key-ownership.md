# ADR-0014: Developer Control Plane identity and API-key ownership

## Status

Accepted for DCP-0 non-production planning only.

## Context

D-018 deliberately excluded account and API behavior from the public-site/RC3 release. The Data Platform needs a future machine-verification input without receiving Web human identity data or owning the human control plane.

## Decision

Keep D-018 unchanged and adopt this successor architecture for later gated work. Better Auth is the preferred human identity candidate for a separate logical Web-owned identity/control database holding users, sessions, accounts, organizations, and memberships. Tower Keycloak must not be used as application identity.

Credentials are organization → project → key. Web controls RBAC, lifecycle, audit, transactional outbox, and browser protections. Data Platform consumes only versioned machine-verifier projections and enforces use. Plaintext credentials are show-once and never persisted/logged. Rotation overlap is exactly 24 hours; a revocation wins immediately and is projected within a maximum of 60 seconds. All uncertain verifier or policy states fail closed.

Better Auth organization/API-key plugins are evaluated only against official primary documentation. The organization plugin is preferred for future evaluation; API-key-provider selection is deferred until project binding, portable verification, audit, rotation/revocation, runtime, and security fit are proven. No key scheme is chosen here.

The narrow candidate characterization is based on the official [organization plugin](https://better-auth.com/docs/plugins/organization), [API-key plugin](https://better-auth.com/docs/plugins/api-key), and [API-key reference](https://better-auth.com/docs/plugins/api-key/reference). These sources do not prove project binding, portable verification, audit, rotation/revocation propagation, runtime acceptance, or security acceptance for Paper & Slate; provider selection remains pending.

## Consequences

- DCP artifacts stay outside RC3 substantive requirement status.
- Human identity data is excluded from the Data Platform projection.
- Implementation needs a subsequent provider/transport/security decision and explicit resource authority.
