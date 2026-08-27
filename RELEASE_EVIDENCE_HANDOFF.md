# Paper & Slate release-evidence handoff

Date: 2026-08-27
Status: RC1 and authorized staging evidence available; closure still requires owner/qualified-reviewer decisions, provider credentials, passing private CI, canonical URL configuration, hosted artifact identity, and rollback/publication evidence
Related audit: [`AUDIT_VERIFICATION_REPORT.md`](AUDIT_VERIFICATION_REPORT.md)

This file is the current action list for work that cannot be truthfully completed from the local workspace alone. It states the purpose, the exact owner/reviewer action, the evidence to return, and what Codex can do after that evidence or authority exists.

Never put passwords, API keys, private keys, personal data, legal contracts, or provider secret values in Git, Markdown, screenshots, or chat. Place secrets in the approved secret manager and provide only secret names and non-secret identifiers.

## How to use this handoff

1. Assign a named owner or role for every section.
2. Return the requested decision, approval ID, ticket, source, or non-secret identifier.
3. Mark anything intentionally deferred as deferred with an owner and next-review date; do not mark it complete.
4. Ask Codex to execute only the specifically authorized local, repository, provider, staging, or production actions.

Codex can inventory, draft, automate, validate, capture, compare, and assemble evidence. Codex cannot grant legal/factual/media approval, invent organizational facts, create authority, choose a provider policy on the owner's behalf, or silently perform production-impacting mutations.

Current non-secret state: a private Forgejo repository exists at `https://git.tower/callum/paperandslate-web.git`. Immutable tag `v1.0.0-rc.1` points to `031b5447786f9c619288c9044bb5bc65319a30d7`; follow-up commit `59c1e2cb8231866729ad3248d763417aa88790f1` is pushed to `release/v1-closure` and fixes the Coolify health-probe dependency, but is not yet a new RC tag. Tower-managed Typesense `search`, Valkey `cache`, and S3 `release-evidence` resources are applied. Coolify application `ngqtewtqeqhj88v1005a38va` is healthy at latest deployment `axrm4kappbnargjw1mbtuie4` on the follow-up SHA, and six staging monitors are active/healthy. No passing Forgejo CI, hosted OCI image/SBOM/provenance receipt, provider credential activation, DNS/TLS change, production action, or A→B→A rollback drill is claimed. Staging canonical output still falls back to `http://localhost:3000` because Tower rejected `NEXT_PUBLIC_SITE_URL` as a public project variable.

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

Current state: the private Forgejo remote is `https://git.tower/callum/paperandslate-web.git`; the immutable RC1 tag is `v1.0.0-rc.1` at `031b544...`, and the current follow-up staging fix is `59c1e2c...` on `release/v1-closure`. There is no protected branch/PR receipt, verified signature, passing CI receipt, or hosted release-artifact receipt. Do not move RC1; authorize a new RC tag only after the follow-up source and remaining gates are accepted.

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

Current non-secret state: `.tower/project.yaml` and `infrastructure/tower/intent.yaml` describe staging only. The Tower controller has a staging server/target and the managed shared resources have been reconciled. Coolify application `ngqtewtqeqhj88v1005a38va` and deployment `axrm4kappbnargjw1mbtuie4` are healthy on `59c1e2c...`; route/feed/health probes pass and six monitors are active/healthy. The deployment is a direct Coolify build, so the private registry has no corresponding hosted image digest/SBOM receipt. Secret values are not bound, Typesense is unhealthy with HTTP 401, canonical `NEXT_PUBLIC_SITE_URL` is not configured, and the required rollback drill remains pending.

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

Current state: the six staging monitors are active and healthy, but the earlier failed probes left historical SLO-budget alerts active (availability history around 4.5%). The first RC1 Coolify deployment automatically rolled back when its image lacked `curl`/`wget`; the follow-up image includes `curl` and is healthy. Return: SLO/alert policy, role aliases, privacy settings, monitor IDs/destinations, drill window, known-good release, rollback authority, and incident template.

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

After receipt, Codex can generate lockfile and image SBOMs, scan dependencies/filesystem/container, create provenance, sign/verify using the authorized mechanism, publish to the approved registry, and prove deployed digest equality. The current local post-fix image digest is `sha256:29b8f73c9274426ced2e10ec7d3c01c1e6b45559dd0473451c848550bc58aa5f`; local SBOM and image evidence are recorded in `.generated/launch/`, but the registry is currently empty and no signed hosted release is claimed.

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
