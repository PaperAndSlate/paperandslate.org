# ADR-0016: Developer Control Plane projection and verifier contract proposal

- Status: Proposed
- Date: 2026-08-30
- Decision owners: Web, Data Platform, Security, Privacy
- Scope: DCP-1A.5 documentation only
- Supersedes: no accepted contract; Data v2 remains historical producer-local evidence

## Context

DCP-1A established a disabled, fixture-gated Web control-plane kernel. T012 showed that `@better-auth/api-key@1.7.2` can plausibly supply organization-scoped Web lifecycle primitives, but it did not establish project binding, a portable production verifier, exact rotation semantics, cross-store atomicity, transport, or security/privacy acceptance. Data T681 binds an immutable provider-neutral v2 consumer artifact, but Web has not accepted its synthetic `hmac-sha256-v1`, fixture `key_ref`, or string policy values as production semantics.

The projects need an owner-controlled candidate contract before either can implement DCP-1B. This ADR freezes that candidate for review while explicitly withholding runtime and external authority.

## Proposed decision

### Authority and ownership

Web is the authorization and lifecycle source of truth. It owns organization/project/key binding, organization RBAC, lifecycle commands, metadata, audit, idempotency, `policy_version`, `organization_sequence`, exact outbox bytes, and provider compensation. Data owns strict consumer validation, durable ordered application, verifier binding and constant-time comparison for an approved scheme, usage enforcement, fail-closed state, and identity-bound acknowledgements.

Better Auth 1.7.2 is conditionally accepted only for Web-side organization-scoped create, list, show-once, hashing, and revoke primitives. A later runtime configuration must use database storage, hashing, no API-key sessions, no free-form metadata as the tenant boundary, and a separate Web project-binding record. This ADR neither activates Better Auth nor accepts it as the complete production provider.

### Versions and order

Both counters are JSON safe integers in the inclusive range `1..9007199254740991`; parsed non-finite, fractional, negative, zero, reset, wrapped, reused, or out-of-range values fail closed:

- `projection_version` is the literal `3.0.0`, and all control identifiers are canonical lowercase UUIDv7 strings.
- `policy_version` represents committed organization authorization state. Web increments it exactly once for every authorization-affecting lifecycle mutation. It is never a string, timestamp, provider revision, or delivery offset.
- `organization_sequence` represents committed delivery order within one organization. Web increments it for every outbox event, including a heartbeat. It is independent of `policy_version`.

A non-heartbeat lifecycle mutation allocates the next policy version and the next organization sequence in the same Web transaction as lifecycle metadata, audit, idempotency, and outbox insertion. A heartbeat keeps the current policy version and allocates only the next organization sequence. Counters never wrap, reset, or move backward.

Data applies an event only when its sequence is exactly the next expected value and its policy transition is valid for the event type. An identical duplicate is an idempotent no-op with the original acknowledgement bytes. A duplicate with different canonical bytes, sequence gap, sequence or policy rollback, stale state, unsupported projection/event/scheme version, malformed counter, or unknown binding is quarantined and denied without state mutation. Replay starts at the last durably acknowledged sequence plus one and uses the original canonical bytes. Revocation and disable decisions cannot be undone by replay. A heartbeat watermark must equal its envelope sequence; a heartbeat older than 60 seconds is stale and fails closed. The 30-second warning, 45-second critical, and 60-second fail-closed thresholds are acceptance inputs, not monitoring proof.

Events and acknowledgements use RFC 8785 JSON Canonicalization Scheme over UTF-8 without a BOM and exact UTC `Z` timestamps. `canonical_event_digest` is `sha256:` followed by 64 lowercase hexadecimal characters over the canonical event bytes; it is not transport authentication or verifier material. A durable acknowledgement contains `acknowledgement_version: "1.0.0"`, `projection_version`, `event_id`, `organization_id`, `organization_sequence`, `canonical_event_digest`, `outcome` (`applied` or `quarantined`), `reason_code` (`null` for applied or a closed quarantine code), and `decided_at`. It exists only after a durable apply/quarantine decision; an exact duplicate returns the original acknowledgement bytes unchanged, a mismatched duplicate is quarantined, and malformed identity/counters produce no acknowledgement or state mutation. Acknowledgement canonicalization is the event canonicalization; authentication of the acknowledgement is a separate transport decision.

### Lifecycle event set

