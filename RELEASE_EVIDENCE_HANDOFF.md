# Paper & Slate release-evidence handoff

Date: 2026-08-28
Status: RC3 execution is incomplete; closure still requires passing exact-candidate CI, completed staging identity, provider/SLO/rollback evidence, hosted artifact identity, and owner/qualified-reviewer decisions
Related audit: [`AUDIT_VERIFICATION_REPORT.md`](AUDIT_VERIFICATION_REPORT.md)

This file is the current action list for work that cannot be truthfully completed from the local workspace alone. It states the purpose, the exact owner/reviewer action, the evidence to return, and what Codex can do after that evidence or authority exists.

Never put passwords, API keys, private keys, personal data, legal contracts, or provider secret values in Git, Markdown, screenshots, or chat. Place secrets in the approved secret manager and provide only secret names and non-secret identifiers.

## How to use this handoff

1. Assign a named owner or role for every section.
2. Return the requested decision, approval ID, ticket, source, or non-secret identifier.
3. Mark anything intentionally deferred as deferred with an owner and next-review date; do not mark it complete.
4. Ask Codex to execute only the specifically authorized local, repository, provider, staging, or production actions.

Codex can inventory, draft, automate, validate, capture, compare, and assemble evidence. Codex cannot grant legal/factual/media approval, invent organizational facts, create authority, choose a provider policy on the owner's behalf, or silently perform production-impacting mutations.

## Current RC3 execution update

As of the latest local repository read on 2026-08-28 UTC, the current exact repository candidate and branch relationship are recorded in `.generated/launch/repository-identity.json` and `.generated/requirements/traceability-check.json`; no push was made by this task. RC1 remains immutable at `031b5447786f9c619288c9044bb5bc65319a30d7`; no RC3/final tag, production deployment, production DNS change, or public GitHub publication was made. Exact Forgejo runs 61/container, 62/Lighthouse, and 63/quality failed for the older `06491dc…` source, while later remote dispatches 64–69 for `dc6d78a…` were rejected before runner assignment. No hosted CI evidence exists for the current local repository candidate. Staging deployment `b4c1jatqaidljtcpc4nly1yp` is also for `06491dc…` and remains a direct source-build deployment with no immutable image digest; its provider and SLO receipts are not current-candidate evidence.

The live Tower capability report was controller `4.12.0` with recommended plugin `0.18.0`. It exposes provider-contract, artifact-inventory, deployment, monitor, SLO, and bounded observability operations, but reports Forgejo rerun unavailable and signing not controller-managed. The prompt-referenced Tower handoff files are not present in this checkout; the detailed, current execution findings and owner packets are in [`RC3_REMEDIATION_AND_OWNER_ACTION_PLAN.md`](RC3_REMEDIATION_AND_OWNER_ACTION_PLAN.md).

## Historical RC2 closure snapshot

This snapshot supersedes earlier execution notes in this handoff where they mention the old follow-up deployment, rejected canonical configuration, or earlier CI run numbers. The selected candidate source is `7aaa9b45ba0b6264d089eb530ecfd471a8e2008b` on `release/v1-closure`, deployed as `v1.0.0-rc.2` in Coolify deployment `zzpooecepztro4urk5sx6obv` for application `ngqtewtqeqhj88v1005a38va`. Staging `/health` reports the exact SHA, `releaseId=v1.0.0-rc.2`, and `deployment=staging` at `https://paper-and-slate-web.dev.tower`.

Exact-SHA staging publication passed 12 routes and RSS/Atom/JSON Feed validation; hosted Lighthouse passed 12 reports across six routes; and visual capture produced 13 states with no runtime errors but remains human-review-pending. Latest exact-SHA Forgejo runs 25–27 failed and exposed no task-level jobs through Tower. Tower resource roundtrips for S3, Typesense, and Valkey pass, but Typesense is empty/static-fallback, app-level Valkey and final exact-SHA GlitchTip evidence are open, and Kit is disabled pending an owner decision. Fresh monitor probes pass, while the historical SLO window is degraded and monitor route materialization needs controller review. The private registry is empty, so OCI/SBOM/provenance/signature and A→B→A rollback are not claimed. RC1 remains immutable at `031b5447786f9c619288c9044bb5bc65319a30d7`; no final tag, production, production DNS/TLS, public GitHub, authentication, API, or platform integration was performed.

