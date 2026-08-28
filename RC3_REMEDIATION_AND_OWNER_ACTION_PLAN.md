# Paper & Slate Web v1 RC3 Remediation and Owner Action Plan

**Audit mode:** verification and planning only. No implementation fix, release tag, push, deployment, production change, provider mutation, or approval was performed by this audit.

**Audit date:** 2026-08-27 local time; Tower timestamps below are returned in UTC and may appear as 2026-08-28.

**Target candidate:** `v1.0.0-rc.3`

**Scope:** verify the Paper & Slate web v1 implementation against the supplied implementation and infrastructure plans, identify bugs and incomplete evidence, and define the dependency-ordered work required to close RC3. Authentication, API, platform integration, public GitHub publication, production deployment, production DNS, and the final `v1.0.0` release remain outside this plan's authorized execution scope.

## Executive decision

The implementation is not fully verified or release-closed. The repository has a substantial local implementation and the local quality sequence reported passes through build, browser, accessibility, visual capture, and publication checks. However, the current release evidence cannot support an RC3 acceptance claim because the candidate identity is split between local and remote history, Forgejo CI is not green for the candidate, the staging environment contract has no receipt, Typesense has zero indexed documents, the monitored route paths are materialized incorrectly, the only reported OCI image has critical/high findings and is from an older commit, no digest-based Docker Image staging workload or A-to-B-to-A rollback receipt exists, and the remaining legal, factual, media, credential, authority, and publication approvals are human gates.

The findings below distinguish:

- **Implementation bug:** repository behavior or evidence tooling can make a false claim or fail to enforce a required invariant.
- **Configuration/documentation defect:** intent exists but the checked-in or Tower representation is incomplete, stale, or ambiguous.
- **External evidence gap:** the implementation may be present, but the required hosted/provider/release receipt is absent.
- **Human gate:** only the owner or a suitably qualified reviewer can approve the matter.

## Audit boundaries and side effects

The audit did not edit application source, workflows, infrastructure configuration, or release metadata. It created this action plan as requested.

`pnpm verify` was run with `VERIFY_SKIP_EXTERNAL=true` and reached the container step. Its preceding output reported passes for requirements (1,066 records), docs/search/content/feeds/routes/security/SEO, formatting, lint, typecheck, Vitest (16 files/45 tests), build (74 static pages), browser smoke (7), RC accessibility (21), links, local visual checks, production browser checks (12 routes), and production visual captures (13). `scripts/container-check.ts` then waited on a Docker build without returning. The process was stopped after the bounded audit window; it was not a Docker/container cleanup operation. The generated files `.generated/launch/verify.json` and `.generated/launch/container-check.json` consequently remain in a `running` state and must not be treated as passed evidence.

The verification regenerated the tracked `IMPLEMENTATION_LEDGER.md`. The working tree also contained the following unrelated/incoming standards work and it must be preserved while any future candidate is selected:

- `apps/web/src/app/(public)/standards/page.tsx`
- `apps/web/src/app/globals.css`
- `apps/web/src/app/sitemap.ts`
- `apps/web/src/app/(public)/standards/methodology/`
- `apps/web/src/components/standards/standards-methodology.tsx`
- `tests/browser/standards-methodology-a11y.spec.ts`
- `tests/browser/standards-methodology.spec.ts`

A fresh `pnpm vulnerability:scan` reported `passed-production-with-tooling-advisories`: production dependencies passed, while four development-tool advisory groups remain recorded (`tmp` low, `uuid` moderate, `tmp` high, and `extract-zip` high). This is evidence, not a remediation.

## Evidence snapshot

The latest read-only Tower project snapshot used for this plan was captured at `2026-08-28T03:40:32Z` and reported project status at `2026-08-28T03:40:34Z`.

