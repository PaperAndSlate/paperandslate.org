# Standards Registry → Web acceptance contract

**Status: Web-owned candidate contract; not an acceptance receipt.**

This document describes the boundary the Web adapter can consume. It does not
adopt the Standards workspace, approve a Registry or Data Platform interface,
or make a stable, public, legal, rights, provider, staging, release, or
production claim. The source-owned Standards consumer requests remain
requested and not accepted; the Registry and Data Platform owners retain
authority for canonical sources, mappings, APIs, rights, provenance stores,
availability, and releases.

## Exact release identity and maturity

Every request is scoped to an exact `release` value. A response must include
`meta.releaseId`, `meta.release`, or `meta.standardsRelease` equal to the
requested identity. The Web adapter rejects missing, mismatched, or conflicting
identity and returns an unavailable state without local fallback data.

The response must also carry consistent `candidateOnly`, `public`, and `stable`
metadata:

- Candidate preview: `candidateOnly: true`, `public: false`, `stable: false`.
  Web may show release-bound metadata, explicit Candidate wording, and only
  rights-permitted API text. This is not publication or adoption.
- Stable/public: `candidateOnly: false`, `public: true`, `stable: true`, plus
  validated `current: true`, `publishable: true`, and a non-denied
  `rightsStatus`. Web may present those exact flags as projection metadata;
  this still is not a Registry/Data owner receipt or production approval.

The adapter uses `STANDARDS_API_URL`, `STANDARDS_RELEASE_ID`, and the
server-only `STANDARDS_API_BEARER`. The bearer is never a browser value, URL
parameter, rendered field, or logged response. URL safety, timeout, redirect,
response-size, and unavailable behavior remain in the adapter.

## Projection surface

The Web-owned adapter maps only these release-bound surfaces:

| Surface                          | Required Web checks                                                                                                                                        | Display boundary                                                                       |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Search, item, framework, sources | exact response release; consistent maturity flags; record/source release identity                                                                          | metadata and only `public-api` text; no restricted wording or bytes                    |
| Coverage                         | exact release plus framework provenance, rights, and availability objects                                                                                  | counts and coverage metadata; no inferred mappings                                     |
| Concepts/crosswalks              | exact release; `relationshipSemantics.status: reviewed-only`; safety flags match response metadata; candidate empty/denied or stable rights-approved state | never infer relationships; preserve limitations and reviewed count                     |
| Comparison/changes               | exact compared candidate identities and candidate-only change flags                                                                                        | candidate comparison metadata only; no stable/public inference                         |
| Readiness/download presentation  | exact validated maturity, current/publishable, provenance, and rights status                                                                               | bulk and CASE exports remain denied unless a separately accepted download grant exists |

`sourceLocator`, `sourceReleaseId`, `candidateReleaseId`, `snapshotId`,
`manifestId`, and artifact hashes are provenance metadata. They are not Git
identity, a release signature, a rights decision, or proof that ingestion is
accepted.

## Separate gates and owner receipts

Candidate preview acceptance means only that Web's local adapter, redaction,
route presentation, and focused tests consume one exact candidate safely. It
does not establish any of the following:

1. **Docs ingestion:** Web must separately pin an authorized immutable source
   revision, validate the allowlist, preserve provenance, and prove safe
   rebuild behavior. A local snapshot or content hash is not a Git/release
   identity.
2. **Registry/Data API projection:** Registry/Data owners must provide an
   immutable release-pinned API/fixture packet, canonical identity, rights and
   availability semantics, and owner acceptance. The Web adapter is not the
   canonical data store, mapping authority, or verifier.
3. **Rights, provenance, and availability:** non-denied display or export
   requires explicit owner evidence for the exact release and field. Missing,
   stale, restricted, unavailable, or conflicting evidence fails closed.
4. **Security and privacy:** Web's server-only credential, URL restrictions,
   bounded response, redirect policy, redaction, and no-untrusted-rendering
   checks are local controls. Security/privacy review, secret management,
   monitoring, incident response, and retention require their own receipts.
5. **Hosted/staging:** provider capability, CI, deployment, domain, health,
   monitoring, and rollback evidence must be independently verified. A valid
   manifest or local test does not prove application staging or provider
   acceptance.
6. **Release and production:** exact candidate freeze, legal/factual review,
   accessibility, SBOM/provenance/signing, publication authority, production
   smoke checks, and rollback are separate owner-controlled gates.

Stable/public production acceptance therefore requires fresh receipts from the
Registry, Data Platform, Web, Security, Privacy, Operations, and release
owners, all bound to the same immutable release/artifact identity. Until those
receipts exist, this document must be read as a Web consumer contract and
acceptance checklist, not as evidence that any gate passed.

## Fail-closed rule

On missing credentials, unsafe URL, missing or mismatched release metadata,
rights denial, unavailable projection, stale provenance, or an unrecognized
response shape, Web returns an explicit unavailable/denied state and shows no
unverified local data. No fallback may mix releases, promote Candidate to
Stable, infer relationships, expose source bytes, or create a download URL.
