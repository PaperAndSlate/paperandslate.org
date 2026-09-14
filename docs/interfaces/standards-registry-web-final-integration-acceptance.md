# Standards Registry/Data → Web final integration acceptance

**Status: Web-owned acceptance matrix/template; no gate is accepted.**

This packet reconciles local evidence classes. The Standards workspace is local
`Planned`/`Experimental` material, not adopted authority. Registry T430 is a
candidate-only foundation and T431 is active with its receipt unapplied; the
Registry state remains `full_outcome_complete: false`. The Web adapter has
candidate-only, fail-closed behavior. None of these facts is a Registry, Data,
rights, release, publication, or production acceptance receipt.

## One immutable packet identity

Every owner receipt and every test result must bind to the same immutable
packet. The template requires all fields below; missing, stale, conflicting,
or ownerless fields keep the gate false.

```text
packetId, repository, remote, branch, commit, tree, lockfileSha256,
artifactDigest, sourceLocator, sourceCommit, sourceSnapshotId, apiBaseIdentity,
apiSchemaVersion, releaseId, candidateReleaseId, provenanceManifestId,
provenanceSha256, rightsDecisionId, availabilitySnapshotId, fixtureSetId,
ownerId, capturedAtUtc, signature, signatureVerification
```

`commit` and `tree` are repository identity. `artifactDigest` identifies the
built artifact. `sourceCommit`/`sourceSnapshotId`, provenance hashes, and
content hashes identify source evidence only. A content hash or snapshot is
not Git identity, a release identity, a signature, a rights decision, or an
owner acceptance. `releaseId` must be exact and consistent in request,
response, fixtures, artifact annotation, and every receipt. Signatures must
verify against the packet, not merely exist as a field.

## Evidence-class reconciliation

| Evidence class             | What exists locally                                                                                                                             | What it does not establish                                                                                                     |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Standards source workspace | Six local projects with Planned/Experimental maturity and local verification                                                                    | adoption, official source authority, rights, currentness, Registry/Data acceptance, release, or publication                    |
| Registry                   | T430 candidate-only foundation history; T431 active source-discovery plan with receipt unapplied                                                | official-source retrieval, canonical release, API/Workbench availability, owner acceptance, or stable/public truth             |
| Data                       | Consumer request and prior candidate-boundary references only                                                                                   | a current Data projection, mapping/loss receipt, rights/availability decision, or runtime/release acceptance                   |
| Web                        | Adapter validates exact release metadata, candidate/stable flags, rights/availability, safe URLs, bounded responses, and server-only bearer use | canonical Registry/Data ownership, source adoption, provider binding, hosted CI, staging, publication, or production readiness |

## Acceptance matrix

Each row is a separate gate. A receipt must include the immutable packet
identity, named owner, UTC timestamp, observation/command, result, and any
preimage or rollback evidence. `pending` is the current state for every row.

| Gate                             | Positive evidence required                                                                                                                       | Negative/stale/mismatch evidence required                                                                                                 | Owner/state                       |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| Source import and docs ingestion | Authorized source locator, source commit/release, allowlist, manifest, parser/version metadata, deterministic rebuild, and Web ingestion receipt | wrong source, changed bytes, stale snapshot, disallowed path, missing rights/provenance, or rebuild drift must deny ingestion             | Web + Standards/Registry; pending |
| Search and item detail           | Exact release response, permitted API text, provenance, rights, availability, and record identity for the packet                                 | missing/mismatched release, restricted text, source bytes, unavailable record, unsafe URL, or stale provenance returns unavailable/denied | Web + Registry/Data; pending      |
| Framework and source detail      | Exact release and source identity, authority/status, provenance, rights, availability, and explicit candidate/public flags                       | conflicting source/release, restricted fields, unavailable metadata, or stable flags without validated rights fails closed                | Web + Registry/Data; pending      |
| Coverage                         | Release-bound framework/node counts, reviewed relationship status, provenance, rights, and availability objects                                  | inferred mappings, unreviewed relationships, stale counts, missing framework identity, or unavailable projection is denied                | Web + Data/Registry; pending      |
| Concepts/crosswalks              | `relationshipSemantics.status: reviewed-only`, reviewed count, safety flags, and packet identity                                                 | candidate empty/denied state, mismatch, unreviewed relationship, or inferred crosswalk never becomes a relationship                       | Web + Data/Registry; pending      |
| Comparison/changes               | Both compared releases exact, same packet lineage, and explicit candidate-only change metadata                                                   | mixed releases, stale comparison, missing side, or candidate result presented as stable/public fails closed                               | Web + Registry/Data; pending      |
| Readiness/downloads              | Exact maturity, `current`, `publishable`, provenance, rights, availability, and separately accepted download grant                               | candidate, denied rights, unavailable export, missing grant, or conflicting flags denies download and keeps Candidate label               | Web + Rights/Data; pending        |
| Rollback                         | Replayed packet A → B → A with source/artifact identity and post-rollback health                                                                 | stale preimage, mixed release, missing audit trail, or data-safety failure blocks acceptance                                              | Web + Operations; pending         |