Projection version `3.0.0` has the following closed event set:

| Event                    | Required identity                      | Payload intent                                                                           | Expected Data effect                                                                                                                     |
| ------------------------ | -------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `key.verifier_published` | organization, project, key             | active state, sorted scopes, optional expiry, verifier descriptor                        | Bind the verifier to the exact organization/project/key and allow only the published policy after ordered durable apply.                 |
| `key.rotated`            | organization, project, replacement key | predecessor and replacement IDs, replacement scopes/expiry/descriptor, `overlap_ends_at` | Permit predecessor and replacement only until exactly 24 hours after `committed_at`, unless either is revoked or a broader deny applies. |
| `key.revoked`            | organization, project, key             | empty object                                                                             | Deny the key immediately on apply; revocation overrides overlap and cannot be undone by replay.                                          |
| `project.activated`      | organization, project                  | empty object                                                                             | Permit project-scoped policies after ordered apply; it creates no key.                                                                   |
| `project.disabled`       | organization, project                  | empty object                                                                             | Deny every key in the project until a later accepted policy explicitly activates it.                                                     |
| `organization.disabled`  | organization                           | empty object                                                                             | Deny the organization and all descendant projects/keys. Version 3 defines no organization-reactivation event.                            |
| `key.policy_changed`     | organization, project, key             | unique sorted scopes, where an empty set denies all                                      | Replace the key's allowed scopes at the new policy version.                                                                              |
| `projection.heartbeat`   | organization                           | `watermark_sequence` equal to this event's sequence                                      | Advance freshness and watermark only; never grant or restore authorization.                                                              |

Create and successful issuance produce `key.verifier_published`; there is no separate wire-level plaintext creation event. Provider failure produces no projection event. Local pending, failed, compensation, and acknowledgement states remain Web control records rather than authorization-granting events.

Identity and payload rules are strict. Key events require non-null organization, project, and key IDs. Project events require non-null organization and project IDs and `key_id: null`. Organization-disabled and heartbeat events require `project_id: null` and `key_id: null`. Publication contains active state, a non-empty sorted unique scope set, nullable expiry, and the verifier descriptor. Rotation contains distinct predecessor/replacement IDs, replacement metadata, and `overlap_ends_at` exactly 86,400 seconds after `committed_at`. Revoke, project activation/disable, and organization disable contain `{}`. Policy change contains sorted unique scopes; `[]` denies all. Heartbeat contains `watermark_sequence` equal to the envelope sequence. No wire event carries reason metadata or plaintext.

The reviewed scope registry is exactly `data:read → data.read`, `provenance:read → provenance.read`, `bulk:read → bulk.read`, and `geometry:read → geometry.read`. Only GET/HEAD read capabilities represented by these mappings are eligible. Unknown, write, administrative, unsorted, or duplicate scope values fail closed; an empty scope list is allowed only for `key.policy_changed` and means deny all.

### Opaque verifier descriptor

The wire descriptor is non-plaintext and contains only:

- `scheme`: `[a-z0-9][a-z0-9.-]{0,31}`;
- `scheme_version`: integer `1..65535`;
- `key_ref`: `[A-Za-z0-9][A-Za-z0-9._:-]{0,127}`;
- `material`: unpadded base64url decoding to `32..512` bytes.

This shape does not select a scheme. An independently approved registry must define the exact algorithm, descriptor length, comparison method, key derivation/import rules, and migration behavior for each `(scheme, scheme_version)`. Data binds every verifier to projection version, organization ID, project ID, key ID, scheme, scheme version, and key reference before constant-time verification.

`key_ref` is a non-secret immutable reference to an approved configuration or managed-key version. It is not a provider API-key ID, secret value, secret-manager path, user identifier, or authorization shortcut, and it cannot be retargeted after publication. Unknown or unavailable references fail closed. Algorithm migration uses a replacement key and `key.rotated`; the same key ID is never reinterpreted under another scheme.

No production scheme or key format is selected here. Better Auth's stored hash is not automatically exportable verifier material. The Data v2 synthetic `hmac-sha256-v1`, its fixture key reference, and T012's candidate digest feasibility are explicitly rejected as production acceptance.

### Web transaction, outbox, and compensation