| Area                  | Observed state                                                                                                                                                                                                                                                                                                                                                                                                  | Release implication                                                                                                  |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Local branch          | `release/v1-closure`, local `HEAD` `ecdd74953c1466dae90d96b238c9cfdd038efb8b`, ahead of `origin/release/v1-closure` at `7aaa9b45ba0b6264d089eb530ecfd471a8e2008b` by three documentation commits                                                                                                                                                                                                                | There is no single verified RC3 source identity.                                                                     |
| Remote branch policy  | Remote read-back reports `release/v1-closure` as unprotected, with zero required approvals and status checks disabled                                                                                                                                                                                                                                                                                           | A candidate push/tag must be covered by an owner-approved review and branch-protection decision.                     |
| Existing tag          | `v1.0.0-rc.1` points to `031b5447786f9c619288c9044bb5bc65319a30d7`                                                                                                                                                                                                                                                                                                                                              | RC1 must remain unchanged; RC2/RC3 must not be inferred.                                                             |
| Forgejo releases      | Tower release listing returned no releases and no RC2/RC3 release receipt was visible                                                                                                                                                                                                                                                                                                                           | No immutable RC3 tag/release proof exists.                                                                           |
| Tower                 | Controller `4.12.0` commit `fc8efdcf1c168785acd5b51fe2b611c58a5f5090`; plugin `0.18.0` commit `78cf343b808666b33bbdcef09aee7743873cfc80`; Forgejo `16.0.3+gitea-1.22.0`; runner `13.0.0`                                                                                                                                                                                                                        | All receipts must identify this platform snapshot or a later one.                                                    |
| CI                    | 53 failures in 54 recent runs; only generated OCI run 62/external 53 passed, while generated quality run 63/external 54 failed. Original source `7aaa9b4` runs 25–29 also failed across container, Lighthouse, and quality workflows.                                                                                                                                                                           | A generated branch pass is not an exact candidate pass. Full logs are still required.                                |
| CI evidence transport | Tower exposes bounded run/job metadata but jobs have `runner: null`, `steps: []`, and no artifacts for inspected runs                                                                                                                                                                                                                                                                                           | The failure cause and artifact completeness are unclassified, not proven to be application code.                     |
| Forgejo token access  | Secret-free token inspection failed because the bound token lacks the required `read:user` scope                                                                                                                                                                                                                                                                                                                | Credential repair/rotation is required before dependable repository and CI lifecycle work.                           |
| Staging               | Coolify app `ngqtewtqeqhj88v1005a38va`, `paper-and-slate-web-staging`, source build, branch `release/v1-closure`, healthy at `https://paper-and-slate-web.dev.tower`, current healthy source deployment `zzpooecepztro4urk5sx6obv` from `7aaa9b4`                                                                                                                                                               | This is an older source deployment, not an RC3 image deployment.                                                     |
| Environment contract  | `tower_environment_contract_status` returned no report; 12 secret-binding rows were healthy but values were not inspected                                                                                                                                                                                                                                                                                       | Binding health is not proof that release identity, canonical URL, publication date, or provider behavior is correct. |
| Typesense             | Resource `5d04e4b6-1126-42a3-bdc7-b26bb4183cb7`, collection `tower_paper-and-slate-web_search`, zero documents; authenticated search returned 400; search-only write returned 401; write roundtrip was not tested                                                                                                                                                                                               | Search success, facets, ranking, aliases, preview exclusion, and outage fallback are not hosted-verified.            |
| Valkey                | Resource `0975390e-a0df-4b12-b76c-ca285c474502` was infrastructure-healthy and credential probes worked                                                                                                                                                                                                                                                                                                         | Newsletter rate limiting, idempotency, TTL, and multi-instance behavior remain unverified.                           |
| GlitchTip             | Project `2`, issue `PAPER-AND-SLATE-WEB-1`, unresolved, count 4, staging-only synthetic activity, latest known release `v1-closure-rc-hardening-final4`                                                                                                                                                                                                                                                         | No exact RC3 event receipt exists; synthetic history must not be hidden or silently resolved.                        |
| Monitors              | Six active monitors were healthy, but every materialized record used `path: "/"`, including docs, search, and RSS. IDs: health `58a88f60-2183-48e8-9f38-69cf81f43e1c`, homepage `ea56c3ff-7b67-471c-be9b-2b7015bc2c2f`, projects `5c6716bf-67db-4e76-887a-61896934364b`, docs `466b911c-5fee-48cc-b0c9-cf7faeb6e6f2`, search `ac495eb1-4a12-4256-944a-7c338a8fa9f4`, RSS `a11b4696-54c5-41c6-95ac-9a9d2f33bdd4` | Current monitor health is not route-specific evidence.                                                               |
| Historical SLO        | Current 24-hour read-back: availability approximately 74.46% against 99%; all six budgets exhausted; homepage p95 1,199 ms, docs 2,719 ms, projects 2,123 ms, search 1,001 ms, RSS 1,014 ms, health 927 ms                                                                                                                                                                                                      | Preserve the historical incident; begin a fresh release-specific window after corrected monitors and deployment.     |
| Prior OCI image       | Tag `sha-7aaa9b45ba0b6264d089eb530ecfd471a8e2008b`, digest `sha256:8e88472b8b55250cea13dd039d171d1c53d5722fba773f78bbea1c0010e29f1a`, CycloneDX success with 3,690 components, Trivy 5 critical/49 high/107 medium/112 low/4 unknown, 18 fixable                                                                                                                                                                | This is prior evidence only and cannot close RC3.                                                                    |
| OCI signing           | Registry policy supports SBOM and vulnerability scanning, but Tower capabilities report signing unavailable; prior image says `not-configured`                                                                                                                                                                                                                                                                  | Signing must be explicitly enabled or documented as an owner-approved exception.                                     |
| Local reports         | `config/tower-evidence.json`, `V1_RC_REPORT.md`, `AUDIT_VERIFICATION_REPORT.md`, `IMPLEMENTATION_REPORT.md`, `LAUNCH_READINESS.md`, and related handoff documents are RC2/older snapshots                                                                                                                                                                                                                       | They must not be reused as RC3 evidence without receipt-bound regeneration.                                          |

## Findings and planned resolution

### F-01 — No coherent RC3 source identity (P0, external release blocker)

**Evidence:** local `HEAD` is `ecdd74953c1466dae90d96b238c9cfdd038efb8b`; the remote release branch remains `7aaa9b45ba0b6264d089eb530ecfd471a8e2008b`; local is ahead by three documentation commits; RC1 remains at its original SHA; no RC2/RC3 release receipt is visible.

**Risk:** CI, staging, artifacts, reports, and a future tag could refer to different source trees. An RC3 label without one verified SHA would be non-auditable.

**Planned resolution:**

1. Preserve and review the incoming standards changes and the three local documentation commits. Select one intended candidate tree; do not discard changes merely to make the tree clean.
2. Run the source checks on that exact tree and record the full 40-character SHA.
3. Repair the Forgejo credential lifecycle, push only the approved branch contents through Tower, and read the remote branch back.
4. Require the remote branch SHA, CI run commit SHA, staging source/image SHA, evidence bundle SHA, and later `v1.0.0-rc.3` tag SHA to be identical.
5. Leave RC1 untouched and do not move or overwrite any existing tag.

**Codex can do:** candidate reconciliation, exact-SHA checks, non-secret remote inspection, and evidence generation after the owner confirms which incoming changes belong in RC3 and authorizes the Forgejo operation.

**Owner must do:** approve the candidate contents and grant/confirm repository push, branch protection, tag, and release authority.

**Acceptance:** remote branch and CI commit equal the selected SHA; `v1.0.0-rc.3` is created once, points to that SHA, and is immutable/readable without changing RC1.

### F-02 — Forgejo CI is not a green exact-candidate gate (P0, external/provider or workflow blocker)

**Evidence:** Tower reports 53 failures among 54 recent runs. The only passing run is generated OCI work on `tower/oci-d2d3ead6-cad` at `1b5873b808fd63a81c54375af925d1c77923d5e8`, not the candidate. The latest generated quality run failed. The source branch's recent container, Lighthouse, and quality runs failed. Tower job metadata has no runner or steps and no artifacts were listed for inspected runs.

**Important distinction:** the evidence does not prove that the repository workflow is the cause. The runner/action resolution, Forgejo integration, artifact transport, and the workflow itself are all possible causes and require full logs.

**Planned resolution:**

1. Obtain the complete Forgejo job logs and action-resolution messages for one failed source run and one generated run. If the current Tower MCP cannot expose them, use the scoped Forgejo UI or update the Tower plugin/controller; do not guess from empty `steps: []` metadata.
2. Confirm runner scheduling, action availability, checkout, pnpm setup, Node cache, Playwright dependency installation, Docker availability, and artifact upload.
3. Inspect repository-owned workflow issues only after the logs identify them. Candidate items to verify include unqualified `actions/checkout@v4`, `pnpm/action-setup@v4`, and `actions/setup-node@v4` references, the hard-coded `PUBLICATION_AS_OF: 2026-08-27`, and the limited artifact paths.
4. Repair the smallest confirmed issue, rerun on the exact selected SHA, and preserve failed-run logs as evidence.
5. Do not treat Tower's aggregate `ci_health_report` of one active runner and overall healthy as a substitute for a successful exact-candidate run; reconcile the two views.

