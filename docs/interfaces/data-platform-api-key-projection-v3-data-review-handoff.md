# Projection v3 Data T681 review handoff

## Purpose

This is a Web-owned, provider-neutral handoff template for a future Data T681
compatibility review. It is not a Data receipt, provider decision, wire
acceptance, DCP-1B authorization, staging record, or production evidence.

The review must bind one exact T030 direct-child commit, tree, eight-file blob
and SHA-256 manifest, and the T030 receipt to the existing Web T018 proposal
identity, T020 F/R local evidence, T023/Q joint-review evidence, approved
T026/T027 repairs, and Data T681's immutable producer-local identity
`d21efabb8550578333fee5f62bf0e822fbca1394` with tree
`5c3a56a25f4eb374e94550f89b9ed1dbd52bb66a`. Older T018, T020, T023, T025,
and Data v2 receipts remain historical and must not be rebound.

## Web-owned candidate inputs

Web supplies the full event-envelope candidate bytes and their
`sha256:<64 lowercase hex>` digests, using RFC 8785 JSON Canonicalization
Scheme over UTF-8 without a BOM for the closed fixture value domain. The
envelope has exactly `projection_version`, `event_id`, `event_type`,
`occurred_at`, `committed_at`, `organization_id`, `project_id`, `key_id`,
`policy_version`, `organization_sequence`, and `payload`.

The candidate keeps `policy_version` as a finite positive safe integer for
authorization state and `organization_sequence` as a separate finite positive
safe integer for per-organization delivery. Non-heartbeat mutations advance
both once in one Web transaction; a heartbeat advances only the delivery
sequence and carries the current policy version. The closed events, identity
and null rules, reviewed read-only scopes, exact 86,400-second exclusive
rotation boundary, immediate revoke/disable precedence, duplicate/gap/
rollback/replay/freshness behavior, and acknowledgement fields are the T018
Proposed rules.

Publication and rotation descriptors in this local bundle are unbound
blocked-external templates. They do not select an algorithm, key format,
provider hash export, key reference, credential, or secret. The local candidate
uses only the closed provider-neutral quarantine reason registry in the
acceptance-input manifest; that registry is not a provider, Security, Data, or
production approval.

The complete local candidate also records the full eight-event envelope bytes,
acknowledgement bytes or explicit no-ack outcomes, identity-bound compensation
and outage/retry/DLQ/redaction fixture references, and hostile joint-review
fixtures. These are source-bound local inputs only; their external receipt
slots remain pending.

## Data-owned review

Data must review the raw-wire shape and duplicate-key behavior, strict event
and counter parsing, per-organization ordering, durable apply/quarantine,
acknowledgement bytes, verifier binding after a separate Security registry
decision, and usage denial. Data must not issue or own Web API keys, call
Better Auth, adopt historical v2 synthetic values, edit T681, or create a
successor during this review.

The compatibility result must be one identity-bound `compatible` or
`not-compatible` receipt. It must include exact source identities, artifact
hashes, fixture results, limitations, and no secret values. A repository-owned
defect returns one bounded Web repair; it does not authorize DCP-1B.

## Resume event

The coordinator may route this handoff only after T030 is officially done and
the Provider, Security, Operations, Privacy, and joint-fixture slots are
terminal, mutually consistent, and each repeats the exact T030 identity. The
complete A-to-G bundle, bound to T030's exact commit/tree/blob manifest, then
triggers one fresh read-only Data T681 review.
Only a compatible Data receipt plus explicit later authority can open DCP-1B
planning. Transport, managed references, live database, Tower, routes/UI,
deployment, release, publication, legal, human, and production gates remain
closed.