Web validates UUIDv7 identities, bounded reason codes, RBAC, project binding, requested scopes, idempotency, and current policy before any provider call. It then records lifecycle metadata, redacted audit, idempotency outcome, policy/sequence allocation, and the canonical outbox event atomically in its control database. Plaintext is returned exactly once and only after provider issuance and the Web transaction both succeed.

There is no claimed distributed transaction with Better Auth or Data:

- If provider issuance succeeds but the Web commit fails, Web does not reveal plaintext, marks a recoverable orphan condition outside the failed transaction, and must disable/revoke the provider credential before a retry can succeed.
- If replacement creation or the rotation transaction fails, Web disables the replacement and keeps the predecessor's previously committed state. The 24-hour overlap starts only at the successful rotation transaction's `committed_at`.
- Revoke and disable commands commit the Web deny state and outbox event before provider cleanup. Provider cleanup is retried, but provider availability can never restore authorization in Web or Data.
- Identical command retries return the recorded redacted outcome and reuse exact event bytes. Mismatched retries fail closed.
- Pending revocation is measured at 30-second warning, 45-second critical, and 60-second fail-closed/SLO-breach thresholds. These are acceptance inputs, not evidence of production monitoring.

### Transport and secret inputs

No transport or secret mechanism is chosen. Acceptance must name and review:

- transport class, endpoint or queue ownership, per-organization ordering guarantee, message and acknowledgement size limits, throughput, timeouts, retry and dead-letter policy;
- workload identities, TLS or mTLS boundary, message-integrity/signature mechanism, replay resistance, and acknowledgement authentication;
- reference-only managed-secret bindings, rotation procedure, overlap, revocation, least-privilege access, and evidence-redaction rules;
- replay tooling, operator authority, monitoring, SLOs, alert routing, on-call ownership, rollback, and incident evidence.

No credential value, provider token, endpoint secret, or Tower apply is authorized by this proposal.

### Joint acceptance fixtures

Web owns canonical producer, redaction, idempotency, transaction, and compensation fixtures. Data owns consumer validation, ordered-apply, acknowledgement, watermark, and usage-enforcement fixtures. Security owns scheme-registry, binding, constant-time/equivalent comparison, malformed material, secret rotation, and fail-closed fixtures. Privacy owns forbidden-field, retention, deletion, and evidence-redaction fixtures.

The joint immutable manifest must cover: valid publication; exact duplicate; mismatched duplicate; sequence gap; sequence rollback; policy rollback; non-integer and out-of-range counters; unknown projection/event/scheme version; unknown organization/project/key/key reference; sorted and unsorted scopes; empty scopes; rotation before, at, and after the exact overlap boundary; revoke during overlap; project and organization disable; stale heartbeat; replay from durable acknowledgement; provider-success/Web-failure compensation; Web-commit/Data-unavailable retry; redaction sentinels; and authenticated acknowledgement mismatch.

## Rejected in this proposal

- String or provider-defined `policy_version` values.
- Conflating `policy_version` with `organization_sequence`.
- Treating Data v2's synthetic `hmac-sha256-v1` or fixture `key_ref` as production semantics.
- Using free-form API-key metadata as the sole organization/project authorization boundary.
- Making Data call Better Auth or another live provider during verification.
- API-key-backed Better Auth sessions or any secondary authorization path.
- Retargetable key references, plaintext verifier material, stale-success behavior, or a claimed cross-system distributed transaction.
- Silent adoption of Unkey. A fallback evaluation needs explicit package/version and evaluation authority.

## Acceptance gates and consequences

This ADR remains Proposed until all of the following exist:

1. Immutable Web proposal commit/tree/blob/SHA identity and Data acceptance bound to the same bytes.
2. Complete Web/Data field and lifecycle mapping with canonical serialization and acknowledgement digest rules.
3. Provider-owner acceptance of the Web primitives and compensation behavior.
4. Independent Security approval of a production scheme registry, descriptor, `key_ref`, constant-time verification, threat model, and failure behavior.
5. Authenticated transport and managed-secret designs with Tower/provider authority still separate.
6. Joint fixture manifest and terminal Web/Data conformance receipts.
7. Independent Privacy acceptance of fields, retention, deletion, telemetry, and evidence handling.
8. A fresh independent acceptance review and explicit coordinator authorization for a bounded successor.

Until then, DCP-1B stays blocked. This ADR authorizes no implementation, provider activation, credentials, live database, transport/secret binding, Tower change, route/UI, deployment, release, publication, or production claim.