**Codex can do:** inspect workflow source, analyze returned logs, prepare a bounded repository patch if the logs identify a repo-owned defect, dispatch/rerun the authorized staging/CI workflow, and import the run/artifact receipts.

**Owner/platform must do:** expose complete logs/artifacts or provide scoped UI access, repair runner/action infrastructure when that is the cause, and approve the repository write/rerun.

**Acceptance:** one Forgejo run for the exact candidate SHA passes all required jobs, has a non-null runner and complete logs, and contains the expected evidence artifacts.

### F-03 — Environment contract and canonical identity have no current receipt (P0, external staging blocker)

**Evidence:** `tower_environment_contract_status` returned `{report:null}`. The current Coolify deployment is healthy, but it is from `7aaa9b4`. The contract requires `NEXT_PUBLIC_SITE_URL`, `RELEASE_ID`, `GIT_SHA`, `DEPLOYMENT_ENV`, and `PUBLICATION_AS_OF`, plus provider bindings.

**Planned resolution:**

1. Validate the non-secret contract through Tower with the exact candidate values and approved staging URL.
2. Redeploy the exact candidate source or immutable image to staging without replacing the existing known-good deployment until the candidate is independently healthy.
3. Verify `/health` returns the exact release ID, SHA, `deployment: staging`, build identity, docs identity, and truthful search state.
4. Inspect canonical tags, metadata base, OpenGraph URLs, JSON-LD, feed links, sitemap locations, robots, and `llms` documents for the staging origin and absence of localhost URLs.
5. Preserve the contract validation receipt and response hashes without storing secret values.

**Acceptance:** the contract receipt, Coolify deployment source/digest, health response, and rendered canonical/publication outputs all identify the same candidate and staging origin.

### F-04 — Typesense is provisioned but not populated or behavior-verified (P0, provider blocker)

**Evidence:** Tower resource `5d04e4b6-1126-42a3-bdc7-b26bb4183cb7` is healthy, but `tower_paper-and-slate-web_search` has zero documents. The repository configuration names `search_records` in `config/search.yml:10-12`; the Tower project names a different collection. Authenticated search returned 400, search-only write returned 401, and write-credential roundtrip was not tested.

**Planned resolution:**

1. Confirm the authoritative collection/index name and alias with the owner/platform operator; reconcile it with the application binding without exposing credentials.
2. Build the candidate's deterministic search records and index the expected record count (currently local generation reports 17 records).
3. Test exact search matches, aliases, ranking, facets, source/type filters, public-only visibility, preview exclusion, empty-query behavior, query limits, and malformed input.
4. Simulate or safely exercise provider timeout/error behavior and verify static fallback results, degraded telemetry, and no preview leakage.
5. Verify write-key and search-only-key separation, rotation ownership, and no secret values in logs/evidence.

**Acceptance:** the collection has the expected candidate record count, representative queries return correct results and facets, preview records are excluded publicly, and a controlled provider outage returns static public fallback with an explicit degraded state.

### F-05 — Valkey has infrastructure evidence but no application behavior evidence (P1, provider gap)

**Evidence:** resource `0975390e-a0df-4b12-b76c-ca285c474502` is healthy and credential probes work, but the required distributed newsletter behavior has not been run against staging. Local tests cover the adapter and fail-closed paths only.

**Planned resolution:** run a bounded staging test against at least two application instances for rate limiting, idempotency, TTL expiry, duplicate requests, concurrent requests, provider failure, and fail-closed behavior. Use synthetic addresses or a non-delivery test mode; do not send real mail or retain PII. Record operation IDs, status codes, TTL/behavior summaries, and resource correlation IDs only.

**Owner gate:** Kit is currently disabled. The owner must decide whether RC3 only proves disabled behavior or authorizes a test recipient/provider configuration and supplies the privacy-approved test procedure.

### F-06 — GlitchTip contains unresolved synthetic history and no exact RC3 event (P1, observability gap)

**Evidence:** project `2` has unresolved issue `PAPER-AND-SLATE-WEB-1`, count 4, no frames, and staging activity labelled `tower-hardening-20260828` for release `v1-closure-rc-hardening-final4`. This appears synthetic, but it is still an unresolved issue.

**Planned resolution:**

1. Send one explicitly labelled, non-user-data synthetic event from the exact RC3 staging deployment.
2. Verify its event ID, release, environment, and project receipt in GlitchTip.
3. Preserve the prior synthetic issue and its history. Do not mute, suppress, resolve, or delete it automatically.
4. Have the release owner decide whether the synthetic issue should be annotated/resolved under the observability policy, and record the decision and approval ID.

**Acceptance:** an exact RC3 event is visible in the correct project/environment, the synthetic history is accounted for, and any status change has an owner-approved reason.

### F-07 — Monitor route materialization drops every configured path (P1, configuration/evidence bug)

**Evidence:** `.tower/project.yaml:117-129` supplies full URLs but omits explicit path/query fields. Tower read-back materialized every target with `path: "/"`, including docs, search, and RSS. Six probes returning 200 therefore do not prove six route-specific monitors.

**Planned resolution:** represent each target with an explicit origin, path, query, expected status, and content assertion where supported; reconcile it through Tower; read every monitor back by ID; and run one bounded probe per route. The search target must retain `q=paper` as a query, not as an accidentally flattened path.

**Acceptance:** the read-back records contain `/health`, `/`, `/projects`, `/docs/file-system/v/1.0`, `/api/search` with its query, and `/feeds/rss.xml` as distinct paths with the intended expected status.

### F-08 — Historical SLO is degraded and no release-specific SLO window exists (P0, observability/release blocker)

**Evidence:** the current 24-hour Tower SLO window reports approximately 74.46% availability against 99%, zero remaining budget for all six targets, and elevated p95 for docs/projects. The available tool returns a historical 24-hour view, not a release-specific window.

**Planned resolution:** preserve the historical result as an incident baseline; correct monitor paths; deploy the exact RC3 candidate; start a fresh, explicitly timestamped RC3 observation window; define availability and p95 thresholds before measuring; and record monitor IDs, sample count, window, status, latency, burn, and any excluded warm-up interval.

