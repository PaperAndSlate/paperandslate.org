# Paper & Slate next-phase manual review and authority checklist

Date: 2026-08-27
Purpose: identify the decisions, approvals, credentials, and operator authority that must come from the owner or a qualified reviewer before release closure

This is an owner-run handoff, not an automated approval. The current local evidence is useful only when it is tied to the final source SHA and then repeated against authorized hosted staging. Never paste passwords, API keys, private keys, DSNs, personal data, legal contracts, or secret-manager values into this repository, Markdown, screenshots, or chat.

## 1. What is already available locally

- `pnpm verify` is the aggregate local gate; it produces `.generated/launch/verify.json`.
- `pnpm production:visual` captures the 13-state production matrix in `.generated/launch/visual/manifest.json`; it intentionally stays `human-review-pending`.
- `pnpm lighthouse` and `pnpm performance:check` produce route reports and budget evidence under `.generated/launch/lighthouse/` and `.generated/launch/performance-summary.json`.
- `pnpm container:check` records local image ID/digest, health identity, and non-root uid in `.generated/launch/container-check.json`.
- `pnpm sbom:generate`, `pnpm security:scan`, and `pnpm vulnerability:scan` produce local supply-chain evidence.
- A private Forgejo repository exists at `https://git.tower/callum/paperandslate-web.git`; the final remediation source still needs its reviewed commit and RC tag.
- Tower-managed staging resources for `search`, `cache`, and `release-evidence` have been reconciled. The Coolify application, hosted image, monitors, provider bindings, and deployment receipt are not yet claimed.

## 2. Owner actions, in order

### A. Assign accountable reviewers

For each role, record a person/team identifier, scope, approval system or ticket, approval date, and expiry/next-review date:

1. Product/release owner: copy, scope, launch, visual deviations, and stop/go decision.
2. Qualified legal/privacy reviewer: entity description, privacy, terms, cookies/logs, processors, transfers, retention, deletion, and jurisdiction.
3. Trademark/brand reviewer: name, logo, marks, and interoperability wording.
4. Factual reviewer: mission, organization, people, projects, maturity, dates, funding, roadmap, and adoption claims.
5. Media/font rights reviewer: assets, licenses, permissions, crops, alt text, fonts, and attribution.
6. Security/operations owner: monitoring, alerting, incident response, secrets, and rollback.
7. Publication owner: editorial states, corrections, syndication, feeds, and publication timing.

Return the role map and approval IDs. Codex can place IDs in release evidence without copying confidential review content.

### B. Approve legal, factual, and public claims

1. Review the public legal, privacy, terms, security, accessibility, code-of-conduct, contribution, conflicts, license, and trademarks pages.
2. Confirm the approved description: Paper & Slate is an open education initiative of Glasscow LLC. Do not use nonprofit, charity, foundation, institution, standards authority, accreditation, government, or endorsement language unless counsel provides a different supported fact.
3. Review hosting/CDN logs, search, newsletter, error tracking, cookies, fonts, images, embeds, and any future analytics as processing activities.
4. Approve lawful basis/consent, retention, deletion/DSAR, age-related requirements, transfer mechanisms, subprocessor disclosures, and breach contact wording as applicable.
5. Approve code/documentation licenses, attribution/NOTICE requirements, contributor terms, CLA/DCO policy, and trademark use.
6. Review every named person, role, photo, profile, maintainer, funder, sponsor, project health/maturity, release/date, adoption, roadmap, and governance claim. Supply a source or approve a role-only/no-public-fact version.

Return a claim register with: `claimId`, exact wording/value, source URL or record, reviewer, approval ID, approved date, next-review date, and public/private classification. Codex can reconcile content, metadata, search, feeds, sitemap, JSON-LD, and tests against it.

### C. Review visual and media evidence

