# Paper & Slate v1 release-closure report

Date: 2026-08-27  
Candidate: `v1.0.0-rc.2` (staging candidate; not yet tagged)  
Candidate source: `7aaa9b45ba0b6264d089eb530ecfd471a8e2008b`  
Branch: `release/v1-closure`

## Decision

The candidate is healthy and identity-checked in private Tower staging, and the exact-SHA hosted publication and Lighthouse checks pass. Release closure is not complete. The candidate must not be tagged or promoted until the unresolved technical gates and the human/qualified-review gates below produce attributable evidence.

The report and receipt commit is an audit-record update after the staging deployment; it does not change the deployed candidate source SHA. Any final release evidence must continue to distinguish the deployed candidate SHA from later documentation-only commits.

Immutable `v1.0.0-rc.1` remains at `031b5447786f9c619288c9044bb5bc65319a30d7`. It was not moved or retagged. Public GitHub, production deployment, production DNS/TLS, final `v1.0.0`, authentication, API work, and platform integration were not performed or started.

## Exact candidate evidence

| Area                          | Result                                     | Evidence and boundary                                                                                                                                                                                                                                                                                                                          |
| ----------------------------- | ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Source/repository             | Passed for the selected private branch SHA | Private Forgejo branch `release/v1-closure`; the record binds the selected source to `7aaa9b45ba0b6264d089eb530ecfd471a8e2008b`. Protected review and signed release-tag evidence are still absent.                                                                                                                                            |
| Staging deployment            | Passed                                     | Coolify application `ngqtewtqeqhj88v1005a38va`, deployment `zzpooecepztro4urk5sx6obv`, URL `https://paper-and-slate-web.dev.tower`; `/health` reports `deployment=staging`, `releaseId=v1.0.0-rc.2`, and the exact SHA.                                                                                                                        |
| Hosted publication            | Passed                                     | 12 exact routes, content types, status codes, canonical-host checks, robots/sitemap/AI output checks, and RSS/Atom/JSON Feed structure passed. Feed item counts are 1/1/1.                                                                                                                                                                     |
| Hosted Lighthouse             | Passed                                     | 12 reports across six configured staging URLs; release, environment, deployment, and SHA are recorded in the manifest.                                                                                                                                                                                                                         |
| Visual evidence               | Captured; human review pending             | 13 captures, no runtime errors. Pixel/deviation approval and media/font rights approval are intentionally not automated.                                                                                                                                                                                                                       |
| Local aggregate               | Passed with boundary                       | 28 local checks passed at source `65f739168f71e6c8a6b9c16d5c09929b0ead41cc`, release `rc2-local-final`, with external checks intentionally skipped. Final candidate format, lint, typecheck, and standards-change tests passed at `7aaa9b45ba0b6264d089eb530ecfd471a8e2008b`; rerun the full aggregate for the final tag.                      |
| Private Forgejo CI            | Failed/unresolved                          | Exact candidate runs 25–27 failed. Tower exposed no Actions task/job endpoints or step logs, so the failure cause and artifacts cannot be truthfully identified from the available structured surface.                                                                                                                                         |
| Typesense                     | Degraded but safely bounded                | Managed search-only scope is separated from write scope and unauthorized write attempts are rejected. The collection is empty; authenticated search is indeterminate against zero documents and the app remains on static fallback. Indexing, alias, ranking, facets, and preview-exclusion evidence are open.                                 |
| Valkey/S3                     | S3 passed; Valkey partial                  | Resource-level roundtrips passed for both. Application-level Valkey TTL, idempotency, rate-limit, failure, and multi-instance behavior remain unproved; newsletter/Kit is disabled.                                                                                                                                                            |
| GlitchTip                     | Degraded                                   | Binding and historical labeled event are healthy, but no final exact-SHA labeled event receipt is available.                                                                                                                                                                                                                                   |
| Monitoring/SLO                | Degraded                                   | Six fresh probes passed. The available SLO is a degraded historical 24-hour window, not a release-specific clean window. Monitor listings also need controller review because multiple persisted/displayed paths appeared as `/`; Tower environment-contract validation still returns HTTP 500 even though the light provider contract passes. |
| OCI/SBOM/provenance/signature | Not evidenced                              | The project-scoped private registry is empty. Coolify currently builds directly from Forgejo; no hosted immutable image digest, image SBOM, provenance, signature, or deployed-digest equality is claimed.                                                                                                                                     |
| Rollback                      | Not evidenced                              | An A→B→A drill requires two immutable hosted artifacts and is therefore not runnable yet. The earlier Coolify health-check recovery is not a substitute.                                                                                                                                                                                       |
| Vulnerabilities               | Partial                                    | Production dependency audit is clean. Four development-tool advisory groups remain visible and require owner/security disposition; they must not be suppressed.                                                                                                                                                                                |

The redacted machine-readable snapshot is [`config/tower-evidence.json`](config/tower-evidence.json). Generated receipts are under `.generated/launch/`, including [`staging-publication.json`](.generated/launch/staging-publication.json), [`lighthouse-run.json`](.generated/launch/lighthouse-staging/lighthouse-run.json), [`visual/manifest.json`](.generated/launch/visual/manifest.json), and the local aggregate [`verify.json`](.generated/launch/verify.json). Generated evidence is not a substitute for the missing provider, review, signature, or human approvals.