**Acceptance:** a new release-specific window shows the agreed SLO for the agreed duration, with route-specific monitors and no silent reset of the historical failure.

### F-09 — No hosted immutable RC3 image, and the prior image fails the security bar (P0, supply-chain blocker)

**Evidence:** the only registry image is from `sha-7aaa9b45...`, with digest `sha256:8e88472b...`, 5 critical and 49 high Trivy findings, and 18 fixable findings. It is not the local candidate. Its signature is `not-configured`; provenance is only reported as generated.

**Planned resolution:**

1. Obtain structured image build, scan, SBOM, provenance, and signing operations through the current Tower/CI route. The current MCP exposes `tower_registry_image_report`, which records evidence but does not build, push, or scan; it cannot create proof by itself.
2. Analyze each critical/high finding for runtime reachability, package path, fixed version, and exploitability. Patch the base image/runtime/dependencies only as required by the findings.
3. Rebuild an image tagged with the exact candidate SHA, generate a content-addressed digest, and rescan it.
4. Generate image SBOM plus lockfile SBOM, provenance/in-toto attestation, checksums, and a signature if signing is available. If signing remains unavailable, obtain an explicit owner-approved exception with expiry and compensating verification.
5. Verify the pulled digest, deployed digest, image metadata, SBOM subject, provenance subject, and candidate SHA all agree.

**Acceptance:** no unapproved critical/high findings remain under the agreed policy; the immutable digest is recorded; SBOM and provenance refer to that digest; signing or an approved exception is present; and the staging deployment reports the same digest.

### F-10 — No parallel Docker Image staging workload or digest deployment is available (P0, platform/tooling blocker)

**Evidence:** the existing staging app is a healthy source build. The current Coolify tool schema supports web/worker workloads and Nixpacks/Railpack/static/Dockerfile build packs, but does not expose the required Docker Image workload creation. Tower capabilities advertise the feature, while the current callable tooling does not provide it.

**Planned resolution:** expose or enable the project-scoped Docker Image workload operation, create a distinct staging workload/domain, copy only approved non-secret environment and binding metadata, deploy the exact OCI digest, and retain the source-build app for comparison and rollback. Do not convert or delete the existing source app.

**Acceptance:** the parallel app has a distinct ID, exact digest deployment, correct environment/bindings, health/canonical identity, and a documented route-by-route comparison against the source build.

### F-11 — No hosted A-to-B-to-A rollback receipt (P0, release blocker)

**Evidence:** `config/rollback.yml:1-8` only describes stopping the current release and redeploying the last known-good artifact; its activation is pending. No two-digest staging drill exists.

**Planned resolution:**

1. Identify healthy digest A and candidate digest B.
2. Deploy A and capture health, route, monitor, and digest evidence.
3. Deploy B and capture the same evidence plus deployment duration and incident behavior.
4. Restore A by digest, not by a mutable tag, and verify the original identity and routes.
5. Record operator, timestamps, deployment IDs, digest equality, monitor results, and any rollback trigger.

**Acceptance:** A→B→A succeeds in staging with exact digest receipts and no data-loss or publication inconsistency; the procedure is usable by the named on-call owner.

### F-12 — Health reports readiness without checking the configured provider (P1, implementation bug)

**Evidence:** `apps/web/src/app/health/route.ts:15-16` returns `search.ready: true` unconditionally. `apps/web/src/lib/search.ts:14-29` marks Typesense configured based on endpoint/key configuration and describes the mode as `typesense-with-static-fallback`, but does not probe the provider. This can report readiness while the Tower collection is empty or unavailable.

**Planned resolution:** separate liveness from readiness; define a truthful provider state such as configured/available/degraded/fallback; perform a bounded non-secret readiness check or use an explicit last-known provider receipt; make the health response and evidence bundle reflect the actual mode; and add tests for configured-but-empty, configured-and-healthy, timeout/fallback, and static-only states.

**Acceptance:** `/health` never claims provider readiness solely because environment variables exist, while fallback remains available and clearly reported.

### F-13 — Health docs source count is hard-coded (P1, implementation/data-truth risk)

**Evidence:** `apps/web/src/app/health/route.ts:15` returns `docs.sourceCount: 8`, while the local docs ingest reported 14 pages. The intended meaning of “source” is not clear enough to accept the value as truthful.

**Planned resolution:** determine whether the field means source documents, published roots, or generated records; derive it from the committed docs bundle/lock metadata rather than a literal; add an assertion tying `/health` to the deployed bundle; and update release evidence to explain the metric.

**Acceptance:** the health value matches the documented metric and the exact deployed docs bundle on both local and staging checks.

### F-14 — Container verification can hang indefinitely (P1, implementation bug)

**Evidence:** `scripts/container-check.ts:34-39` awaits `execFileAsync(docker, args, ...)` with no timeout or cancellation. The audit reached `scripts/container-check.ts`'s Docker build and waited without a result; the evidence file stayed `status: running`.

**Planned resolution:** add a bounded build/inspect/run timeout, propagate cancellation, capture bounded stdout/stderr, write a deterministic `timed-out`/`failed` receipt, and attempt only scoped cleanup of the check container/process. The wrapper must not convert an interrupted build into a stale `running` artifact or leave the whole `pnpm verify` sequence hanging.

**Acceptance:** a healthy Docker build passes within the documented limit; an unavailable or stalled Docker daemon fails with an actionable receipt and returns control to the verification runner.

### F-15 — External visual evidence target is not sufficiently constrained (P1, evidence-integrity bug)

**Evidence:** `scripts/production-visual-evidence.ts:11-12` accepts `PRODUCTION_VISUAL_BASE_URL`; `:332-342` verifies release/SHA and optionally deployment, but the external target is not required to be an approved staging origin. The local visual matrix can therefore be pointed at an arbitrary HTTPS host if identity variables are supplied.

**Planned resolution:** require an explicit allowlisted staging origin for hosted visual evidence, require `DEPLOYMENT_ENV=staging` and exact deployment/digest receipt, reject production/public origins in RC mode, and include the target URL/origin and health response hash in the manifest.

**Acceptance:** every hosted capture is demonstrably from the authorized RC3 staging workload; local standalone captures remain labelled as local evidence; neither is treated as visual approval.

### F-16 — Evidence bundle can mix identities (P0, implementation/evidence-integrity bug)

