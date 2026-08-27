# Paper & Slate launch evidence plan

Date: 2026-08-27  
Status: plan only; current verification is in `AUDIT_VERIFICATION_REPORT.md`

Use `RELEASE_EVIDENCE_HANDOFF.md` as the current owner-facing checklist with present local state and exact handoff inputs.

This document separates work Codex can execute from decisions, credentials, approvals, and authority that must come from the project owner or a qualified reviewer. Execution must begin only after the corresponding product remediation is complete and the required authority is explicitly granted.

## Ownership legend

- **Codex**: can implement, automate, run, capture, validate, and assemble evidence in the authorized environment.
- **Owner**: must choose policy, provide authority, create or grant accounts, approve production-impacting actions, and attest organizational facts.
- **Qualified reviewer**: legal counsel, privacy professional, accessibility specialist, security professional, accountant/funding authority, or rights holder as appropriate.
- **Provider**: external service state that must exist before Codex can verify it.

## Proposed evidence structure

When execution is authorized, store generated local/CI evidence under a versioned release bundle such as:

```text
.generated/evidence/<release-id>/
  manifest.json
  traceability/
  visual/
  lighthouse/
  accessibility/
  providers/
  repository/
  dns-tls/
  deployment/
  monitoring/
  rollback/
  sbom/
  publication-feeds/
  approvals/
```

`manifest.json` should record release ID, commit SHA, source repository, build workflow/run, build timestamp, artifact digest, image digest, environment, tool versions, evidence file digests, and approval IDs. Secrets must never be written to evidence.

## 1. Visual and Lighthouse evidence

Owner: Codex after product remediation; owner approves final visual target.

Codex can:

1. Define a route/state matrix covering homepage, foundation, projects index/detail, governance, news index/article, docs home/reference, search, error/404, legal, newsletter states, mobile menu, light/dark/system themes, and provider success/failure states.
2. Capture deterministic screenshots at agreed desktop, tablet, 390 px mobile, and landscape-mobile widths.
3. Compare each implementation screenshot with the matching supplied mockup at the same viewport and state.
4. Record viewport, browser/version, color scheme, locale, timezone, fonts, animation setting, fixture data, route, and commit SHA.
5. Add approved visual baselines and run pixel-diff CI without silently updating them.
6. Run axe and keyboard checks on every representative template and preserve traces/results.
7. Install/configure Lighthouse CI in a reviewed change, run multiple samples per representative route, and retain HTML/JSON reports.
8. Enforce plan-aligned blocking thresholds for performance, accessibility, best practices, and SEO, plus budgets for JavaScript, CSS, images, fonts, LCP, CLS, INP/TBT, and request count.

Required owner input:

- confirmation that supplied mockups remain the visual target or a signed change note identifying approved deviations;
- approved font and media rights;
- acceptance of baseline images after human review.

Acceptance evidence:

- route/state matrix with no unreviewed launch surface;
- reference/current/diff images for every target;
- zero unexplained visual diffs;
- Lighthouse reports from the release artifact, not a development server;
- signed visual acceptance record and retained CI artifacts.

## 2. Qualified legal, factual, institutional, and media approvals

Owner: owner and qualified reviewers. Codex prepares review packs but cannot grant approval.

Codex can:

1. Inventory every public claim, person, role, organization, funding statement, legal term, policy, license, trademark statement, privacy statement, cookie/analytics behavior, security contact, and media asset.
2. Produce a line-by-line approval register with source, owner, reviewer, jurisdiction, expiry/review date, and approved wording.
3. Detect public copy that lacks approval or conflicts with actual runtime behavior.
4. Apply approved wording and rights metadata in a later authorized implementation task.
5. Verify that unapproved material is absent from the production artifact.

Required owner/reviewer input is detailed in `OWNER_ACTIONS_REQUIRED.md`.

Acceptance evidence:

- named reviewer and date for each approval class;
- approved text/version or legal ticket reference;
- media rights/provenance record for every published asset;
- factual sources and attestation for organization, people, funding, project maturity/health, and adoption claims;
- privacy review matched to the actual providers and telemetry enabled in production.

## 3. Provider credentials and activation

Owner: owner creates accounts/credentials; Codex integrates and validates after secrets are injected securely.

### Typesense

Codex can configure schemas, collection aliases, scoped search-only keys, indexing jobs, static fallback, preview isolation, smoke tests, outage tests, and index rollback.

Evidence: redacted configuration receipt, schema hash, collection/alias names, indexed count, build ID, search latency samples, fallback test, key-scope verification, and rollback result.

### Kit newsletter

Codex can implement the server adapter, consent payload, idempotency, timeout/error handling, disabled state, sandbox submission, webhook/delivery verification if available, and redacted logs.

Evidence: form ID, environment, redacted request/response metadata, consent fields, test subscriber receipt, failure-path tests, and secret-leak scan.

### GlitchTip or selected observability provider

Codex can configure source maps, release/environment tags, server/client error capture, sampling, PII scrubbing, alert routing tests, and a synthetic test event.

Evidence: release-linked event ID, scrubbed payload, source-map resolution screenshot, alert receipt, retention/sampling settings, and deletion/DSAR procedure reference.

### Infisical or selected secret store

Codex can map secret names to environments, configure runtime injection, verify rotation behavior, and scan artifacts/logs for leakage.