1. Open the 13 captured files in `.generated/launch/visual/` and compare them with the 13 supplied mockup references in `plans/assets/mockups/`.
2. Record each intentional deviation by capture ID, reason, approver, date, and whether the change is accepted for the RC.
3. Check responsive layout, keyboard focus, contrast, reduced-motion behavior, dark mode, empty/error states, form states, docs rendering, search overlay, and media crops.
4. For every logo, illustration, photo, generated concept, icon, and font, record creator/source, checksum, permission/license, attribution, modification/commercial/publication rights, restriction, alt text, crop, and channel.
5. Confirm that identifiable people, institutions, documents, and personal data have appropriate consent or are removed.
6. Mark each asset `approved`, `rejected`, or `needs replacement`; do not approve the entire matrix by implication.

Return the signed visual-deviation record and media/font rights register. Codex can verify checksums, rerun production captures, attach the approval IDs, and fail the bundle if an unapproved asset is referenced. Codex cannot make the human comparison or grant rights approval.

### D. Provision providers and secrets

Choose the provider, region, retention, privacy, billing, and staging/production separation first. Store values in the approved secret manager and return only secret names and non-secret IDs.

- Typesense: provide endpoint, collection/alias, search-only key name, indexing key name, rotation owner, and test-index policy. Codex can index deterministic public records, test timeout/static fallback, measure latency, and record a redacted receipt.
- Kit: approve processor/DPA and consent fields; provide list/form ID, server-only key name, sender/confirmation/unsubscribe policy, retention/deletion rules, and an approved test recipient. Codex can test disabled, validation, duplicate, provider-success, provider-failure, and idempotency behavior. Do not run a real subscription without explicit test-recipient authority.
- GlitchTip: create staging and production projects; choose PII scrubbing, sampling, retention, alert destinations, release/environment names, and on-call roles; return DSN secret names. Codex can send one labeled staging event and verify the redacted issue receipt.
- Infisical or selected manager: create dev/preview/staging/production environments; define secret names, workload identities, human roles, rotation, break-glass owner, and audit retention. Codex can bind names and verify injection/rotation without reading values.
- Valkey/cache: approve the staging endpoint, key prefix/TTL policy, proxy trust model, and multi-instance test. Codex can verify distributed rate/idempotency behavior and fail-closed behavior.

Required return: provider/project/region IDs, non-secret endpoint/collection/form names, environment, retention/privacy decision, secret names, rotation owner, and explicit test authority. Never return secret values.

### E. Complete repository and release authority

1. Confirm the canonical private Forgejo URL and owner/team.
2. Approve default branch, protected branch, merge method, required checks/reviewers, CODEOWNERS, signed commit/tag policy, secret scanning, and release permissions.
3. Explicitly authorize the exact mutations: final commit, push, branch/PR, branch protection, RC tag, registry publication, and release evidence upload.
4. Approve the RC version `v1.0.0-rc.1`; do not authorize final `v1.0.0` as part of this task.
5. After the final commit, return the commit SHA, PR/review ID, tag/signature verification result, and CI run IDs.

Codex can commit/push/tag only within the exact authority granted, inspect the private Forgejo receipt, and bind all evidence to the SHA. A repository grant does not grant deployment or DNS authority.

### F. Authorize Tower/Coolify staging only

1. Confirm the Tower instance, project, staging environment, server/cluster, network, registry, application name, resource limits, replicas, health path, log destination, and secret bindings.
2. Re-check the known non-secret target: project `rggf2bl4tdww50yu6h58czg2`, staging environment `l56i154xmd5r4ywgc9ez2ce3`, target `tower-staging`. Treat these as revalidated facts, not permanent assumptions.
3. Approve a staging hostname and HTTPS policy. Production is a separate approval and is outside this task.
4. Explicitly authorize creation/adoption of the staging Coolify workload, non-secret variable definitions, secret-name bindings, registry policy, monitor creation, and staging deployment of the exact reviewed commit.
5. Return application ID, deployment ID, hosted image digest, health receipt, source SHA, and environment name.

Codex can validate the manifest, create/adopt the staging workload, configure non-secret variables, bind approved secret names, deploy the exact commit, run route/browser/feed checks, and package redacted receipts. Codex must stop before production.

### G. DNS/TLS and canonical URL

1. Confirm production host, canonical apex/`www`, staging host, redirects, registrar/DNS owner, and whether Codex may edit records.
2. Approve A/AAAA/CNAME/TXT/CAA records, TTL/DNSSEC, certificate issuer/renewal, minimum TLS, HSTS/preload policy, and expiry owner.
3. Define a cutover window, propagation window, rollback TTL, downtime tolerance, and owner-run versus Codex-run change process.
4. Return the approved change set and post-change evidence, not credentials.