Historical RC2 non-secret state: a private Forgejo repository exists at `https://git.tower/callum/paperandslate-web.git`. Immutable tag `v1.0.0-rc.1` remains at `031b5447786f9c619288c9044bb5bc65319a30d7`; candidate source `7aaa9b45ba0b6264d089eb530ecfd471a8e2008b` was deployed in staging as `v1.0.0-rc.2` at deployment `zzpooecepztro4urk5sx6obv`. The managed HTTPS canonical staging output, publication routes, feeds, and hosted Lighthouse pass for that historical candidate. No passing Forgejo CI task receipt, hosted OCI image/SBOM/provenance/signature, complete provider acceptance, release-specific SLO, A→B→A rollback drill, qualified approval, production action, DNS/TLS change, public GitHub publication, or final release tag was claimed for that snapshot.

## Immediate closure actions

These are the exact current actions, in dependency order. Each item states who must supply the missing authority and what Codex can do afterward.

1. **Resolve exact-SHA private CI (owner/operator):** restore a runner and dispatch the workflows for the current repository candidate after any intended source update is deliberately published. Historical runs 61–63 for `06491dc…` and pre-run dispatches 64–69 for `dc6d78a…` are not current-candidate evidence. Inspect complete task/job logs and artifacts, classify any failure, and make the smallest approved repair. Do not treat an unavailable or pre-run receipt as passing evidence.
2. **Complete or defer providers (owner/provider operator):** decide Typesense indexing/alias/ranking/facets/preview scope, app-level Valkey tests, exact-SHA GlitchTip event, and Kit activation/privacy. Codex can run authorized scoped tests without receiving secret values.
3. **Create hosted release identity (release/operator):** publish the reviewed current source to the private immutable OCI registry, generate image and lockfile SBOMs, record provenance/signature/scan results, and verify deployed digest equality. The current registry has no image for the current repository candidate, and Coolify is direct-build. Keep RC1 immutable and do not tag RC3 until technical gates pass.
4. **Close monitoring and rollback (security/operations owner):** approve a release-specific SLO window, resolve the monitor-path/controller advisory, and authorize two healthy immutable staging deployments for A→B→A. Codex can run the bounded drill after both digests exist.
5. **Complete human/publication gates (qualified reviewers and owner):** return legal/privacy/licensing/trademark, factual/institutional/people/project/funding, visual-deviation, media/font-rights, publication, and feed/syndication approvals. Codex can reconcile approved IDs and rerun checks; it cannot grant them.
6. **Tag only after closure (release owner):** authorize the immutable `v1.0.0-rc.3` tag at the verified candidate SHA only after CI, artifact, provider, monitoring, rollback, and human gates pass. Do not create final `v1.0.0` in this task.

## 1. Appoint accountable reviewers

Purpose: make every public claim and release decision attributable.

Owner steps:

- Name the product/scope owner who can approve copy, visual deviations, and launch.
- Name legal/privacy counsel and the jurisdictions/audiences covered.
- Name the trademark/brand-rights owner.
- Name the factual reviewer for mission, organization, people, projects, maturity/health, adoption, roadmap, funding, and dates.
- Name the media/font rights reviewer.
- Name the security/operations and rollback approver.
- Name the release/publication owner.

Return: role or person identifier, approval scope, ticket/system of record, and review/expiry date. Public names must not be published until separately approved.

After receipt, Codex can generate claim registers, review packets, approval gates, and a release manifest that references approval IDs without copying confidential material.

## 2. Legal, privacy, licensing, and trademark approval

Purpose: ensure public legal text and organizational descriptions are accurate, jurisdiction-aware, and consistent with actual processing.

Owner/qualified-reviewer steps:

1. Confirm the operating entity, jurisdiction, public contact channel, and the approved description. The current plan wording is that Paper & Slate is an open education initiative of Glasscow LLC; do not describe it as a separately incorporated nonprofit, charity, foundation, educational institution, standards authority, accreditation body, or government entity unless counsel supplies and approves a different fact.
2. Review Privacy, Terms, Security, Accessibility, Code of Conduct, contribution, conflicts, license, and trademark pages.
3. Review actual use of hosting/CDN logs, search, newsletter, error monitoring, cookies, analytics, fonts, images, embeds, and any provider subprocessors.
4. Approve lawful basis/consent, retention, deletion/DSAR, international transfers, age-related requirements, breach contacts, and provider disclosures as applicable.
5. Approve code/documentation licenses, NOTICE/attribution obligations, contributor terms, and CLA/DCO policy.
6. Approve name/logo/mark usage and any education/interoperability claims.

Return: approved text or redline, reviewer and jurisdiction, approval/ticket ID, effective and next-review dates, required provider disclosures, and license/trademark authority statement.