Evidence: secret-name inventory without values, environment mapping, access-policy IDs, rotation date, injection test, and leak-scan result.

Owner prerequisites:

- create or approve provider projects;
- create least-privilege credentials or workload identities;
- place secrets in the approved secret store, never Markdown, Git, screenshots, or chat;
- approve provider region, retention, data processing, billing, and privacy terms.

## 4. Repository, DNS, TLS, and deployment authority

Owner: owner grants authority and defines targets. Codex can execute after explicit authorization.

Codex can:

1. Initialize/import the repository only when explicitly requested, preserving the current tree and producing an initial source inventory.
2. Configure branch protection, required checks, CODEOWNERS, release tags, dependency automation, environments, and deployment approvals through approved repository workflows.
3. Validate DNS records, propagation, CAA, redirects, canonical host behavior, security headers, certificate chain, expiry, renewal, supported protocols/ciphers, and HTTP-to-HTTPS behavior.
4. Configure or update the approved Tower/Coolify application from reviewed infrastructure intent.
5. Deploy an immutable artifact to preview/staging, run acceptance, then promote the same digest to production after owner approval.
6. Record every deployment and avoid mutable `latest`-only identity.

Evidence:

- repository URL, default branch, protected-branch settings, commit/tag, CI run, and review receipt;
- DNS before/after records and propagation checks from multiple resolvers;
- TLS chain/expiry/protocol report and automated renewal evidence;
- deployment ID, source SHA, image digest, environment, timestamp, approver, and health/smoke results;
- canonical URL and redirect/cookie/header verification.

## 5. Production monitoring and rollback evidence

Owner: owner defines SLOs/on-call and authorizes drills. Codex can configure and exercise them.

Codex can:

1. Implement uptime, health, route, feed, search, newsletter, certificate-expiry, and error-rate monitors.
2. Add release markers, structured logs, metrics, traces where justified, and privacy-safe dashboards.
3. Exercise alert delivery with a labeled test event and record acknowledgement time.
4. Define immutable known-good artifact selection and pre/post rollback checks.
5. Run a staged rollback drill; run a production drill only in an approved window with explicit production-impact authority.
6. Verify health, representative routes, search/feed behavior, monitoring recovery, and data consistency after rollback.

Evidence:

- monitor IDs/configuration, SLOs, escalation policy, alert receipts, dashboard screenshots, and synthetic history;
- rollback runbook version, release-before/release-after digests, command/automation receipt, outage duration, smoke results, and lessons/actions;
- proof that rollback restores the application and search index pair coherently.

## 6. SBOM and release identity

Owner: Codex can generate; owner selects registry/signing policy and grants release authority.

Codex can:

1. Generate CycloneDX and/or SPDX SBOMs for workspace dependencies and the final container.
2. Run dependency, filesystem, secret, and container vulnerability scans with a documented severity policy and exception process.
3. Generate build provenance/attestation tied to source SHA, workflow identity, and image digest.
4. Sign the image/attestation using approved keyless OIDC or managed signing keys.
5. Publish release notes, checksums, SBOMs, attestations, and scan summaries alongside the immutable release.
6. Verify signatures and attestations from a clean environment before promotion.

Evidence:

- release ID/tag, source SHA, image digest, package lock digest, SBOM digest, scan reports, exceptions, provenance statement, signature verification output, and registry URL;
- proof that the deployed digest matches the signed release digest.

## 7. Publication, syndication, and feed validation

Owner: Codex can implement and validate; owner approves editorial policy, facts, and publication authority.

Codex can:

1. Implement reviewed draft, scheduled, published, corrected, superseded, and archived transitions using a supplied clock/timezone.
2. Ensure preview/draft content is excluded from production pages, search, sitemap, AI outputs, and feeds.
3. Validate RSS 2.0, Atom, and JSON Feed syntax, content type, canonical URLs, IDs, dates/timezones, escaping, summaries/content, authors, and update behavior.
4. Test feed readers/validators and preserve results; validate conditional requests/caching if implemented.
5. Verify sitemap, robots, canonical tags, Open Graph, structured data, `llms.txt`, and raw documentation outputs against the release host.
6. Exercise correction/update behavior without silently changing stable IDs.
7. Validate external syndication only after the owner approves destinations and credentials.

Evidence:

- publication workflow test matrix and transition logs;
- production feed URLs and validator reports;
- item IDs/canonical URL inventory, duplicate/ordering/date checks, and before/after correction evidence;
- proof that unpublished content is absent;
- external destination receipts where syndication is enabled.

## Execution order and stop gates

1. Complete remediation Phases 0–5 from `AUDIT_AND_REMEDIATION_PLAN.md`.
2. Receive owner/qualified approvals and authority listed in `OWNER_ACTIONS_REQUIRED.md`.
3. Establish repository and immutable release identity.
4. Produce staging visual, accessibility, Lighthouse, provider, feed, and security evidence.
5. Obtain staging acceptance and explicit production promotion approval.
6. Promote the identical signed artifact; validate DNS/TLS, routes, providers, feeds, and monitoring.
7. Run the authorized rollback drill and restore the approved production release.
8. Freeze the evidence manifest and link every definition-of-done item to an artifact.

Stop if credentials would be exposed, approval scope is unclear, DNS/repository ownership cannot be proven, legal/media approval is missing, the deployed digest differs from the approved artifact, a required gate fails, or rollback cannot be safely executed.