**Evidence:** `scripts/evidence-bundle.ts:122-147` reads local `HEAD`, optional exact tag, local worktree state, and optional `CONTAINER_IMAGE_DIGEST` independently. It can therefore bundle a current local SHA with an older deployed digest or old staging deployment unless the caller supplies and verifies the relationship.

**Planned resolution:** make the bundle require a candidate identity manifest, verify tag→SHA, CI SHA, deployment source/digest, artifact digest, SBOM subject, and hosted health identity before marking anything verified; reject mismatches instead of merely recording them; and retain separate local/hosted evidence namespaces.

**Acceptance:** the final evidence bundle has one candidate SHA and one immutable digest with machine-checked equality across all receipts, or it is explicitly marked incomplete.

### F-17 — Local SBOM is useful inventory but not complete image/release proof (P1, supply-chain evidence gap)

**Evidence:** `scripts/sbom.ts:93-120` emits SPDX packages with `NOASSERTION` download locations and licenses, and a local namespace. It records a container digest only if an environment variable or prior container evidence supplies one. This is acceptable as a lockfile inventory but not sufficient by itself for image composition, license review, or release-subject provenance.

**Planned resolution:** retain the local SPDX/CycloneDX inventory, add the exact image SBOM generated from the pushed image, attach package/license/source metadata where available, bind every SBOM to the image digest and candidate SHA, and have the release owner approve any `NOASSERTION`/license exceptions.

**Acceptance:** both lockfile and image SBOMs are present, schema-valid, digest-bound, retained with the release, and reviewed under the agreed license/vulnerability policy.

### F-18 — Development-tool advisories remain open (P1, security disposition gap)

**Evidence:** the current scan passes production dependencies but records four development-tool advisory groups, including high-severity `tmp` and `extract-zip` findings.

**Planned resolution:** identify the dependency paths and fixed versions, upgrade or remove the affected development tools where compatible, rerun production and full audits, and document any remaining time-bounded exception with owner, rationale, scope, mitigation, and expiry. Do not lower the scanner threshold or hide development findings.

**Acceptance:** the agreed RC3 policy is met or each remaining advisory has an explicit approved exception and is absent from the runtime image.

### F-19 — RC2 reports and implementation plans have documentation drift (P1, release-evidence risk)

**Evidence:** local `config/tower-evidence.json` and several release reports describe RC2/older source and pending external work. Remote `config/tower-evidence.json` is still a pending skeleton. `AUDIT_AND_REMEDIATION_PLAN.md` contains pre-remediation claims that contradict current local passes.

**Planned resolution:** label older reports as historical/superseded, import only receipt-bound current facts, regenerate the requirements ledger and RC3 report after the final candidate is known, and ensure every “passed” row points to an artifact whose SHA/release/digest is checked.

**Acceptance:** no RC3 report contains an RC2 deployment, stale SHA, unexplained pending skeleton, or “passed” status without a directly linked receipt.

### F-20 — Current Tower MCP does not expose all operations promised by the newer platform prompt (P0/P1, platform blocker)

**Evidence:** callable tools expose registry metadata/reporting but not the requested hosted OCI build/SBOM/scan/provenance/sign operations, Docker Image workload creation, Typesense reconcile/diagnostics, release-specific SLO window, complete Forgejo CI logs, or the named Forgejo credential status operation. Capabilities advertise some of these features, but a capability declaration is not an executable receipt.

**Planned resolution:** have the platform owner expose the missing project-scoped operations or provide the approved UI/CI route. Re-run capability discovery, verify schemas, and use the narrowest available operation. If a feature remains unavailable, record it as an external blocker rather than inventing a receipt or falling back to unrestricted SSH, raw Docker, raw SQL, or secret retrieval.

**Acceptance:** every required hosted step has either a real Tower/Forgejo receipt or a clearly named owner/platform action with no false “verified” status.

## Requested evidence and approval workstream plan

The following matrix answers what Codex can execute and what must come from the owner or a qualified reviewer. “Can execute” means after the candidate, staging scope, credentials, and operation authority are explicitly available; it does not grant production or legal authority.

| Workstream                                        | Codex can execute after authorization                                                                                                                                                                                                                                         | Owner/qualified reviewer must provide or approve                                                                                                                                                                                                                                |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Visual and Lighthouse                             | Run hosted Lighthouse against the exact staging candidate; collect configured route scores, budgets, raw reports, browser smoke, RC accessibility, 13-state visual captures, hashes, target identity, and manifest; compare against an approved baseline and list deviations. | Product/design owner approves visual intent and intentional differences. Media/font rights owner confirms rights, attribution, crop, and allowed use. Human review remains required even when scores and captures pass.                                                         |
| Legal, privacy, factual, trademark, and licensing | Build a claim/asset inventory, identify source URLs and affected pages, check that copy is labelled as planned/experimental where appropriate, and package evidence for review. Codex does not provide legal advice or approval.                                              | Qualified legal/privacy/trademark/licensing reviewer signs exact scope, jurisdiction, date, approved wording, exclusions, privacy/cookie posture, project/people/funding/maintainer facts, and open-risk disposition.                                                           |
| Media and fonts                                   | Inventory every image, logo, icon, font, and generated asset; compute checksums; map each to source/license/permission/attribution/alt text/crop; generate a pending approval packet.                                                                                         | Rights holder or authorized media reviewer approves each asset and usage context. The owner supplies missing licenses, permissions, releases, attribution text, and replacement decisions.                                                                                      |
| Provider credentials                              | Inspect non-secret binding metadata, validate names and target IDs, run safe staging probes, verify key separation and redaction, rotate only when explicitly requested, and record correlation IDs.                                                                          | Owner/platform provisions and authorizes Forgejo, Typesense, Valkey, GlitchTip, S3, and Kit credentials; confirms scopes, rotation owner, expiry, privacy-approved test data, and secret names. Secret values must never be placed in the repository or returned in the report. |
| Repository and release authority                  | Inspect local/remote identity, prepare a bounded candidate push/tag/release plan, verify branch/tag SHA, inspect CI, and generate a release receipt.                                                                                                                          | Owner approves contents, branch protection, reviewer/PR policy, private Forgejo destination, tag/signing authority, release notes, and any public repository URL. Public GitHub remains out of scope.                                                                           |
| DNS/TLS/canonical domain                          | Probe the approved staging hostname, inspect certificate/redirect/canonical/feed consistency, and record non-secret TLS observations.                                                                                                                                         | DNS/TLS owner approves records, certificate chain/renewal, HSTS posture, canonical production domain, redirects, and production publication. Codex must not alter production DNS or TLS here.                                                                                   |
| Tower/Coolify staging                             | Validate manifest, reconcile staging variables/bindings, deploy source or immutable image to an approved staging workload, inspect health/logs/deployments, and preserve deployment IDs.                                                                                      | Owner/platform grants project-scoped staging/deployment authority and approves creating a parallel workload/domain. Production deployment is not authorized by this plan.                                                                                                       |
| Monitoring and SLO                                | Create/reconcile route-specific staging monitors when the tool is available, read them back, run bounded probes, collect latency/status, define a release-specific evidence window, and generate a monitor/SLO report.                                                        | Owner names the on-call, alert channels, escalation policy, SLO target/window, maintenance/warm-up treatment, and production monitoring authority. Historical incidents must not be erased.                                                                                     |
| Rollback                                          | Execute the approved staging A→B→A digest drill, verify health/routes/identity after each transition, and capture deployment IDs/durations/digests.                                                                                                                           | Owner authorizes rollback, identifies last-known-good A, confirms data/publication safety, and accepts the runbook. Production rollback authority remains with the owner.                                                                                                       |
| SBOM and supply chain                             | Generate lockfile/image SBOMs, reconcile image digest, collect scanner results, validate provenance/checksums, and use signing if the platform exposes it.                                                                                                                    | Platform owner enables or supplies the hosted build/scanner/provenance/signing path; security owner approves thresholds and any exception; release owner approves the subject/digest.                                                                                           |
| Publication and feeds                             | Run staging publication checks for HTML, canonical metadata, RSS, Atom, JSON Feed, sitemap, robots, `llms`, projects JSON, and search; compare as-of date and feed destinations; report content hashes/status.                                                                | Publication/editorial owner approves as-of date, release visibility, corrections process, syndication destinations, feed consumers, and final copy. Production publication is not authorized here.                                                                              |