## Findings and resolution plan

This section is a plan for the remaining defects or incomplete acceptance steps. It does not claim that the actions below have been completed.

### 1. CI failure is not diagnosable through the current Tower surface

The latest exact-SHA runs fail, but no job/task records or step logs are exposed. The workflow artifact action names were normalized to Forgejo’s supported qualified action host and the exact source was rerun; another speculative workflow edit would risk obscuring the provider failure.

Resolution plan:

1. A Forgejo/Tower operator opens private runs 25, 26, and 27 and captures the complete task/job logs, annotations, runner identity, artifact result, and failure step without placing secrets in the repository.
2. The operator identifies whether the failure is runner, action-host, permissions, dependency, network, or workflow-specific, then applies the smallest approved repair.
3. Codex can review and normalize the redacted receipt, update only the affected workflow/configuration, rerun the exact candidate SHA, and verify all required jobs/artifacts once the cause is known.
4. Passing exact-SHA CI plus protected review/signature evidence is required before RC2 tagging.

Owner/operator input: private Forgejo task-log access and permission to repair/rerun CI.  
Codex can do: bounded workflow repair after diagnosis, rerun, evidence reconciliation, and ledger generation.

### 2. Hosted release identity is incomplete

The registry contains no hosted image. A local image digest or local SBOM proves only the local build; it does not prove the exact hosted artifact deployed by Coolify.

Resolution plan:

1. The release operator approves the private OCI repository, retention/immutability, image naming, tag policy, signer/OIDC policy, SBOM formats, scan threshold, exception policy, and publication authority.
2. Codex or the authorized CI runner builds the reviewed source, publishes the immutable image, produces image and lockfile SBOMs, records provenance and vulnerability results, signs using the approved mechanism, and verifies all receipts.
3. Coolify deploys the exact approved digest rather than an unpinned source build, and Tower records source SHA, tag, digest, deployed digest, SBOM, provenance, signature, scan, and deployment identity as one redacted receipt.
4. A final RC2 tag is created only after equality across source, signed tag, CI, OCI digest, SBOM, scan, and deployment is verified.

Owner/operator input: registry/signing/release authority and approved CI publication scope.  
Codex can do: artifact generation, verification, private publication, and evidence packaging after that authority exists; it cannot invent a signer or publish publicly.

### 3. Provider completion is partial and must be decided explicitly

Typesense credentials are now least-privilege at the application boundary, but the collection has zero documents and the hosted application truthfully reports static fallback. Valkey and S3 resource probes pass, but only S3 has a complete resource-level roundtrip acceptance. The final exact-SHA GlitchTip event and the Kit decision are open.

Resolution plan:

1. The provider owner approves region, retention, privacy/DPA, billing, preview/production separation, rotation owner, and test data policy.
2. Codex can index deterministic public records into an authorized preview collection, verify schema/alias/build ID, search-only behavior, ranking/facets, preview exclusion, latency, outage fallback, and rollback, then remove test data if authorized.
3. Codex can run Valkey TTL, idempotency, rate-limit, failure, and multi-instance tests after the application is enabled and test authority is supplied. The owner must decide whether Kit is enabled for this release and approve a test recipient if a real subscription is required.
4. Codex can emit one labeled staging GlitchTip event for the exact SHA and verify it through the bounded provider surface after the event-test authority is available. No DSN or secret value belongs in the evidence.
5. Each provider may be marked passed, intentionally deferred, or out of scope only with an owner, date, privacy decision, and non-secret receipt.

Owner/operator input: provider project decisions, secret-manager names, test authority, and privacy/retention approvals.  
Codex can do: scoped configuration and machine tests without reading or exposing secret values.

### 4. Monitoring, environment contract, SLO, and rollback evidence are not yet release-grade

Fresh monitor probes are healthy, but the historical 24-hour SLO is degraded and not tied to a clean release window. The monitor-path display/materialization discrepancy must also be explained before route-specific coverage is treated as proven.

The Tower environment-contract validation call still returns HTTP 500 after the manifest and staging deployment, while the lighter provider-contract suite passes. This is a controller/contract evidence blocker, not proof that the application health endpoint failed.

Resolution plan:

1. The operations owner approves availability, latency, error, search, newsletter, feed, and certificate SLOs; alert destinations; on-call/escalation; PII/log retention; incident severity; and the clean-window start/stop rule.
2. A Tower operator verifies that each declared monitor persists the intended route (`/health`, `/`, `/projects`, docs, search, and RSS), repairs the controller if the API/listing is wrong, and supplies a redacted monitor receipt.
3. A Tower operator diagnoses and repairs the environment-contract validation 500, or supplies an approved documented exception that preserves the staging identity and evidence boundary.
4. After two different immutable hosted images are available, the operations owner authorizes an A→B→A staging window and stop criteria.
5. Codex can deploy/probe A, deploy/probe B, restore A by digest, compare identities, capture timestamps and health, and produce the rollback receipt. It must not run a production rollback.

