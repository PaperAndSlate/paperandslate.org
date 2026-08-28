# Paper & Slate v1 RC closure: owner and operator actions

Date: 2026-08-28  
Scope: private Forgejo, Tower staging, and release-candidate evidence only  
Status: not release-closed; no new RC tag and no production change are authorized by this document

This is the actionable handoff for the remaining gates. It separates repository work Codex can perform from decisions, credentials, provider operations, and qualified approvals that must come from the owner, a platform operator, or a named reviewer. Do not paste passwords, API keys, DSNs, private keys, personal data, legal contracts, or secret-manager values into the repository, screenshots, or chat.

## Current evidence boundary

The current candidate identity is deliberately recorded in generated receipts,
not copied into this handoff where a later evidence-only commit could make it
stale. Read the exact `HEAD`, source tree, lockfile hash, authored worktree
state, and receipt status from these files together:

- `.generated/requirements/traceability-check.json`;
- `.generated/launch/verify.json`;
- `.generated/launch/launch-evidence.json`; and
- `.generated/launch/repository-identity.json`.

The source branch is `release/v1-closure` and the repository remote is the
private Forgejo project `callum/paperandslate-web`. The immutable
`v1.0.0-rc.1` tag remains unchanged; no RC3 tag exists and the candidate is not
published. The existing Coolify source-build workload is
`ngqtewtqeqhj88v1005a38va`, with its latest successful deployment at
`06491dc57fa3f3a43c365a4ab24e07f21e7b04d6`; it is not an OCI image deployment
and must not be treated as current-candidate image evidence.

The pre-refresh read-only Tower snapshot produced exact-SHA runs 134
(`container.yml`), 135 (`lighthouse.yml`), and 136 (`quality.yml`) for
`a318bba836b8494de655bc48ece50559b8a3e881`. All three failed before a runner
was assigned: their bounded job records have no runner, timestamps, or task
steps. This is a Tower/Forgejo scheduling or controller failure, not a passing
or task-level application failure. No current-candidate `supply-chain.yml`
receipt is available. The runner inventory reports one idle runner (ID `1`)
with labels `ubuntu-latest`, `node22`, `docker`, and `playwright`, but
`lastOnline` is null and no usable heartbeat is present. Any later source or
evidence commit requires a fresh exact-SHA run set; these pre-run failures
cannot be reused.

The latest complete local verifier passed its 35 configured quality tasks;
the final receipt then recorded the two aggregate tasks (`launch:report` and
`evidence:bundle`) as completed. That pass includes traceability for 89 plan
files and 1,073 requirements, package and tool typecheck, lint, 12 Lighthouse
reports across six URLs with performance budgets, production browser checks for
12 routes, 13 production visual states, SBOM, scan, launch report, and evidence
bundle. Fumadocs source normalization and serialized production-output
handling are part of the current implementation. Visual evidence remains
`human-review-pending`; local receipts are not hosted staging evidence. No
hosted workflow has run successfully for the current revision.

The earlier managed-transfer credential failure has recovered, but a branch
ref match is not a hosted workflow receipt. Re-check the private Forgejo branch
and hosted workflow results for the final candidate after any authorized
transfer. The generated files listed above remain the authority for the local
candidate identity. Do not paste a token into this repository or chat, and do
not treat a branch match as production authority.

The following are available but do not close the release:

- local code gates: deterministic search generation, content validation, feed validation, workflow policy validation, browser checks, visual captures, and Lighthouse budget checks have passed during this remediation pass;
- Tower resources: Typesense `search`, Valkey `cache`, and S3 `release-evidence` are active; the resource-level provider contract passed, but Typesense has zero documents and Valkey has no candidate-app behavior receipt. The Typesense probe rejected a search-only write as expected, but the required write-key round trip has not been run;
- six Tower monitors are active and their latest one-shot probes are healthy, but the available 24-hour SLO window is historical and degraded: latency p95 is approximately 2.7–2.9 seconds against a 2-second target;
- the private registry policy exists and contains only a historical image (`sha-7aaa9b45ba0b6264d089eb530ecfd471a8e2008b`, digest `sha256:8e88472b8b55250cea13dd039d171d1c53d5722fba773f78bbea1c0010e29f1a`). Its SBOM and scan receipts exist, but the scan reports 49 high and 5 critical findings, provenance is only generated, and signing is `not-configured`; it is not current-candidate evidence;
- GlitchTip project `2` has an older unresolved Tower diagnostic event; there is no exact-candidate labeled event receipt;
- the latest environment-contract validation is invalid with exactly two missing variables: `VALKEY_URL` and `GLITCHTIP_DSN`; values were excluded from the receipt. The active bindings also use the approved application names `TYPESENSE_API_KEY` and `TYPESENSE_SEARCH_API_KEY`, but must be revalidated with the candidate. `KIT_*` remains an explicit optional/disabled decision, not a substitute for the required cache and error-tracking bindings;
- the staging Coolify application is still a source-build workload (`ngqtewtqeqhj88v1005a38va`) at `https://paper-and-slate-web.dev.tower`; its latest successful deployment is for `06491dc57fa3f3a43c365a4ab24e07f21e7b04d6`, not the candidate image. The registry contains only the historical `sha-7aaa9b45ba0b6264d089eb530ecfd471a8e2008b` image and its non-current scan/provenance receipts;
- the six active monitors have healthy latest one-shot probes, while the available 24-hour SLO is historical/degraded at approximately 99.856% availability with p95 latency around 2.7–2.9 seconds against a 2-second target.

Any source or generated-only commit creates a new evidence identity. Re-read
`git rev-parse HEAD` and all local receipts after each such commit; hosted
receipts must be generated by the hosted system for the exact pushed revision
and may not be inferred from these local results.

## 1. Restore hosted CI scheduling

### Owner or Tower operator must

1. Restore the registered Forgejo runner’s actual online heartbeat and job scheduling, or provide a replacement runner with the required labels `ubuntu-latest`, `docker`, and `playwright`.
2. Confirm that the runner can execute Docker-in-Docker or the approved Docker socket/network arrangement without making the browser job root or adding `--no-sandbox`.
3. Confirm that Forgejo exposes complete task logs and uploaded artifact metadata through the authorized Tower read path.
4. Keep the runner enrollment token on the target runner host. Do not return it to Codex or commit it.

### Codex can then

1. Dispatch each workflow against the final exact branch SHA. The current candidate's runs 134–136 are pre-run failures and cannot be reused after the runner is repaired; a current supply-chain run is also required.
2. Inspect run, job, step, log, and artifact receipts and reject any run that has no assigned runner or no task steps.
3. Confirm `quality.yml` runs the bounded production verification, `container.yml` proves the image runtime, and `lighthouse.yml` proves the performance thresholds.
4. Attach redacted run IDs, artifact names, SHA, timestamps, and conclusions to the release evidence bundle.

Stop if any required job is pre-run rejected, has no task-level logs, or produces artifacts for a different SHA.

## 2. Provider credentials and application behavior

The owner/platform operator supplies secret-manager bindings and non-secret identifiers. Secret values stay in Tower/Infisical/Coolify. Codex can consume an authorized execution environment without printing or storing those values.

### Typesense

Owner must provide or bind, for staging only:

- endpoint and region/resource identifier;
- the existing collection policy and the approved alias name;
- distinct write/index and search-only secret names;
- rotation owner, expiry, and permission scopes;
- permission to use deterministic public records and a temporary preview probe.

Codex can run `pnpm search:index --publish-typesense` in an authorized environment. The receipt must show the exact source SHA and prove:

1. a versioned concrete collection is created and populated;
2. the alias points to that collection;
3. project, documentation, and news exact-match queries succeed;
4. RFC 1 ranking and type/source facets succeed;
5. a preview record is written and deleted through the concrete collection, while public search goes through the alias and excludes it;
6. the search-only key cannot write to the concrete collection and the write/search keys differ;
7. static fallback still returns a public record when the primary provider is unavailable.

The script deliberately writes the temporary preview record through the concrete versioned collection. Writing through a Typesense alias would make a real provider run fail or conflate alias semantics with key permissions.

### Valkey

Owner must bind the staging `VALKEY_URL`, approve the application key prefix and TTL policy, and authorize a multi-instance test. Codex can run requests against two application instances and record only redacted results proving:

- namespaced keys are used;
- rate-limit counters expire and fail closed when Valkey is unavailable;
- idempotency claims are shared across instances, expire, and release after provider failure;
- concurrent first requests do not lose the expiration window;
- restarting one instance does not reset distributed protection.

Resource PING/latency is not application behavior evidence.

### GlitchTip

Owner must create or confirm the staging project, DSN binding, environment/release naming, PII scrubbing, sampling, retention, alert destination, and on-call owner. The current repository contains the DSN contract and Tower error-project binding but no application-side `@sentry` capture initialization. Therefore do not claim automatic application capture from the DSN variable alone.

Codex can send one non-user-data, explicitly labeled event after an approved Tower/provider event-emission path is available, then verify the redacted project, event ID, release, environment, and issue receipt. If the provider path cannot emit an event, the owner/operator must provide the bounded event-test authority or approve the separate instrumentation work; the old diagnostic event must remain historical and unresolved until it is deliberately dispositioned.

### Kit

Kit is optional. Owner must decide disabled versus enabled, approve the processor/DPA and consent wording, and if enabled provide a server-only key name, form ID, sender/confirmation/unsubscribe policy, retention rules, and an approved test recipient. Codex can test disabled, validation, duplicate, provider-success, provider-failure, idempotency, and rate-limit paths. Codex must not subscribe a real person without explicit recipient authority.

## 3. Environment-contract closure

Owner/platform operator must bind and redeploy the final staging workload with these required values present and non-secret values correct:

- `NEXT_PUBLIC_SITE_URL`;
- `RELEASE_ID`;
- `GIT_SHA`;
- `DEPLOYMENT_ENV=staging`;
- `PUBLICATION_AS_OF`;
- approved secret bindings for `TYPESENSE_API_KEY`, `TYPESENSE_SEARCH_API_KEY`, `VALKEY_URL`, and `GLITCHTIP_DSN`;
- optional Typesense endpoint/collection/alias/index values;
- an explicit disabled/enabled decision for Kit and its optional fields.

Codex can run the Tower environment-contract validation, verify that no secret is preview-exposed, and compare the health payload’s release/SHA/environment identity with the deployment receipt. A stale controller report is not a passing contract receipt; the validation must be rerun after the exact image deployment.

## 4. OCI image, SBOM, scan, provenance, and release identity

### Owner or Tower operator must

1. Authorize the registry repository, retention, immutability, signer, provenance policy, scan thresholds, and waiver expiry policy.
2. Make the hosted CI build the image from the final Forgejo SHA and push it to `paper-and-slate-web/paper-and-slate-web`.
3. Return only redacted identifiers: image digest, tag, CI run, SBOM object keys, scan result, provenance verification, signature verification, and byte size.
4. Resolve or formally waive any high/critical finding with an owner, reason, scope, and expiry. Do not hide development-tool advisories by changing the scan policy.

Tower v4 reports hosted OCI build, immutable push, image inspection, CycloneDX SBOM, Trivy scan, in-toto provenance, and staging deploy-by-digest capabilities. Signing is not controller-managed, so the owner/operator must provide the approved signer and verification path. Codex can dispatch or inspect the authorized workflow, generate local CycloneDX/SPDX lockfile SBOMs, run the repository scan, compare checksums, validate digest syntax, and reconcile redacted hosted receipts once a live runner and registry authority exist. The available registry report records only one historical image with a successful SBOM/scan artifact, unresolved severity, generated-only provenance, and no configured signature; it is not current-candidate evidence. Until the final SHA has a hosted image, digest, SBOM, scan, provenance, signature decision, and image-backed staging receipt, no hosted OCI closure may be claimed.

The final identity equality check is:

`Forgejo SHA = signed RC tag target = CI build SHA = OCI provenance subject = image SBOM subject = staging deployed digest = rollback artifact identity`

## 5. Parallel image-backed staging workload

The existing source-build Coolify application is a baseline only. Owner/platform operator must authorize a separate Docker Image/web workload and keep the source-build application intact. Do not convert the existing application into a registry deployment.

The image workload must be configured with the approved staging hostname, port, `/health` check, resource limits, secret bindings, and exact immutable digest. Codex can inspect the workload, deploy or queue the approved staging action when that authority and tool path exist, verify the health release/SHA payload, run route/browser/feed checks, and record the deployed digest. A source commit or mutable tag is not a substitute for a digest.

