# Data Platform API-key projection v1

## Receipt status

This is a versioned, transport-undecided interface receipt for DCP-0. It authorizes neither Web implementation nor Data Platform ingestion. UUID strings map identically: `organization_id`, `project_id`, and `key_id` are canonical UUID values in both systems; no user identifiers are included.

## Envelope

```json
{
  "event_version": 1,
  "event_id": "UUID",
  "event_type": "key.verifier_published",
  "occurred_at": "RFC 3339 timestamp",
  "organization_id": "UUID",
  "project_id": "UUID",
  "key_id": "UUID or null for organization events",
  "policy_version": 7,
  "payload": {}
}
```

Web assigns one immutable `event_id` per outbox record. Delivery is at-least-once; Data Platform deduplicates by `event_id`, retains replay capability, and applies events in per-organization monotonic `policy_version` order. A gap, duplicate with mismatched contents, unknown event version, or unknown policy version fails closed and is reported for replay. Transport is intentionally undecided.

## Projected event types and payload constraints

| Event                    | Required effect                                                                           |
| ------------------------ | ----------------------------------------------------------------------------------------- |
| `project.activated`      | Permit verifier state only after its policy is applied.                                   |
| `project.disabled`       | Deny every project key immediately.                                                       |
| `key.verifier_published` | Publish approved non-plaintext verifier material and permitted scopes.                    |
| `key.rotated`            | Record predecessor/replacement IDs and `overlap_ends_at` exactly 24 hours after rotation. |
| `key.revoked`            | Deny the key immediately; revocation overrides rotation overlap.                          |
| `organization.disabled`  | Deny every organization key immediately.                                                  |
| `policy.changed`         | Replace scopes/limits with the next monotonic policy version.                             |

Verifier material is provider-selected later; never transmit plaintext credentials. Permitted initial scopes are exactly `data:read`, `provenance:read`, `bulk:read`, and `geometry:read`. No administrative scope is valid. The numeric maximum revocation staleness is **60 seconds** from Web outbox commitment to Data Platform denial; the future transport/SLO design must demonstrate it.

## Compatibility and verification ownership

Changes to v1 are additive only: new optional fields and event types require ignored-unknown behavior only where they cannot broaden authorization. A breaking change requires `event_version: 2`, dual-read/replay migration evidence, and an ADR.

Web owns envelope/outbox and redaction fixtures. Data Platform owns idempotent projection, ordering/replay, verifier, and enforcement fixtures. Both teams jointly own versioned fixtures covering activation/disable, publish, rotate overlap, revoke override, organization disable, policy changes, duplicates, gaps, and unknown versions.