## Owner action packets

These are the exact inputs needed from the owner. They are intentionally written so they can be returned without sharing secret values.

### 1. Qualified legal, factual, and media approval packet

**Purpose:** establish accountable approval for public claims, personal/institutional facts, trademarks, licenses, privacy wording, and media/font use. Automated tests cannot substitute for this review.

Provide one record per review scope with:

```text
approvalId:
reviewerName:
reviewerRoleOrQualification:
organization:
jurisdictionOrReviewStandard:
reviewedCommitOrContentHash:
reviewedReleaseId:
pagesOrAssetManifest:
exactApprovedCopyOrScope:
approvedClaimsAndSources:
requiredAttribution:
exclusionsOrRequiredChanges:
privacyCookieTrackingDecision:
trademarkDecision:
mediaFontRightsDecision:
decision: approved | approved-with-exceptions | rejected
exceptionsAndExpiry:
reviewedAtUtc:
signatureOrInternalApprovalReference:
```

Required steps:

1. Assign a qualified reviewer for legal/privacy/trademark/licensing matters and a factual/editorial reviewer for project, people, funding, maintainer, maturity, health, and publication claims.
2. Review the exact candidate content, not a general repository description.
3. Review every image, logo, icon, generated visual, and font against its source, license, permission, attribution, crop, and alt text.
4. Mark claims that must remain planned, experimental, or unreleased; do not allow a UI status label to imply a factual endorsement.
5. Return approval IDs and exceptions. Codex can attach them to the evidence bundle but cannot invent, sign, or approve them.

### 2. Provider credential and privacy packet

**Purpose:** let Codex verify staging behavior without exposing or guessing credentials.

Provide only non-secret metadata:

```text
provider:
environment: staging
resourceIdOrProjectId:
endpointOrigin:
collectionOrQueueOrProject:
secretBindingNames:
requiredScopeSummary:
testDataPolicy:
rotationOwner:
expiryOrRotationDate:
approvedProbeWindowUtc:
approvalReference:
```

Required provider-specific decisions:

1. **Forgejo:** repair the current binding that lacks the required `read:user` scope; confirm repository read/write, Actions inspection/rerun, branch, and tag permissions. Do not paste a token into this file or chat.
2. **Typesense:** confirm whether the authoritative collection is `search_records` or `tower_paper-and-slate-web_search`; confirm separate write/search keys and the approved staging indexing operation.
3. **Valkey:** approve a synthetic, non-PII test procedure for rate limits, idempotency, TTL, and failure behavior across multiple instances.
4. **GlitchTip:** approve one labelled RC3 synthetic event and the policy for the existing issue `PAPER-AND-SLATE-WEB-1`.
5. **S3/registry:** confirm the project-scoped bucket/repository and retention policy; never disclose access keys in evidence.
6. **Kit:** state whether it remains disabled for RC3 or supply a privacy-approved test recipient/provider procedure. No real subscriber delivery is assumed.

Codex can inspect binding health, run the authorized probes, redact output, and record secret names/IDs. The owner/platform must provision, scope, rotate, and revoke credentials.

### 3. Repository, DNS/TLS, and deployment authority packet

**Purpose:** establish who may mutate each external system and prevent an RC3 operation from crossing into production.

Return:

```text
forgejoRepository: callum/paperandslate-web
allowedBranch:
allowedPushScope:
pullRequestOrReviewerRequirement:
allowedTag: v1.0.0-rc.3
tagSigningAuthority:
releaseNotesApprover:
stagingCoolifyApplicationId: ngqtewtqeqhj88v1005a38va
parallelStagingWorkloadApproved: yes | no
stagingHostname:
stagingTlsOwner:
productionDomain: deferred | approved-for-later
productionDnsChange: not-authorized-in-this-plan
productionDeployment: not-authorized-in-this-plan
authorityApprover:
approvalReference:
```

Required steps:

1. Confirm the exact candidate contents and branch protection before the first push.
2. Confirm that `git.tower`/Forgejo is the private destination; do not add or publish a public GitHub remote.
3. Confirm staging hostname and TLS ownership. A staging certificate/probe does not grant production DNS authority.
4. Approve a distinct parallel Docker Image staging workload if the platform exposes it; do not convert or delete the current source-build app.
5. Reserve production DNS, production deployment, and final `v1.0.0` for a later explicit authorization.

