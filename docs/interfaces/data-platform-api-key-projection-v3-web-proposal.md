# Data Platform API-key projection v3 — Web proposal

Status: **Proposed**
Projection version: `3.0.0`
Owner: Paper & Slate Web
Consumer review owner: Paper & Slate Data Platform
Security/privacy status: pending independent receipts
Runtime authority: none

## Purpose and evidence boundary

This document is the Web-owned candidate contract for review after DCP-1A and the fixture-only T012 capability probe. It is not Web acceptance of Data v2 or Data T681, not a provider/verifier decision, not an implementation mapping, and not DCP-1B authority.

Data T681 remains immutable producer-local evidence at commit `d21efabb8550578333fee5f62bf0e822fbca1394`, tree `5c3a56a25f4eb374e94550f89b9ed1dbd52bb66a`. Its synthetic `hmac-sha256-v1`, fixture `key_ref`, and string policy values are not production semantics in this proposal.

## Canonical envelope

Every event is a strict object. Unknown fields and unknown enum values are rejected.

| Field                   | Type and constraint               | Meaning                                                     |
| ----------------------- | --------------------------------- | ----------------------------------------------------------- |
| `projection_version`    | literal string `3.0.0`            | Contract version.                                           |
| `event_id`              | canonical lowercase UUIDv7 string | Stable idempotency identity for exact-byte retries.         |
| `event_type`            | one closed event name below       | Lifecycle meaning.                                          |
| `occurred_at`           | UTC RFC 3339 timestamp            | Time the authorized command occurred.                       |
| `committed_at`          | UTC RFC 3339 timestamp            | Time the Web lifecycle transaction committed.               |
| `organization_id`       | canonical UUID string             | Organization authorization boundary.                        |
| `project_id`            | canonical UUID or `null`          | Required except for organization-wide and heartbeat events. |
| `key_id`                | canonical UUID or `null`          | Required only for key events.                               |
| `policy_version`        | integer `1..9007199254740991`     | Web-owned committed authorization-state version.            |
| `organization_sequence` | integer `1..9007199254740991`     | Per-organization outbox delivery order.                     |
| `payload`               | event-specific strict object      | Non-secret lifecycle data only.                             |

Events use RFC 8785 JSON Canonicalization Scheme over UTF-8 without a BOM, with exact UTC `Z` timestamps. `canonical_event_digest` is `sha256:` followed by 64 lowercase hexadecimal characters computed over the canonical event bytes; it is not transport authentication or verifier material. An event retry must reuse the same `event_id`, counters, timestamps, and canonical bytes.

## Counter and delivery rules

`policy_version` and `organization_sequence` are distinct numeric domains:

- Every committed non-heartbeat lifecycle mutation allocates exactly the next policy version and next sequence in one Web transaction.
- Every heartbeat allocates exactly the next sequence and carries the current policy version.
- Data accepts only the exact next sequence. The event's policy transition must match its type and the current durable state.
- An identical duplicate is acknowledged as an idempotent no-op. A duplicate `event_id` or sequence with different canonical bytes is denied and quarantined.
- Gaps, rollbacks, stale state, unsupported versions, malformed counters, and unknown bindings fail closed. A gap triggers replay from the last durable acknowledgement plus one; it never authorizes speculative state.
- A heartbeat's `watermark_sequence` equals its own `organization_sequence`. It proves ordered liveness only and cannot grant, reactivate, or restore authorization.
- A heartbeat older than 60 seconds is stale and fails closed. The 30-second warning, 45-second critical, and 60-second fail-closed thresholds are acceptance inputs, not proof of monitoring.

All counters are finite safe integers in `1..9007199254740991`; zero, negative, fractional, non-finite, reset, wrapped, reused, and out-of-range values fail closed. All control IDs are canonical lowercase UUIDv7 strings. Key events require non-null organization/project/key IDs; project events require organization/project and `key_id: null`; organization-disabled and heartbeat require `project_id: null` and `key_id: null`. Payloads are strict event-specific objects, contain no reason metadata or plaintext, and reject unknown fields.

The reviewed scope registry and capability map are exactly:

| Web scope         | Data capability   | Allowed operation |
| ----------------- | ----------------- | ----------------- |
| `data:read`       | `data.read`       | GET/HEAD          |
| `provenance:read` | `provenance.read` | GET/HEAD          |
| `bulk:read`       | `bulk.read`       | GET/HEAD          |
| `geometry:read`   | `geometry.read`   | GET/HEAD          |

Unknown, write, administrative, unsorted, or duplicate scopes fail closed. Publication and rotation require a non-empty sorted unique scope set; `key.policy_changed` may carry `[]`, which denies all scopes. This is a reviewed candidate map, not an authorization expansion or a claim that Data has accepted v3.