After receipt, Codex can apply approved text in a later authorized change, scan the built artifact for superseded/placeholder wording, and attach the legal approval IDs to release evidence.

## 3. Factual, institutional, people, project, and funding approval

Purpose: prevent invented people, maintainers, releases, adoption, funding, institutional status, or roadmap claims.

Owner/reviewer steps:

1. Approve mission, principles, audience, public-benefit, governance, and interoperability wording.
2. Supply authoritative sources for organization and institutional claims.
3. Approve each maintainer/person name, role, bio, profile link, photo/consent, or a role-only presentation.
4. For each project approve maturity, health, version, repository, documentation source, maintainers, license, meaningful update date, dependencies, compatibility, adoption, and roadmap statements.
5. Approve RFCs, decisions, policies, releases, reports, news facts, dates, corrections, and supersession relationships.
6. Approve funding/sponsor/donor wording, amounts or ranges, restrictions, disclosures, or a truthful no-public-data state.

Return: a claim register with claim ID, exact approved wording/value, source, reviewer, approval date, review date, and public/private classification.

After receipt, Codex can reconcile content models, metadata, search/feed/sitemap exposure, and tests against the register and flag unsupported claims.

## 4. Media and font rights approval

Purpose: establish that every public visual and font is permitted, attributable, accessible, and appropriate for its crop/context.

Owner/rights-reviewer steps:

1. Inventory logos, supplied media, generated concepts, mockup-derived assets, icons, and fonts.
2. For each asset record creator/source, checksum, creation date, license/permission, modification/commercial/publication rights, attribution, restrictions, and intended channels.
3. Confirm generated-asset provenance and whether public/commercial use is allowed.
4. Confirm releases or removal for identifiable people, institutions, documents, or personal data.
5. Approve crop/focal point, light/dark variant, alt text, decorative status, caption/credit, and replacement schedule.
6. Confirm font family/weight source, web-embedding/subsetting rights, and fallback policy.
7. Mark each item `approved`, `rejected`, or `needs replacement` and sign/date the register.

Return: rights register, permissions/licenses, attribution text, approved alt text, and exact approved checksums.

After receipt, Codex can verify asset checksums, metadata, image loading, contrast, alt text, attribution, and absence of unapproved assets in the release artifact. Current captures still contain rights-review-pending media and therefore are not publication approval.

## 5. Provider accounts and credentials

Purpose: supply external state and least-privilege secrets without exposing credentials.

### Typesense

Owner steps:

- Choose provider, region, plan, billing, residency, retention, and preview/production separation.
- Create or authorize production/preview collections and aliases.
- Create separate least-privilege indexing/admin and search-only credentials.
- Store them in the approved secret manager under agreed names.
- Return endpoint, non-secret collection/alias names, rotation owner, and test-index policy.

Codex can configure schemas/indexing, deterministic records, alias/build IDs, search-only client use, preview isolation, latency and outage checks, static fallback, and index rollback after access is authorized.

Evidence: redacted schema/config receipt, collection/alias IDs, indexed count/build ID, latency samples, key-scope result, fallback/outage test, and rollback result.

### Kit newsletter

Owner steps:

- Approve Kit as processor and complete privacy/DPA review.
- Create the list/form and custom consent fields.
- Create a server-only least-privilege credential and store it in the secret manager.
- Return non-secret form ID, sender/confirmation policy, unsubscribe behavior, test recipient, retention, and deletion rules.

Codex can integrate the adapter, test disabled/unconfigured/success/duplicate/provider-failure paths, verify consent payloads and idempotency, and produce redacted delivery evidence. A real test subscription requires owner approval and an approved test address.

### GlitchTip or selected observability provider

Owner steps:

- Choose region, retention, sampling, PII policy, billing, and alert destinations.
- Create staging/production projects and provide DSN secret names.
- Define release/environment naming, on-call roles, and test-event approval.

Codex can configure release markers/source maps, safe server/client capture, PII scrubbing, alert routes, and a labeled synthetic event after access exists.

### Infisical or selected secret manager

Owner steps:

- Create development, preview, staging, and production environments.
- Grant workload identities and human roles with least privilege.
- Define secret names, rotation schedule, break-glass owner, and audit retention.

Codex can map names to runtime configuration, verify injection and rotation without reading values, scan logs/artifacts for leakage, and record access-policy IDs.

Required return for all providers: provider/project/region identifiers, non-secret names, environment, retention/privacy decision, credential secret names, rotation owner, and explicit test authority. Never return secret values.

## 6. Repository and release authority

Purpose: create a verifiable source identity, review path, and protected release process.