Owner/operator input: SLO/on-call policy, controller remediation, and rollback window/authority.  
Codex can do: bounded monitor checks, release-specific measurement, and the staging rollback drill once the prerequisites exist.

### 5. Visual, Lighthouse, and accessibility evidence needs the correct approval boundary

Machine evidence is strong within its scope: hosted Lighthouse passes and the visual harness has 13 clean captures with no runtime errors. The harness intentionally does not decide whether a deviation from supplied mockups is acceptable or whether an image/font may be published.

Resolution plan:

1. Codex can regenerate the exact-SHA hosted Lighthouse and visual manifests, inspect route coverage, compare reference/candidate images, check responsive/theme states, inspect runtime errors, and prepare a review packet.
2. The product owner reviews intentional visual deviations, interaction behavior, responsive layouts, contrast, and accessibility exceptions, then returns approval IDs or a correction list.
3. The media/font rights reviewer verifies source, license/permission, checksum, alteration rights, attribution, crop, alt text, identifiable-person release, and web-embedding rights for every published asset.
4. Codex can apply an approved correction in a later authorized change and rerun the evidence; it cannot convert hashes or automated Lighthouse scores into human approval.

Owner input: visual-deviation and media/font-rights decisions.  
Codex can do: evidence capture, comparison, technical accessibility checks, and remediation after an approved change.

### 6. Qualified legal, factual, privacy, and institutional review is required

The repository must not be treated as the authority for legal status, institutional affiliation, people, funding, adoption, health, or roadmap claims merely because text renders successfully.

Resolution plan:

1. The owner names qualified legal/privacy, licensing/trademark, factual/institutional, people/maintainer, and funding reviewers and gives each scope, jurisdiction, source of truth, approval ID, effective date, and review date.
2. Review Privacy, Terms, Security, Accessibility, Code of Conduct, contribution, conflicts, license, trademark, provider, cookies, analytics, font, media, and subprocessors text against actual processing.
3. Return a claim register with exact approved wording/value, authoritative source, reviewer, classification, and expiry/review date. Do not invent or silently broaden the approved description of Paper & Slate.
4. Codex can reconcile approved IDs against content, metadata, feeds, search, sitemap, AI-readable output, and generated artifacts, then flag unsupported or superseded claims.

Owner/qualified reviewer input: the approvals and claim/rights registers.  
Codex cannot grant legal, privacy, licensing, trademark, factual, or institutional approval.

### 7. Repository, DNS/TLS, deployment, and production authority remain separate

Private Forgejo and authorized staging authority are sufficient for the bounded work completed here. They do not imply permission to modify production DNS/TLS, publish public GitHub, deploy production, or create the final release.

Resolution plan:

1. The release owner returns the canonical repository/branch/PR/tag policy, protected-review result, signature policy, exact mutation scope, and stop condition.
2. The domain owner returns canonical host, redirects, DNS records, DNSSEC/CAA, certificate issuer/renewal, HSTS policy, propagation window, and whether Codex may edit or only validate.
3. The deployment owner returns staging/production target identifiers, environment contract, digest-promotion rule, maintenance window, approver, smoke gates, and rollback authority.
4. Codex can validate the supplied state and prepare a change set or run owner-authorized staging operations. Production and DNS/TLS mutations remain separately authorized.

### 8. Publication, syndication, and feed acceptance need editorial ownership

The exact candidate’s staging routes and feeds pass machine validation, but that is not a publication decision or permission to syndicate.

Resolution plan:

1. The publication owner approves state semantics, publication clock/timezone, embargo, stable IDs, corrections, supersession, withdrawal, authors, copyright/license, canonical host, and update cadence.
2. The factual reviewer approves each feed/search/sitemap/AI-readable item and supplies any correction or unpublish rule.
3. The owner authorizes each external directory, social, or syndication destination and provides non-secret destination identifiers; credentials stay in the approved secret manager.
4. Codex can rerun XML/JSON Feed, sitemap, robots, canonical, JSON-LD, draft-exclusion, correction, and conditional-request checks and attach authorized destination receipts.

## Recommended closure order

1. Resolve and rerun exact-SHA CI.
2. Decide and test provider scope, including Typesense data, Valkey application behavior, GlitchTip exact-SHA event, and Kit.
3. Publish/sign/scan the immutable OCI artifact and bind the deployed digest.
4. Establish a clean release-specific SLO window, repair monitor-path materialization, and run A→B→A staging rollback.
5. Obtain visual, media/font, legal/privacy/licensing/trademark, factual/institutional/people/funding, and publication approvals.
6. Regenerate the final evidence bundle, verify all identities, and authorize the immutable `v1.0.0-rc.2` tag. Do not create final `v1.0.0` in this task.

The detailed owner package and return format are in [`NEXT_PHASE_MANUAL_REVIEW.md`](NEXT_PHASE_MANUAL_REVIEW.md) and [`RELEASE_EVIDENCE_HANDOFF.md`](RELEASE_EVIDENCE_HANDOFF.md). Missing authority is a blocker, not an assumption.