Codex can perform scoped repository/Tower inspection and, after approval, the staged push/deploy/verification sequence. The owner controls authority boundaries and all production decisions.

### 4. Monitoring, SLO, rollback, and on-call packet

**Purpose:** prove that RC3 can be observed and safely reversed without erasing historical incidents.

Return:

```text
onCallOwner:
escalationChannel:
releaseSloWindowStartUtc:
releaseSloWindowDuration:
availabilityTargetPercent: 99
latencyP95TargetMs: 2000
warmupTreatment:
routeMonitorApproval:
lastKnownGoodDigestA:
candidateDigestB:
rollbackApprover:
dataAndPublicationSafetyDecision:
approvalReference:
```

Required steps:

1. Approve the six route-specific monitor definitions and expected status/content behavior.
2. Preserve the historical 24-hour degraded SLO result and open/annotate any incident according to policy.
3. Start a fresh RC3 window only after corrected monitors and the exact candidate are deployed.
4. Authorize the A→B→A staging drill and name the operator who can restore A.
5. Confirm what must be checked after rollback: health identity, canonical origin, search mode, feeds, docs, logs, and digest.

Codex can execute the staging evidence and rollback drill once the two digests and authority are supplied. The owner defines the SLO, on-call, incident, and production rollback policy.

### 5. SBOM, vulnerability, provenance, and signing packet

**Purpose:** bind the artifact contents and build process to the exact release identity.

Return:

```text
approvedRegistryRepository: paper-and-slate-web
allowedImageTagPattern: sha-<full-candidate-sha>
criticalFindingPolicy:
highFindingPolicy:
approvedExceptionIds:
exceptionExpiryDates:
sbomFormatsRequired: CycloneDX | SPDX | both
provenanceFormat:
signingProviderOrKeyReference:
signatureRequired: yes | approved-exception
attestationRetention:
securityApprover:
approvalReference:
```

Required steps:

1. Enable the hosted OCI build/scan/SBOM/provenance route or identify the exact Forgejo workflow that produces equivalent receipts.
2. Ensure the final image is scanned, not only the lockfile.
3. Bind image digest, SBOM subject, provenance subject, signature/exception, candidate SHA, and staging deployment digest.
4. Resolve or document every critical/high finding and every development-tool advisory under the approved policy.

Codex can perform structured reconciliation and generate reports. The platform/security/release owners control scanner policy, signing keys, and exceptions.

### 6. Publication and feed validation packet

**Purpose:** prove that the exact approved content is published with the correct canonical origin, publication clock, and syndication behavior.

Return:

```text
publicationOwner:
approvedReleaseId:
publicationAsOfUtc:
approvedStagingOrigin:
approvedCanonicalProductionOrigin: deferred | supplied-later
approvedFeedDestinations:
approvedSyndicationDestinations:
correctionsWorkflowReference:
feedConsumerOrSubscriberReview:
copyApprovalReference:
```

Required steps:

1. Approve which projects, documents, news/RFC/decision/policy/report records are public at RC3.
2. Approve `PUBLICATION_AS_OF` and verify the date is not a stale hard-coded CI value.
3. Validate RSS, Atom, JSON Feed, sitemap, robots, `llms`, projects JSON, canonical tags, metadata, and search against the staging origin.
4. Confirm feed item count, IDs, timestamps, links, content types, and no localhost references.
5. Approve the correction/retraction process and any syndication destination before public publication.

Codex can run and hash all staging publication/feed checks. The publication owner must approve content, destination, corrections, and eventual production release.

## Dependency-ordered RC3 closure plan

This is the sequence to use after the owner supplies the packets above. Each phase stops on a failed acceptance criterion; later phases must not be represented as passed.

### Phase 0 — Freeze and select the candidate

- Preserve incoming standards changes and existing unrelated work.
- Decide whether the three local documentation commits and the standards changes belong in the RC3 tree.
- Produce one clean, intentional candidate tree and record its full SHA.
- Confirm RC1 remains unchanged and that no RC2/RC3 tag is being moved.

### Phase 1 — Repair authority and obtain exact CI evidence

- Repair/replace the Forgejo credential binding with least privilege and required diagnostic/repository scope.
- Push the approved branch through the private Forgejo destination.
- Inspect full logs for the failed source runs; classify platform versus repository cause.
- Apply only a confirmed repository workflow fix if needed, then rerun all required workflows on the exact candidate SHA.
- Retain complete logs and artifacts, including failure evidence where relevant.

### Phase 2 — Validate the staging contract and source candidate

- Validate the environment contract without returning secret values.
- Deploy the exact candidate source to the existing staging app only through the approved Tower path, or keep it as the comparison workload when the image path is ready.
- Verify health identity, docs identity, canonical metadata, security headers, feeds, and publication date.

### Phase 3 — Reconcile provider behavior

- Reconcile Typesense collection/index names and keys.
- Index candidate records and test search success, facets, visibility, aliases, ranking, and static fallback.
- Exercise Valkey-backed newsletter limits/idempotency across instances using approved synthetic data.
- Send and verify one RC3-labelled GlitchTip event; preserve and disposition prior synthetic history.
- Correct health/readiness semantics in a future implementation change and add regression tests before accepting provider readiness.

### Phase 4 — Produce and qualify the immutable artifact

- Resolve the OCI tool exposure gap or use the approved CI route.
- Remediate the prior image's critical/high findings and remaining policy exceptions.
- Build, push, scan, generate image/lockfile SBOMs, provenance, checksums, and signing/exception evidence for the exact SHA.
- Verify the digest is immutable and pullable.

### Phase 5 — Deploy the parallel Docker Image staging workload

- Create a distinct Coolify Docker Image workload once the current tool supports it.
- Bind the approved staging variables and provider resources.
- Deploy by digest, not a mutable tag.
- Verify app health, route behavior, canonical/publication identity, logs, and deployed-digest equality.

### Phase 6 — Run hosted acceptance and visual evidence

- Run hosted Lighthouse for the configured six routes and record each performance/accessibility/best-practices/SEO score and budget result.
- Run hosted browser smoke and accessibility checks against the image workload.
- Capture the 13-state visual matrix, compare with the approved reference, and retain screenshot hashes.
- Run publication/feed validation on the exact image workload.
- Obtain the visual, rights, legal, factual, and publication approvals; do not convert machine pass to human approval.

### Phase 7 — Correct monitoring and complete the staging rollback drill