Current state: the private Forgejo remote is `https://git.tower/callum/paperandslate-web.git`; immutable RC1 remains `v1.0.0-rc.1` at `031b544...`, while the selected untagged staging candidate is `7aaa9b4...` on `release/v1-closure`. There is no protected branch/PR receipt, verified release signature, passing exact-SHA CI receipt, or hosted release-artifact receipt. Do not move RC1; authorize `v1.0.0-rc.2` only after the remaining gates are accepted.

Owner steps:

1. Choose the canonical repository host, organization/account, repository name, visibility, owner team, and billing owner. The current RC plan identifies Forgejo as the intended canonical RC host; GitHub/public production remains a deferred decision.
2. Decide whether to preserve/import history or create a new initial commit.
3. Approve default branch, merge method, branch protection, required reviewers/checks, CODEOWNERS, signed commit/tag policy, secret scanning, and release permissions.
4. Explicitly authorize each action Codex may take: initialize, create remote, add remote, commit, push, create branch, open PR, configure settings, create tag, publish release. Repository access is not automatically production-deployment authority.
5. Approve the public repository URL used in project records and pages.

Return: canonical URL, authority statement, team/role IDs, branch/release policy, and an exact allowed-action list.

After receipt, Codex can configure the authorized source/review workflow, configure CI/CODEOWNERS, produce a new commit/tag/PR receipt, and bind release evidence to the source SHA. The private repository, RC1 tag, follow-up branch push, and current branch commit receipt were authorized and completed; protected review, signature verification, passing CI, and any new RC tag still require the release owner's exact authorization.

## 7. DNS, TLS, and canonical URL authority

Purpose: establish secure, stable public identity and avoid an unreviewed domain cutover.

Owner steps:

1. Confirm production domain, canonical host (`www` or apex), staging/preview hosts, and redirect policy.
2. Identify registrar/DNS owner and either grant narrowly scoped access or choose owner-operated record changes.
3. Approve A/AAAA/CNAME/TXT/CAA records, TTLs, DNSSEC, and mail-related records.
4. Approve certificate issuer/renewal, minimum TLS, CAA, HSTS preload decision, and expiry incident owner.
5. Define cutover window, rollback TTL, propagation window, and downtime tolerance.
6. State explicitly whether Codex may edit DNS/TLS or must provide a change set for the owner to apply.

Return: domain ownership confirmation, approved records, authority scope, change window, and post-change export/screenshots.

After receipt, Codex can validate propagation from multiple resolvers, HTTPS redirects, certificate chain/expiry/renewal, CAA, protocols, security headers, canonical URLs, and cookies.

## 8. Tower/Coolify and deployment authority

Purpose: deploy a reviewed immutable artifact to the correct environment with attributable approvals.

Historical RC2 Tower/Coolify state: `.tower/project.yaml` and `infrastructure/tower/intent.yaml` describe staging only. Coolify application `ngqtewtqeqhj88v1005a38va` and deployment `zzpooecepztro4urk5sx6obv` were healthy on candidate `7aaa9b4...`; exact staging route/feed/publication and hosted Lighthouse checks passed for that historical candidate. The deployment was a direct Coolify build, so the private registry had no corresponding hosted image digest/SBOM receipt. Typesense was empty/static-fallback, app-level Valkey and final exact-SHA GlitchTip evidence remained open, and the required release-specific SLO and A→B→A rollback drill remained pending.

Owner steps:

- Identify exact Tower/Coolify instance, organization/project, server/cluster, network, registry, and application. For this task, the known non-secret target is the Tower Development project `rggf2bl4tdww50yu6h58czg2`, staging environment `l56i154xmd5r4ywgc9ez2ce3`, and staging target `tower-staging`; re-check these values before mutation.
- Approve staging/production separation, limits, replicas, health checks, storage, log destination, and secret injection.
- Define preview/staging/production promotion rules and immutable digest requirement.
- Define deployment window, approver, smoke tests, stop criteria, maintenance notice, and rollback threshold.
- Grant narrowly scoped access or designate an operator for owner-run commands.
- Explicitly authorize each staging or production mutation; the reviewed `.tower/project.yaml` is intent/configuration, not activation.

Return: target identifiers, role/access confirmation, approved environment contract, window, approver, and exact allowed mutations.

After receipt, Codex can validate the Tower manifest, plan/reconcile resources, configure the approved native environment variables, bind approved secret names, deploy to authorized staging, run acceptance, record deployment IDs, and promote the identical digest only when separately approved. Production deployment is outside the current authorization. The current deployment proves staging availability, not release closure, because canonical URL configuration, provider credentials, CI, hosted artifact identity, and rollback evidence remain open.

