# Paper & Slate owner and qualified-reviewer actions

Date: 2026-08-27  
Status: detailed checklist; current status and findings are in `AUDIT_VERIFICATION_REPORT.md`

Use `RELEASE_EVIDENCE_HANDOFF.md` as the current, state-aware handoff. Older launch receipts are historical and must not be used as evidence of current production readiness. The local Git repository has been initialized on `main`, but there is still no commit, remote, pull request, signed release, or production deployment.

This checklist contains actions Codex cannot truthfully complete alone. Do not place secrets, private keys, personal data, legal advice, or confidential contracts in this repository or in evidence screenshots.

## 1. Appoint accountable reviewers

Purpose: establish who can authorize public claims and production risk.

- [ ] Name the product owner with authority to approve scope, copy, visual deviations, and launch.
- [ ] Name legal/privacy counsel for the intended jurisdictions and audiences.
- [ ] Name the trademark/brand-rights owner.
- [ ] Name the factual reviewer for mission, institution, people, project, adoption, roadmap, and funding claims.
- [ ] Name the media-rights reviewer for every supplied/generated image and logo.
- [ ] Name the security/operations owner and production rollback approver.
- [ ] Name the release owner who can approve repository tags, artifacts, and publication.

Provide Codex with reviewer names or role identifiers, approval scope, and evidence/ticket references. Public names should only be supplied if publication is approved.

## 2. Legal, privacy, licensing, and trademark review

Purpose: prevent placeholder or inaccurate legal text from being presented as approved terms.

Steps:

1. Define the operating legal entity, jurisdiction, contact address, and public contact channels, or explicitly approve wording that no entity claim is made.
2. Have counsel review the public Privacy, Terms, Security, Accessibility, Code of Conduct, contribution, conflict, license, and trademark pages.
3. Confirm whether analytics, error monitoring, newsletter delivery, search, CDN/hosting logs, cookies, or third-party embeds process personal data.
4. Approve the lawful basis, notices, consent behavior, retention, subprocessors, international transfer terms, deletion/DSAR process, age-related requirements, and breach contact/process as applicable.
5. Confirm the code license, documentation license, NOTICE obligations, third-party license attribution, contributor terms, and whether a CLA/DCO is required.
6. Confirm ownership and permitted use of the Paper & Slate name, logos, marks, and any education/institutional descriptors.
7. Return approved text or tracked edits with reviewer, date, jurisdiction, document version, and next review date.

Evidence to return:

- approval/ticket ID for each document;
- final approved text or commit-ready redline;
- list of required provider disclosures/subprocessors;
- license and trademark authority statement;
- review/expiry date.

## 3. Factual, institutional, people, project, and funding approval

Purpose: ensure the site does not invent an institution, maintainer, release, adoption, roadmap, or funding status.

Steps:

1. Confirm the exact organization description and whether “foundation” is a legal, informal, or aspirational label.
2. Approve mission, principles, audience, public-benefit, governance, and interoperability claims.
3. Supply approved maintainer/person names, roles, bios, profile links, photos, and consent, or approve role-only presentation.
4. For every project, approve maturity, health, version, repository, documentation source, maintainers, license, last meaningful update, dependencies, compatibility/adoption statements, and roadmap.
5. Approve RFC, decision, policy, release, report, correction, and news facts and dates.
6. Approve funding language, sponsors/donors, amounts/ranges, restrictions, disclosures, or a truthful no-public-data state.
7. Provide authoritative source URLs/documents and a reviewer attestation for each claim family.

Evidence to return: a spreadsheet or Markdown register with claim ID, approved wording/value, source, reviewer, approval date, review date, and public/private status.

## 4. Media and font rights

Purpose: allow real assets to replace placeholders without copyright, trademark, privacy, or accessibility risk.

Steps:

1. Inventory every file under the plan pack’s logo, mockup media, generated-concept, and mockup directories.
2. For each asset, identify creator/source, creation date, license/permission, allowed modifications, attribution, restrictions, and approved publication channels.
3. Confirm whether generated assets may be used commercially/publicly and retain the generation provenance required by policy.
4. Confirm that any depicted people, institutions, documents, or identifiable data have releases or are removed.
5. Approve crop/focal point, light/dark variant, alt text, decorative status, caption/credit, and replacement schedule.
6. Confirm the exact font families/weights, source, web embedding rights, subset rights, and fallback policy.
7. Mark each asset `approved`, `rejected`, or `needs replacement` and sign/date the register.

Evidence to return: rights register, license/permission files, attribution text, approved alt text, and the exact approved asset checksum.

## 5. Provider accounts and credentials

Purpose: provide external state Codex cannot create or assume without authority.

### Typesense

- [ ] Choose provider/region/plan and approve data residency and billing.
- [ ] Create production and preview projects/collections or authorize Codex to do so.
- [ ] Create a least-privilege admin/indexing credential and a separate search-only credential.
- [ ] Store credentials in the approved secret manager under agreed names.
- [ ] Provide endpoint, collection/alias naming policy, rotation owner, and non-secret key identifiers.

### Kit

- [ ] Approve Kit as newsletter processor and complete any privacy/DPA review.
- [ ] Create the form/list and required custom consent fields.
- [ ] Create a server-only least-privilege API credential and store it in the secret manager.
- [ ] Provide the non-secret form ID, sender identity, confirmation mode, unsubscribe policy, test recipient, and retention rules.

### GlitchTip/monitoring

- [ ] Approve provider, region, retention, sampling, billing, and PII policy.
- [ ] Create project/environment and store server/client DSNs as approved.
- [ ] Provide alert destinations, on-call owner, release naming, and test-event approval.

### Infisical/secret manager

- [ ] Create production, staging, preview, and development environments.
- [ ] Grant workload identities and human roles using least privilege.
- [ ] Define secret names, rotation schedule, break-glass owner, and audit retention.

Never send secret values in Markdown or chat. Tell Codex only that the named secrets have been placed in the authorized environment.

## 6. Repository authority

Purpose: establish canonical source, review, provenance, and release identity. The local repository is initialized but has no commit or remote.

Steps:

1. Choose the canonical GitHub organization/account, repository name, visibility, owner team, and billing owner.
2. Decide whether to import history from another source or create a new initial repository.
3. Confirm default branch, merge method, branch protection, required reviewers, CODEOWNERS, signed-commit/tag policy, required CI, secret-scanning policy, and release permissions.
4. Confirm whether Codex is authorized to initialize Git, create the remote, push an initial branch, open a pull request, and configure repository settings. Each external write needs explicit scope.
5. Approve the canonical repository URL for public pages and project records.
6. Provide non-secret account/team identifiers and ensure credentials are available through the approved authenticated tool, not pasted into files.

Evidence to return: repository URL, authority statement, team/role names, branch/release policy, and explicit list of actions Codex may perform.

## 7. Domain, DNS, TLS, and canonical URL authority

Purpose: establish the public identity and secure routing of the site.

Steps:

1. Confirm the production domain, canonical host (`www` or apex), preview/staging hosts, and redirect policy.
2. Identify the registrar/DNS account owner and grant narrowly scoped DNS access or make changes yourself from Codex-provided records.
3. Approve A/AAAA/CNAME/TXT/CAA records, TTLs, DNSSEC policy, and email-related records if the domain sends mail.
4. Approve certificate issuer, automatic renewal, minimum TLS policy, CAA, HSTS preload decision, and incident/expiry owner.
5. Define cutover date, rollback TTL strategy, propagation window, and acceptable downtime.
6. Provide explicit authority for Codex to edit DNS/TLS or state that the owner will apply a generated change set.

Evidence to return: domain ownership confirmation, approved records, change window, authority scope, and post-change screenshots/exports if you apply changes yourself.

## 8. Tower/Coolify and production deployment authority

Purpose: allow a controlled, attributable deployment rather than treating `intent.yaml` as activation.

Steps:

1. Identify the exact Tower/Coolify instance, organization/project, server/cluster, network, registry, and application name.
2. Confirm environment separation, resource limits, health checks, replicas, persistent storage requirements, log destination, and secret injection.
3. Define preview, staging, and production promotion rules; require immutable image digests.
4. Approve the deployment window, approver, maintenance notice, smoke-test scope, and stop/rollback criteria.
5. Grant Codex narrowly scoped deployment access or designate an operator to run the generated commands.
6. Explicitly authorize each production deployment/promotion; repository authority alone is not deployment authority.

Evidence to return: target identifiers, access/role confirmation, approved environment configuration, deployment window, approver, and explicit mutation scope.

## 9. Monitoring, incident response, and rollback approvals

Purpose: make production health and recovery measurable and actionable.

Steps:

1. Approve SLOs for uptime, error rate, latency, search, newsletter, feed freshness, and certificate expiry.
2. Define on-call owner, alert destinations, acknowledgement/escalation times, incident severity levels, and public status communication.
3. Approve log/metric/error retention, PII scrubbing, access controls, and deletion process.
4. Select the last-known-good artifact policy and maximum acceptable rollback/data inconsistency window.
5. Approve a staging rollback drill and, separately, a production rollback drill window and expected impact.
6. Identify who may trigger rollback and who confirms service restoration.

Evidence to return: SLO/alert policy, on-call contacts or role aliases, privacy settings, drill window, approved known-good release, rollback authority, and incident template.

## 10. SBOM, signing, registry, and release policy

Purpose: bind published software to reviewed source and supply-chain evidence.

Steps:

1. Select container/package registry and retention/immutability policy.
2. Approve release numbering/tag format, prerelease rules, changelog owner, and release approver.
3. Choose CycloneDX, SPDX, or both for SBOM publication.
4. Choose keyless OIDC signing or managed signing keys; define signer identity, key custody/rotation, and verification policy.
5. Define vulnerability severity thresholds, remediation SLA, waiver authority, and public disclosure policy.
6. Authorize Codex/CI to publish images, attestations, SBOMs, checksums, and releases to the named targets.

Evidence to return: registry/release policy, signer identity policy, vulnerability policy, release authority, and allowed publication targets.

## 11. Publication, feeds, and external syndication approval

Purpose: prevent drafts, wrong dates, unapproved facts, or duplicate identities from reaching readers and aggregators.

Steps:

1. Approve editorial roles for author, reviewer, publisher, and corrections owner.
2. Approve lifecycle states, scheduling timezone, embargo rules, correction policy, archival policy, and stable-ID policy.
3. Confirm canonical site URL, feed titles/descriptions/authors, language, copyright/license, icons, and update cadence.
4. Approve which content types enter RSS, Atom, JSON Feed, sitemap, search, and AI-readable outputs.
5. Identify external feed directories, social/syndication destinations, and credentials; explicitly authorize submissions.
6. Provide test publication and correction records using approved non-sensitive content.
7. Approve the production publication time and rollback/unpublish procedure.

Evidence to return: editorial policy, approved metadata, destination list, authority scope, test records, and publication/correction approvers.

## 12. Minimum handoff package for Codex

Before asking Codex to execute launch evidence, provide or confirm:

- [ ] approved scope and visual deviations;
- [ ] legal/privacy/license/trademark approvals;
- [ ] factual/project/people/funding register;
- [ ] media/font rights register;
- [ ] provider projects exist and named secrets are injected;
- [ ] repository URL and explicit repository mutation authority;
- [ ] canonical domain and DNS/TLS mutation authority or owner-operated change process;
- [ ] deployment target and explicit staging/production authority;
- [ ] SLO/on-call/monitoring and rollback drill approvals;
- [ ] registry, SBOM, signing, vulnerability, and release policy;
- [ ] publication/feed policy and external destination authority.

Codex can then turn these inputs into implementation changes, automated checks, deployment steps, and a release evidence bundle. Missing authority or approval remains a launch blocker and must not be replaced with an assumption.