## 6. Visual and Lighthouse evidence

### Owner or qualified visual/media reviewer must

1. Open the 13 production captures under `.generated/launch/visual/` and compare each with its matching reference in `plans/assets/mockups/`.
2. Record capture ID, route/state, intentional deviation, reason, reviewer, approval ID, date, and expiry/next review.
3. Review responsive layout, keyboard focus, contrast, reduced motion, dark mode, empty/error/form states, docs rendering, and search overlay states.
4. Approve or reject every logo, illustration, photograph, generated concept, icon, font, crop, attribution, and identifiable person/data use.

Codex can rerun the production visual matrix against the exact image-backed staging deployment, compute checksums, verify that all expected states were captured, and fail the evidence package when a required state or approval is absent. The current local matrix has 13 captures and is `human-review-pending`. A screenshot hash proves what was captured; it does not prove visual fidelity or media rights.

Codex can run the Lighthouse workflow once the `playwright` runner is actually scheduling jobs. The run must identify the exact SHA, URL, browser version, runner user (`pwuser`), route set, run count, category scores, configured thresholds, and artifact paths. The six routes are `/`, `/projects`, `/docs/file-system/v/1.0`, `/api/search`, `/feeds/rss.xml`, and `/health`; query/route variants required by the acceptance plan must be listed explicitly. Local or historical hosted Lighthouse output cannot be reused for a new candidate.

## 7. Qualified legal, factual, privacy, brand, and media approvals

Owner must assign accountable reviewers and return approval IDs, not confidential review documents:

- product/release owner for scope, copy, launch, and visual deviations;
- qualified legal/privacy reviewer for entity description, privacy, terms, cookies, logs, processors, transfers, retention, deletion, age/jurisdiction issues, and contact wording;
- trademark/brand reviewer for Paper & Slate, Glasscow LLC, marks, logos, and interoperability wording;
- factual reviewer for organization, people, roles, projects, health/maturity, dates, funding, roadmap, adoption, and governance claims;
- media/font rights reviewer for source, license, permission, attribution, modification and publication rights, restrictions, alt text, and crops;
- security/operations owner for monitoring, secrets, incident response, and rollback;
- publication owner for editorial states, corrections, syndication, and feed timing.

The approval package should contain a claim/asset register with:

`claimId or assetId`, exact wording/value, source or license record, reviewer, approval ID, approved date, next-review date, public/private classification, and disposition.

Codex can reconcile approved values against content models, page metadata, JSON-LD, search records, feeds, sitemap, robots, and AI outputs. Codex cannot act as counsel, factual approver, rights holder, or substitute for consent.

## 8. Repository, tag, DNS, TLS, and deployment authority

Owner must explicitly authorize each mutation separately:

1. canonical private Forgejo repository and owner/team;
2. default/release branch and branch-protection rules;
3. required reviews/checks, CODEOWNERS, merge method, secret scanning, and signed commit/tag policy;
4. final commit and push;
5. next unused immutable RC tag (never move `v1.0.0-rc.1`; never create final `v1.0.0` in this closure);
6. registry publication and image-backed staging deployment;
7. staging hostname/certificate changes;
8. production deployment, DNS, TLS, and cutover—separate approval and outside this task.

Codex can inspect repository/tag/branch receipts, push or tag only within explicit authority, validate DNS/TLS/redirects/headers/canonical URLs after an authorized change, and stop before production. A repository grant does not grant DNS, certificate, production, signing, or provider-secret authority.

For DNS/TLS, the owner must supply the approved hostnames, apex/`www` behavior, A/AAAA/CNAME/TXT/CAA changes, TTL/DNSSEC policy, certificate issuer/renewal owner, minimum TLS/HSTS policy, cutover window, rollback TTL, and the operator responsible for the change. Codex must not invent or apply production records.

## 9. Production monitoring, SLO, incident, and rollback evidence

Production remains out of scope until separately authorized. Before any release decision, the operations owner must approve:

- availability, error-rate, latency, search, newsletter, feed, and certificate-expiry SLOs;
- alert destinations, acknowledgement targets, severity levels, PII/log retention, and status-page policy;
- on-call/escalation names and the rollback decision-maker;
- the last-known-good image A and candidate image B, both immutable;
- maximum rollback/data-loss window and the staging drill window.

Codex can reconcile the six staging monitors, probe them, inspect bounded deployment logs, and produce a release-specific SLO receipt after a clean observation window. The current healthy one-shot probes and degraded historical 24-hour window are not sufficient.

The authorized staging drill must be recorded as:

1. deploy immutable image A and capture health/route/monitor results;
2. deploy immutable image B for the exact candidate and capture the same results;
3. trigger rollback to A;
4. verify the deployed digest is A, health identity is A, routes and monitors recover, and no unintended data mutation occurred;
5. record operator, timestamps, deployment IDs, both digests, probes, alert behavior, and final state.

Codex can execute and verify this drill after two image-backed deployments and rollback authority exist. The prior Coolify health recovery is not an A-to-B-to-A receipt.

## 10. Publication, syndication, and feed validation

Publication owner must approve:

- author, factual reviewer, publisher, corrections owner;
- `draft`, `scheduled`, `published`, `corrected`, `superseded`, `archived`, and `withdrawn` semantics;
- publication clock/timezone, embargo, stable IDs, correction/unpublish behavior;
- feed title/description/language/authors/copyright/license/icon/canonical host/update cadence;
- which records appear in RSS, Atom, JSON Feed, sitemap, `llms.txt`, `llms-full.txt`, search, and raw docs;
- syndication/directories/social destinations and the authority for each submission;
- a non-sensitive test publication/correction record and the production publication time.

Codex can validate route status, XML/JSON structure, IDs, dates, escaping, authors, canonical links, draft/future exclusion, corrections, sitemap/robots/OG/JSON-LD/AI outputs, and authorized external receipts. Publication owner must approve real copy, timing, syndication, and any unpublish or correction action.

## 11. Exact closure order after blockers are cleared

Use this order so every receipt points to one immutable source and image identity:

1. collect the redacted owner approval/credential/authority package;
2. finish the final repository change set and push one final release-candidate commit;
3. wait for green exact-SHA quality, container, Lighthouse, and supply-chain workflows with task logs and artifacts;
4. bind the approved staging environment contract and provider secrets, then validate it after deployment;
5. index and verify Typesense, verify Valkey application behavior, and capture the GlitchTip event;
6. publish the OCI digest with SBOM, scan, provenance, and signature/verification receipts;
7. deploy the parallel Docker Image workload by digest and verify health, routes, feeds, search, and browser behavior;
8. capture visual evidence and obtain visual/media, legal/privacy, factual, brand, and publication approvals;
9. run the release-specific SLO observation and A-to-B-to-A rollback drill;
10. regenerate the redacted evidence ledger/bundle from current receipts and verify all identity equalities;
11. list tags and choose the next unused immutable RC name; create it only with explicit tag authority;
12. stop at the RC handoff. Do not create `v1.0.0`, modify production, or alter production DNS/TLS under this closure.

## Stop conditions

Do not tag or call the release closed when any of these is true:

- exact-SHA CI is pre-run rejected, missing task logs, or not green;
- the deployed workload is source-built or uses a mutable tag instead of the candidate digest;
- the image digest, SBOM, provenance, scan, signature, and deployed digest do not agree;
- the Typesense index is empty, the search-only key can write, preview content is public, or static fallback is unproven;
- Valkey is only resource-level healthy without application behavior evidence;
- the exact-candidate GlitchTip event is missing or the provider path is not authorized;
- SLO evidence is historical/degraded rather than release-specific;
- A-to-B-to-A rollback has not been performed with two immutable images;
- a required qualified approval, rights record, claim source, publication decision, DNS/TLS authority, or signer decision is missing;
- any receipt contains secrets, personal data, or an unverified SHA.

The return package should contain only redacted IDs and receipts: reviewer/approval map, provider/resource IDs and secret names, final Forgejo SHA/run IDs, image digest/SBOM/scan/provenance/signature IDs, image-backed deployment and rollback IDs, monitor/SLO results, visual/asset checksums, publication/feed receipts, and the explicit remaining stop condition if closure is still blocked.