## Lifecycle payloads and effects

### `key.verifier_published`

Requires organization, project, and key IDs.

```json
{
  "state": "active",
  "scopes": ["data:read"],
  "expires_at": null,
  "verifier": {
    "scheme": "example-only",
    "scheme_version": 1,
    "key_ref": "example-only",
    "material": "base64url-non-plaintext-material"
  }
}
```

The values above illustrate shape only and are not an accepted scheme. Scopes must be unique and sorted and must come from the accepted scope registry. Data binds the descriptor to the exact organization/project/key tuple and permits only the committed scopes after durable ordered apply.

### `key.rotated`

The envelope `key_id` is the replacement key. Payload:

```json
{
  "predecessor_key_id": "uuid",
  "replacement_key_id": "uuid",
  "replacement_scopes": ["data:read"],
  "replacement_expires_at": null,
  "replacement_verifier": {},
  "overlap_ends_at": "RFC3339 timestamp"
}
```

`replacement_key_id` must equal the envelope key ID. `overlap_ends_at` must be exactly 86,400 seconds after `committed_at`. Data may accept the predecessor and replacement only inside that interval and only while no revoke/project-disable/organization-disable/policy deny applies. At the boundary, the predecessor is denied. Revocation always takes precedence.

### `key.revoked`

Requires organization, project, and key IDs with payload `{}`. Data denies the key immediately after durable apply, removes verifier usability, and never lets a duplicate/replay restore it.

### `key.policy_changed`

Requires organization, project, and key IDs. Payload is `{ "scopes": [...] }`, where scopes are unique, sorted, and registry-approved. An empty list means deny all. Data atomically replaces the allowed scope set at the new policy version.

### `project.activated`

Requires organization and project IDs, `key_id: null`, and payload `{}`. It permits later key policies but creates no key and grants no scope itself.

### `project.disabled`

Requires organization and project IDs, `key_id: null`, and payload `{}`. Data denies every key in that project. A replayed older activation or key event cannot override the deny.

### `organization.disabled`

Requires `project_id: null`, `key_id: null`, and payload `{}`. Data denies the organization and every descendant. Version 3 defines no organization-reactivation event; any attempted reactivation is an unknown event and fails closed.

### `projection.heartbeat`

Requires `project_id: null`, `key_id: null`, and payload `{ "watermark_sequence": n }`, where `n` equals the envelope sequence. It updates freshness/watermark state only.

Every event payload follows the identity and null rules above. `key.verifier_published` carries active state, non-empty sorted unique scopes, nullable expiry, and the opaque verifier descriptor. `key.rotated` carries distinct predecessor/replacement IDs, replacement metadata, and an `overlap_ends_at` exactly 86,400 seconds after `committed_at`. Revoke, project activation/disable, and organization disable carry `{}`. No event carries a reason code or plaintext. A create or successful provider issuance is represented by `key.verifier_published`; provider failure emits no projection event.

## Acknowledgement, replay, and freshness

The durable acknowledgement object is strict and contains exactly:

```json
{
  "acknowledgement_version": "1.0.0",
  "projection_version": "3.0.0",
  "event_id": "lowercase-uuidv7",
  "organization_id": "lowercase-uuidv7",
  "organization_sequence": 1,
  "canonical_event_digest": "sha256:64-lowercase-hex",
  "outcome": "applied",
  "reason_code": null,
  "decided_at": "2026-08-31T00:00:00Z"
}
```

`outcome` is `applied` or `quarantined`; `reason_code` is `null` for `applied` and one closed code for `quarantined`. The acknowledgement is returned only after Data durably applies or durably rejects/quarantines the exact canonical event. An exact duplicate returns the original acknowledgement bytes unchanged. A mismatched duplicate is quarantined. Malformed identities/counters, gaps, rollbacks, stale events, unknown versions/bindings, unavailable verifier state, and unknown scopes fail closed without state mutation or an authorization grant. Delivery is at-least-once; replay starts at the last durable acknowledgement plus one and uses the original bytes, and consumers never skip a sequence. Revocation and disable decisions cannot be undone by replay. Acknowledgement canonicalization uses RFC 8785 in the same way as events; acknowledgement authentication remains a separate transport decision.

## Verifier descriptor and key reference

The descriptor contains only:

| Field            | Constraint                                     |
| ---------------- | ---------------------------------------------- |
| `scheme`         | `[a-z0-9][a-z0-9.-]{0,31}`                     |
| `scheme_version` | integer `1..65535`                             |
| `key_ref`        | `[A-Za-z0-9][A-Za-z0-9._:-]{0,127}`            |
| `material`       | unpadded base64url decoding to `32..512` bytes |