- Materialize route-specific monitor paths and read them back.
- Start the release-specific SLO window and preserve the historical degraded window.
- Execute A→B→A with two immutable digests.
- Capture deployment IDs, monitor IDs, SLO window, latency/availability, rollback duration, and post-rollback identity.

### Phase 8 — Reconcile evidence and create RC3

- Import only current Tower/Forgejo/Coolify/registry/GlitchTip receipts.
- Generate the requirements ledger, evidence bundle, implementation report, and RC3 closure report from one candidate manifest.
- Mark incomplete, external, and human-gated requirements accurately.
- After all RC3 acceptance criteria pass and the owner confirms tag authority, create `v1.0.0-rc.3` exactly once at the verified SHA.
- Do not deploy production, change production DNS, publish public GitHub, or create final `v1.0.0` under this plan.

## Final RC3 evidence manifest requirements

The final machine-readable record should contain, at minimum:

```text
releaseTag: v1.0.0-rc.3
candidateSha: <40-character Forgejo SHA>
branch: release/v1-closure
forgejoCiRunIds: [ ... ]
towerController: 4.12.0 / fc8efdcf1c168785acd5b51fe2b611c58a5f5090
towerPlugin: 0.18.0 / 78cf343b808666b33bbdcef09aee7743873cfc80
forgejoVersion: 16.0.3+gitea-1.22.0
runnerVersion: 13.0.0
sourceStagingCoolifyApplicationId: ngqtewtqeqhj88v1005a38va
imageStagingCoolifyApplicationId: <parallel-workload-id>
sourceDeploymentId: <id>
imageDeploymentId: <id>
stagingOrigin: https://paper-and-slate-web.dev.tower
healthIdentity: <release/git/deployment response hash>
typesenseResourceId: 5d04e4b6-1126-42a3-bdc7-b26bb4183cb7
typesenseCollection: <approved authoritative collection>
typesenseIndexedRecordCount: <count>
valkeyResourceId: 0975390e-a0df-4b12-b76c-ca285c474502
glitchtipProjectId: 2
glitchtipRc3EventId: <id>
monitorIds: [ ... six route-specific IDs ... ]
releaseSpecificSloWindow: <start/end/thresholds/result>
lighthouseReports: <per-route score matrix and report hashes>
browserAccessibilityVisualReports: <artifact paths and hashes>
ociTag: sha-<candidate-sha>
ociDigest: sha256:<immutable-digest>
deployedDigest: sha256:<same-digest>
vulnerabilityBeforeAfter: <scanner version/counts/policy>
sbom: <CycloneDX/SPDX artifact subjects and hashes>
provenance: <attestation subject and hash>
signing: <signature or approved exception>
rollback: <A digest, B digest, A restored, IDs, durations, result>
publication: <as-of/date/feed/sitemap/canonical evidence>
humanApprovals: <approval IDs and scopes>
```

The record must fail closed when any identity, digest, approval, or required receipt is missing. A local green check, a healthy older source deployment, or a platform capability declaration is not a substitute for the exact receipt.

## RC3 stop conditions

Do not claim RC3 closed if any of the following remains true:

- the exact candidate SHA is not on the approved private Forgejo branch;
- exact-candidate CI is not green with complete logs and artifacts;
- the staging contract or health identity is missing or mismatched;
- Typesense has not been indexed and behavior-tested, or fallback/readiness semantics are unclear;
- Valkey application behavior is untested where required by the acceptance bar;
- no exact RC3 GlitchTip event and synthetic-history decision exists;
- critical/high image findings are unremediated or unapproved, or the deployed digest is not equal to the reported digest;
- no route-specific monitor read-back, release SLO window, or A→B→A staging rollback receipt exists;
- evidence is mixed across RC1, RC2, local, source-build, and image identities;
- qualified legal/factual/media/publication approvals are absent.

## Explicit non-claims

This plan does not claim that the site is production-ready, legally approved, factually approved, media-cleared, publicly published, signed, deployed by immutable digest, or safe to release as final `v1.0.0`. It records what is locally implemented, what is externally observed, what is broken or ambiguous, and what Codex or the owner must do next.

## RC3 execution addendum

The plan above was originally written as an audit-only handoff. The subsequent, explicitly authorized RC3 execution has now produced the following additional evidence and findings; the original audit snapshot is retained for provenance and is not silently rewritten.

- The intended standards and release-evidence tree was pushed to the private Forgejo `release/v1-closure` branch at `c0c0b5d28642a57442adfd2d53d6b0ddddd53c09`. RC1 remains unchanged at `031b5447786f9c619288c9044bb5bc65319a30d7`; no RC2, RC3, or final tag was created.
- Staging non-secret variables for the candidate identity and Typesense endpoint/collection/index reconciled healthy to Coolify application `ngqtewtqeqhj88v1005a38va` at `https://paper-and-slate-web.dev.tower`. Secret values were not read or exposed.
- A source-build staging deployment pinned to `c0c0b5d28642a57442adfd2d53d6b0ddddd53c09` was queued as `lftxn28cksvcf76etxz6b6s7`. The last available receipt observed it in `in_progress` at `image-build`/`deployment`; subsequent Tower status calls timed out or returned 502, so candidate health and completion are not claimed.
- Exact-candidate Forgejo run 64/container failed at the repository `container:check` step because the container health endpoint did not become ready. The new diagnostic behavior is intended to expose bounded container state/logs on the next run; it is not yet a fix for the underlying runtime cause.
- Exact-candidate Forgejo run 65/Lighthouse failed because Playwright-installed Chromium was not discoverable by Lighthouse's Chrome launcher. Local fixes in commits `34f06c39b766bb49d913d0b28ae578d540d4afe1` and `40283820b568613e6c9df84196588063f9105344` add browser-path propagation and container-failure diagnostics, but Forgejo DNS was unavailable when the follow-up push was attempted. These commits remain local and must not be treated as remote candidate evidence.
- Exact-candidate Forgejo run 66/quality was still waiting at the last successful CI read. The candidate CI set is therefore not green.
- The local 12-test standards API/concepts/downloads/methodology browser slice passed, and the local Lighthouse wrapper produced 12 reports across six routes with configured assertions passing. These are local receipts only and do not replace hosted staging evidence.

The next safe action is to restore the private Forgejo/Tower endpoint, push the two local follow-up commits as one auditable branch update, then repeat exact-SHA CI and staging checks. Do not create `v1.0.0-rc.3` until the stop conditions above are satisfied.