## 9. Monitoring, incident response, and rollback

Purpose: prove the service can be observed and recovered, not merely deployed.

Owner steps:

1. Approve SLOs for availability, error rate, latency, search, newsletter, feeds, and certificate expiry.
2. Define on-call owner, alert destinations, escalation/acknowledgement targets, incident severity, and public status policy.
3. Approve log/metric/error retention, PII scrubbing, access controls, and deletion process.
4. Select the last-known-good artifact and maximum rollback/data-inconsistency window.
5. Approve a staging rollback drill and a separately scheduled production drill with expected impact.
6. Identify who may trigger rollback and who confirms restoration.

Current state: all six staging monitors have fresh healthy probes, but the available SLO is a degraded historical 24-hour window (synthetic availability about 63.5% against a 99% target), not a release-specific clean window. The first RC1 Coolify deployment automatically rolled back when its image lacked `curl`/`wget`; subsequent staging deployments include `curl` and are healthy. The monitor listing also needs controller review because multiple paths appeared as `/`. Return: SLO/alert policy, role aliases, privacy settings, monitor IDs/destinations, drill window, known-good release, rollback authority, and incident template.

After receipt, Codex can configure health/route/feed/search/newsletter/certificate/error monitors, send a labeled test alert, run the authorized staging drill, verify before/after digests and smoke tests, and package the evidence. Production drills require explicit production-impact authority.

## 10. SBOM, signing, registry, and release identity

Purpose: prove exactly what was built, scanned, signed, and deployed.

Owner steps:

- Choose OCI/package registry and retention/immutability policy.
- Approve release/tag format, prerelease rules, changelog owner, and release approver.
- Choose CycloneDX, SPDX, or both.
- Choose keyless OIDC signing or managed signing keys; define signer identity, custody, rotation, and verification policy.
- Define severity thresholds, remediation SLAs, waiver authority, and public disclosure policy.
- Authorize CI/Codex to publish images, SBOMs, attestations, checksums, and releases to named targets.

Return: registry URL/policy, release policy, signer identity policy, vulnerability policy, exception records, and publication authority.

After receipt, Codex can generate lockfile and image SBOMs, scan dependencies/filesystem/container, create provenance, sign/verify using the authorized mechanism, publish to the approved registry, and prove deployed digest equality. The current post-fix local image digest is `sha256:f3b81557b62784ec77202ef7a698f10059597257a347dfe72f7f62fef2ddc70f`; local SBOM and image evidence are recorded in `.generated/launch/`, but the registry is currently empty and no signed hosted release is claimed.

## 11. Publication, syndication, and feed validation

Purpose: prevent drafts, wrong dates, unapproved facts, duplicate identities, and unreviewed external publication.

Owner steps:

1. Appoint author, factual reviewer, publisher, and corrections owner.
2. Approve draft/scheduled/published/corrected/superseded/archived states, timezone, embargo, archive, correction, and stable-ID policy.
3. Approve site/feed title, description, authors, language, copyright/license, icon, canonical host, and update cadence.
4. Approve which content enters RSS, Atom, JSON Feed, sitemap, search, `llms.txt`, and raw documentation outputs.
5. Identify external directories/syndication/social destinations and credentials; explicitly authorize submissions.
6. Supply non-sensitive test publication and correction records.
7. Approve production publication time and unpublish/rollback procedure.

Return: editorial policy, metadata, destination list, authority scope, test records, and publication/correction approvers.

After receipt, Codex can validate feed syntax/content types/IDs/dates/escaping/authors, conditional requests where applicable, sitemap/robots/canonical/OG/structured data/`llms.txt`/raw docs, draft exclusion, correction behavior, and external receipts after authorized submission.

## 12. Minimum handoff package

Before asking Codex to execute staging or release evidence, provide:

- approved scope and visual deviations;
- legal/privacy/license/trademark approvals;
- factual/project/people/funding register;
- media/font rights register;
- named provider projects and injected secret names;
- canonical repository and explicit repository mutation authority;
- canonical domain and DNS/TLS authority or owner-run change process;
- deployment target and explicit staging/production authority;
- SLO/on-call/monitoring and rollback approvals;
- registry, SBOM, signing, vulnerability, and release policy;
- publication/feed policy and external destination authority.

The correct next request to Codex should identify the exact allowed action, target environment, approval/ticket reference, and stop condition. Missing authority or approval remains a blocker and must not be replaced with an assumption.