The descriptor is opaque until Security approves a versioned registry entry. That entry must fix material length and encoding, derivation/import rules, binding input, comparison behavior, algorithm agility, and migration. Data owns approved constant-time comparison or an independently reviewed equivalent and must bind projection version, organization, project, key, scheme, version, and key reference.

`key_ref` is non-secret and immutable. It identifies an accepted configuration or managed-key version; it is not a provider credential identifier, secret value/path, user identity, or authorization field. An unavailable, unknown, malformed, or retargeted key reference fails closed. Scheme migration uses a replacement key and `key.rotated`; no consumer reinterprets existing material.

No production verifier scheme is selected. Better Auth's storage hash is not projection material merely because hashing is enabled. Data does not call Better Auth or any provider during request verification.

## Better Auth and Web control-plane conditions

The proposed Web adapter may use `@better-auth/api-key@1.7.2` only for conditionally accepted organization-scoped lifecycle primitives. Before runtime acceptance, configuration evidence must prove:

- organization ownership references are enabled;
- database storage remains the source of truth;
- hashing is enabled;
- starting characters and free-form metadata are not tenant-authorization boundaries;
- API-key sessions are disabled;
- fallback/secondary stores do not permit stale success;
- Web stores a separate authoritative organization/project/key binding.

Web validates authorization and command metadata before a provider call and atomically records lifecycle metadata, redacted audit, idempotency, policy version, sequence, and exact outbox bytes. Plaintext is shown once only after provider issuance and the Web commit both succeed. Provider-success/Web-failure, rotate-failure, revoke, and disable paths follow the compensation rules in ADR-0016 and never grant stale authorization.

## Transport and acknowledgement inputs

This proposal does not select transport. Acceptance needs a separately reviewed design for:

- ordered delivery topology, endpoint/queue ownership, workload authentication, TLS/mTLS boundary, message integrity, replay resistance, and acknowledgement authentication;
- reference-only managed-secret bindings, access control, rotation and revocation;
- canonical-event digest and acknowledgement fields: acknowledgement version, projection version, event ID, organization ID, sequence, canonical digest, outcome, closed/null reason code, and `decided_at`;
- size, throughput, timeout, retry, dead-letter, replay, retention, monitoring, SLO, alert, on-call, incident, and rollback behavior.

Acknowledgement is valid only after Data durably applies or durably rejects/quarantines the exact canonical event. Web never treats transport delivery alone as acceptance.

## Joint fixture and receipt ownership

| Evidence                                                                                            | Producer | Acceptance owner              |
| --------------------------------------------------------------------------------------------------- | -------- | ----------------------------- |
| Canonical event bytes, lifecycle, idempotency, redaction, compensation                              | Web      | Web + Data + Security         |
| Strict schema, ordered apply, duplicate/gap/rollback/replay, acknowledgement, watermark, usage deny | Data     | Data + Web + Security         |
| Scheme registry, material/key-ref binding, constant-time behavior, malformed input, secret rotation | Security | Independent Security reviewer |
| Forbidden fields, retention/deletion, telemetry and evidence redaction                              | Privacy  | Independent Privacy reviewer  |

The terminal joint manifest must bind immutable Web and Data source/artifact hashes and include valid and hostile fixtures for every event plus exact/mismatched duplicates, gap, rollback, stale heartbeat, unknown versions/references, non-integer counters, overlap boundaries, revoke override, project/organization disable, compensation, outage retry, redaction sentinels, and acknowledgement mismatch.

## Required acceptance and resume event

The proposal remains blocked until:

1. Web publishes an immutable commit/tree/blob/SHA identity for these exact Proposed bytes.
2. Data reviews that identity and returns an immutable mapping/schema/consumer receipt without changing the candidate semantics.
3. Provider and Security owners accept the Web adapter boundary plus one production verifier registry entry and immutable `key_ref` behavior.
4. Transport and managed-secret designs are approved without recording secret values.
5. Joint fixtures pass against exact Web/Data identities.
6. Independent Security and Privacy receipts approve the terminal contract and failure handling.
7. A fresh independent Web acceptance review finds no local contract defect.
8. The coordinator explicitly authorizes the next bounded task.

The resume event is receipt of that complete identity-bound acceptance set. Until then, no DCP-1B task, runtime mapping, provider activation, credential, live database, transport/secret binding, Tower mutation, route/UI, deployment, release, publication, or production action is authorized. Unkey remains only a fallback requiring explicit package/version evaluation authority if the Better Auth adapter boundary is rejected.