Codex can validate DNS propagation, HTTPS redirects, certificate chain/expiry, CAA, TLS, headers, canonical URLs, and cookies after the owner-authorized change. No DNS/TLS mutation is implied by this checklist.

### H. Monitoring and rollback evidence

1. Approve SLOs for availability, error rate, latency, search, newsletter, feeds, and certificate expiry.
2. Name on-call and escalation roles; define alert destinations, acknowledgement targets, incident severity, PII/log retention, and status-page policy.
3. Create/reconcile monitors for `/health`, `/`, `/projects`, `/docs/file-system/v/1.0`, `/api/search?q=RFC%201`, and `/feeds/rss.xml` on the authorized HTTPS staging URL.
4. Select the last-known-good artifact and approve the maximum rollback/data-loss window.
5. Authorize an A→B→A staging drill using two immutable deployments. Record both deployment IDs/digests, probe results before/after, restored health, and operator/time.
6. Identify who may trigger production rollback. Production drills remain separately authorized and are not performed here.

Codex can create/probe authorized Tower monitors, read bounded logs/status, run the staging drill, compare digests, and assemble the incident/rollback receipt.

### I. SBOM, vulnerabilities, signing, and release identity

1. Approve registry, retention/immutability, release/tag rules, CycloneDX/SPDX formats, signer/OIDC or managed-key policy, and verification policy.
2. Approve vulnerability severity thresholds, remediation SLAs, waiver authority, and expiry. The current development-tool advisories must receive an explicit disposition; they must not be hidden by changing the report.
3. Authorize CI/Codex to publish image, image SBOM, lockfile SBOM, checksums, provenance, and signatures to named targets.
4. Require equality across: final Forgejo commit, signed RC tag, CI build, OCI digest, image SBOM, scan report, staged deployment, and rollback artifact.
5. Return registry image digest, SBOM object IDs, scan result, provenance/signature verification, and CI run ID.

Codex can generate and verify local/authorized artifacts and attach them to the evidence bundle. Local Docker digest is not a hosted immutable registry or deployment receipt.

### J. Publication, syndication, and feed acceptance

1. Appoint author, factual reviewer, publisher, and corrections owner.
2. Approve `draft`, `scheduled`, `published`, `corrected`, `superseded`, `archived`, and `withdrawn` semantics; publication clock/timezone; embargo; stable IDs; correction and unpublish rules.
3. Approve site/feed title, description, language, authors, copyright/license, icon, canonical host, and update cadence.
4. Approve exactly what appears in RSS, Atom, JSON Feed, sitemap, search, `llms.txt`, `llms-full.txt`, and raw docs. Future/draft/unapproved records must remain excluded.
5. Identify syndication/directories/social destinations and authorize each submission. Do not provide credentials in chat.
6. Supply a non-sensitive test publication and correction record; approve production publication time and rollback/unpublish procedure.
7. Return feed validation receipts, destination receipts, and approval IDs.

Codex can validate XML/JSON feed structure, IDs, dates, escaping, authors, canonical links, conditional behavior, sitemap/robots/OG/JSON-LD/AI outputs, draft exclusion, corrections, and authorized external receipts.

## 3. Return package to Codex

Return a redacted package containing:

- reviewer/owner role map and approval/ticket IDs;
- legal/factual claim register and media/font rights register;
- visual deviation decisions and approved asset checksums;
- provider IDs, non-secret names, secret-manager names, and test authority;
- repository/branch/PR/tag authority and resulting SHA/run IDs;
- Tower/Coolify application/environment/deployment identifiers;
- DNS/TLS change authority and approved host/record plan;
- SLO/on-call/monitor/rollback authority and drill window;
- registry/SBOM/signing/vulnerability policy and exception records;
- publication/feed/syndication policy and acceptance receipts.

On receipt, Codex can execute only the named next gate and stop condition, then regenerate `launch-evidence.json` and the release bundle. Missing authority remains a blocker rather than an assumption.