Positive cases must be paired with negative cases for missing, stale, or
mismatched release metadata; restricted text/raw bytes; unavailable
projection; unsafe URL; conflicting maturity flags; wrong source or artifact;
and rollback to the wrong preimage. No test may infer a parent, child,
crosswalk, rights decision, or download grant. No response may mix releases or
use local fallback data after an identity failure.

## Maturity and fail-closed rules

Candidate preview requires explicit `candidateOnly: true`, `public: false`,
`stable: false` for the exact candidate. It may display only explicitly
rights-permitted API metadata and must remain labelled Candidate. Stable/public
projection requires `candidateOnly: false`, `public: true`, `stable: true`,
`current: true`, `publishable: true`, and non-denied rights for that same
identity, plus owner receipts; stable flags alone are insufficient.

Missing bearer, unsafe URL, redirect or response-bound violation, unknown
schema, missing release, stale provenance, restricted content, unavailable
rights, or any identity conflict returns unavailable/denied. The adapter must
not promote candidate data, infer relationships, expose source bytes, create
download URLs, or blend a fallback release.

## Responsibilities and owner receipts

- **Web:** adapter contract, exact release pinning, docs-ingestion allowlist,
  route projections, redaction, candidate labels, download denial, and the
  Web conformance receipt.
- **Standards workspace:** source authorship and maturity declarations only;
  its local Planned/Experimental material is not an owner acceptance.
- **Registry:** canonical source catalog, rights-aware ingestion, identifiers,
  mappings, API/Workbench semantics, release identity, and Registry acceptance.
- **Data:** canonical projection, mappings/loss accounting, API fixtures,
  availability, runtime compatibility, and Data owner acceptance.
- **Security/Privacy:** server-only bearer handling, URL/redirect/response
  bounds, redaction, secret handling, retention, threat review, and incident
  controls.
- **Operations:** provider application bindings, hosted CI environment,
  staging auth/deployment/health/SLO/monitoring, backups, and rollback drill.
- **Legal/Rights:** source terms, field-level rights, restricted text/raw-byte
  decisions, provenance, licenses, and publication permissions.
- **QA/Accessibility:** positive and negative browser, route, accessibility,
  feed, stale/mismatch, and regression evidence on the same packet.
- **Release owner:** candidate freeze, OCI/SBOM/provenance/signing,
  deployment annotation, publication authority, production approval, and the
  final same-identity gate map.

Requests from a sibling workspace are not receipts. A Web local test is not a
Registry/Data owner receipt. Provider capability is not application binding.
No owner may accept another owner's gate by inference.

## Hosted, staging, release, and production gates

After the matrix above is accepted for one immutable packet, the release owner
must still obtain separate receipts for hosted CI; Typesense, Valkey, GlitchTip,
Infisical, and S3 application bindings; security/privacy/legal/rights review;
staging authentication, deployment annotation, health, SLO, monitoring, and
A-to-B-to-A rollback; signed OCI digest, CycloneDX/SPDX SBOM, provenance and
signature verification; publication/canonical URLs and RSS/Atom/JSON Feed;
production approval/provisioning/smoke; and post-release monitoring. These
gates remain false when only Tower capability, local tests, a manifest, or a
candidate fixture exists. No deployment, credential issuance, provider
activation, publication, or production claim follows from this template.

## Unresolved owner questions

1. Which exact Registry source release, Data projection/schema, and Web
   candidate packet will all owners freeze, and who issues `packetId` and the
   immutable identity fields?
2. Which Registry and Data owners will sign source, mapping/loss,
   rights/provenance, availability, API fixture, and release receipts?
3. Which Web owner will sign docs-ingestion, projection, redaction, candidate
   label, download-denial, and rollback-preimage evidence?
4. Which Security, Privacy, Legal/Rights, QA, Operations, and release owners
   will provide same-identity receipts, and what are their review timestamps?
5. What hosted/provider/staging identities and deployment annotation will bind
   the packet without exposing bearer values or issuing unapproved credentials?
6. What exact OCI digest, SBOM/provenance/signature, publication/feed result,
   production approval, smoke window, and post-release observation window are
   required before any owner may mark a gate accepted?
