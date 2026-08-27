# Paper & Slate implementation audit and remediation plan

Date: 2026-08-26  
Status: audit complete; plan only; no product fixes applied

## Verdict

The current repository is a substantial local prototype, but it is **not fully implemented against the complete plans and master prompt**. It has a working Next.js application, broad route scaffolding, local content registries, a partial documentation pipeline, static search, feeds, a non-root container recipe, and several passing local checks. The final completeness claim is blocked by material implementation gaps, a failing lint gate, failing visual baselines, shallow readiness checks, absent external/release evidence, and a missing requirement-by-requirement traceability ledger.

Several historical tasks were deliberately scoped to local placeholders and explicitly excluded media, fonts, external URLs, providers, repositories, and deployment. Those task receipts can be valid for their bounded milestones, but they do not satisfy the later full-site master prompt or definition of done.

## Audit basis

The audit compared:

- the pasted implementation brief and definition of done;
- all 89 Markdown files in `plans/` and their supplied visual/media assets;
- the current application, packages, content, scripts, tests, CI, Docker, and Tower intent;
- `IMPLEMENTATION_LEDGER.md`, `IMPLEMENTATION_REPORT.md`, `LAUNCH_READINESS.md`, `EXTERNAL_ACTIVATION.md`, and `MISSING_PUBLIC_FACTS.md`;
- fresh rendered screenshots at desktop and 390 px mobile widths, compared with the supplied mockups.

The current `IMPLEMENTATION_LEDGER.md` is 52 lines, contains no `plans/` path references, and does not map the 89 plan files or their requirements to implementation evidence.

## Verification results captured in this audit

| Check                                     | Result       | Qualification                                                                                              |
| ----------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------- |
| `pnpm format:check`                       | Passed       | The command checks an explicit, incomplete file list rather than the repository.                           |
| `pnpm lint`                               | Failed       | Seven errors in generated `apps/web/.source/*.ts`; generated-source ownership/ignore policy is unresolved. |
| `pnpm typecheck`                          | Passed       | Six workspace packages passed.                                                                             |
| `pnpm test`                               | Passed       | 14 files and 27 tests; coverage is much narrower than the test plan.                                       |
| Docs/content/routes/feeds/releases checks | Passed       | These validate small local registries and selected files, not complete plan coverage.                      |
| Security/SEO/performance/rollback checks  | Passed       | Primarily token/file-presence checks; they do not prove the behavior named by each gate.                   |
| `pnpm build:verify`                       | Passed       | Next.js 16.3.3 built 102 pages; middleware deprecation warning remains.                                    |
| `pnpm e2e`                                | Passed       | Five smoke checks.                                                                                         |
| `pnpm a11y`                               | Passed       | One central docs page was scanned for serious/critical axe findings.                                       |
| `pnpm visual:check`                       | Failed       | Desktop light, 390 px mobile, and dark homepage baselines all differ.                                      |
| Lighthouse                                | Not measured | The script only prints that Lighthouse is unavailable.                                                     |
| Git/repository state                      | Unavailable  | This workspace is not inside a Git repository.                                                             |

## Prioritized findings

### P0 — Claims, traceability, and release gates

1. **The required implementation ledger does not exist in the required form.** The current ledger is a task-history summary, not a per-plan, per-requirement matrix with status, files, tests, blockers, and evidence.
2. **The repository cannot support release identity or provenance yet.** There is no `.git` worktree in this directory or its parent, so commit SHA, branch protection, pull-request evidence, tags, and source attestations cannot be established.
3. **The advertised green gates overstate what they verify.** Performance checks only look for a YAML key; rollback checks only look for three files; SEO checks only look for files; security checks allow script `unsafe-inline`; Lighthouse does not run.
4. **CI is incomplete relative to the plans.** Only one workflow exists. It omits browser smoke, axe, visual regression, Lighthouse CI, Docker build/runtime, SBOM, image scanning, provenance/signing, preview policy, scheduled publishing, nightly docs drift, standards dispatch, dependency automation, and release workflows.
5. **The current lint gate fails.** A release candidate cannot be described as locally green while `pnpm lint` exits non-zero.

### P0 — Functional behavior

6. **Kit newsletter integration is not implemented.** `kitConfigured()` detects settings, but `submitNewsletter()` always returns `disabled`; the form is always disabled. Provider activation would not enable delivery.
7. **Typesense failure does not fall back to static search.** Once configured, the hosted provider is selected exclusively. Network, timeout, or provider errors propagate instead of switching to the local index.
8. **The search API has insufficient boundary handling.** Query limits are not robustly normalized, hosted error details can escape through callers, and the provider implementation lacks the planned facets, ranking rules, aliases/build identity, preview isolation, and operational index swap.
9. **Documentation is only partially Fumadocs-powered.** Three central documents use the intended path; other ingested docs use a minimal custom Markdown renderer. That renderer does not provide normal Markdown/MDX fidelity, syntax highlighting, code tabs/copy, schema explorer, diagrams, requirement linking, rich warnings, previous/next navigation, or the planned project/version experience.

### P1 — Information architecture and content models

10. **Project maturity and health are conflated and incomplete.** The model uses `planned | experimental | unreleased | available`; it does not implement the required maturity vocabulary or a separate health field.
11. **Project registry/detail surfaces omit required data.** Repository/source links, independently evidenced health, richer version/release state, relationships, roadmap/RFC/news links, and maintainer/license facts are missing or pending.
12. **Project discovery is reduced.** The page has three selects, but lacks the planned text search, maturity/current/archive handling, featured-plus-registry layout, card/list modes, and richer empty/filter states.
13. **Governance and publishing lifecycles are simplified.** RFC, decision, roadmap, scheduled publishing, correction, review, and archival models do not cover the planned lifecycle states and evidence.
14. **Public facts remain placeholders.** Maintainers, repositories, licenses, legal terms, trademark authority, funding, institutional status, contact/security channels, and several canonical facts require approval before publication.
15. **Sitemap and discoverability coverage are incomplete.** The sitemap omits several publishable dynamic records such as RFCs, decisions, policies, reports, releases, and documentation detail/version pages.

### P1 — Visual system, interactions, and accessibility

16. **The supplied media and complete brand asset set are not integrated.** The live site uses CSS-pattern placeholder slots for project/news media even though the plan pack contains approved mockup media candidates. Rights and provenance still need approval before use.
17. **The approved mockups are only loosely matched.** The current site captures the dark editorial tone, but the homepage, projects page, docs article, and search overlay materially differ in hierarchy, content density, imagery, controls, and layout.
18. **Global utilities are incomplete.** There is no visible GitHub action, user-selectable theme control, or ready-state Get involved action. Mobile navigation omits the planned search, GitHub, theme, project shortcuts, and legal links.
19. **Global search is only a launch form.** The modal does not show grouped live results, content types, exact matches, keyboard navigation, empty/error states, or facets as shown in the design and interaction plans.
20. **The docs visual/interaction system is reduced.** Fresh evidence shows a long undifferentiated sidebar, sparse article body, weak source-action presentation, and missing code/reference interactions compared with the approved reference mockup.
21. **Accessibility evidence is too narrow.** One docs page is axe-tested. Header, mobile sheet, search keyboard loop/focus return, projects filters, newsletter states, legal pages, high-contrast/forced-colors, reduced motion, zoom, and screen-reader flows remain unproven.
22. **Visual regression evidence is stale and failing.** All three stored homepage baselines fail. A hydration warning appeared during Playwright screenshot capture; because Playwright injects caret-hiding styles, this must be diagnosed before treating it as an application defect.

### P1 — Security, resilience, and operations

23. **CSP is not production-strict.** `script-src` includes `'unsafe-inline'`; the check only rejects the exact `unsafe-eval` token. Nonce/hash strategy and production header behavior are not browser-tested.
24. **Newsletter abuse controls are not production-grade.** The in-memory limiter is single-process and non-durable, missing-origin requests are accepted, and the implementation has no provider idempotency or delivery audit trail.
25. **Monitoring and rollback are manifests, not evidence.** Synthetic monitoring and rollback are marked pending; no production alert, incident, immutable artifact selection, or drill result exists.
26. **Container evidence is historical and not part of current CI.** The Dockerfile is non-root and has a health check, but current reproducible Linux build/runtime, image scan, size, SBOM, provenance, and rollback identity are not gated.

### P2 — Maintainability and quality depth

27. **Formatting coverage is manually enumerated and incomplete.** New or unlisted files can bypass the formatter gate.
28. **Test fixtures are incomplete.** The ingestion suite lacks the planned frontmatter, link/anchor, asset collision/size, duplicate ID/slug, redirects, version selectors, code examples, diagrams, schema, and remote adapter cases.
29. **Generated artifacts need clearer ownership.** `apps/web/.source` breaks lint, and `apps/web/tsconfig.tsbuildinfo` is present in the source tree. Generated paths need deterministic creation, ignore rules, and CI regeneration checks.
30. **Documentation and readiness reports contain stale milestone history.** Page counts, test counts, framework versions, and “local milestone” language are duplicated across reports rather than derived from one current evidence record.

## Remediation sequence

### Phase 0 — Rebuild truth and traceability

1. Parse every plan Markdown file into a requirement register with stable IDs.
2. Add every master-prompt and definition-of-done requirement that is not already represented.
3. Record `implemented`, `partial`, `blocked-external`, `not-started`, or `not-applicable` for each requirement.
4. Attach exact implementation files, tests, commands, screenshots, and external evidence IDs.
5. Replace historical readiness prose with a generated current-state summary derived from that register.

Acceptance: every one of the 89 plan files has at least one reviewed ledger entry; no requirement is marked complete without evidence; contradictions between bounded task prompts and the full brief are explicit.

### Phase 1 — Make local gates truthful and green

1. Define generated-file ownership for `.source`, `.next`, TypeScript build info, docs artifacts, and browser results.
2. Make formatting and linting repository-wide with deliberate generated/vendor exclusions.
3. Replace presence-only security, SEO, performance, and rollback checks with behavioral assertions.
4. Add route/link crawling, metadata/canonical verification, sitemap coverage, feed schema checks, and failure-path tests.
5. Add browser smoke, axe, visual, Lighthouse, Docker, and SBOM jobs to CI with artifact retention.

Acceptance: all local gates pass from a clean checkout; each check fails when its protected behavior is intentionally broken in a test fixture.

### Phase 2 — Complete the shared shell and visual system

1. Resolve font and media rights, then use the approved `next/font`, logo, icon, still-life, and project/news media assets.
2. Implement user-selectable light/dark/system theme without flash.
3. Complete desktop and mobile utilities: search, GitHub, theme, project shortcuts, legal links, and Get involved only after its destination is approved.
4. Bring homepage, project, docs, governance, news, and search templates into measured agreement with supplied mockups while preserving truthful content.
5. Replace text-symbol icons and CSS-art placeholders with approved assets or the selected icon library.

Acceptance: all 13 supplied mockup surfaces have approved desktop/mobile comparison evidence; no visible placeholder remains on a launch surface unless explicitly approved as product copy.

### Phase 3 — Complete models and public content surfaces

1. Separate project maturity from health and implement the full vocabularies and transition rules.
2. Complete project, release, roadmap, governance, people, funding, report, policy, correction, and news schemas.
3. Add required project index/detail/filter/list states and cross-link RFCs, decisions, releases, docs, news, and dependencies.
4. Populate only owner-approved facts and preserve unpublished/preview exclusion.

Acceptance: schema tests cover valid/invalid transitions; every public record has provenance, review state, canonical URL, and required factual approvals.

### Phase 4 — Complete documentation ingestion and Fumadocs

1. Route every supported source through one Fumadocs-based rendering contract.
2. Implement full source adapters, immutable refs, sparse checkout, lock records, path/link rewriting, asset collision/size handling, and nightly drift detection.
3. Add taxonomy, project/version selectors, archived versions, breadcrumbs, TOC, previous/next, page actions, code tabs/copy, Shiki, requirements, schemas, downloads, diagrams, warnings, raw Markdown, and AI outputs.
4. Expand fixtures and contract tests for every source type and failure mode.

Acceptance: central and project docs have equivalent capabilities; immutable historical routes remain stable; all docs links/assets validate from a clean build.

### Phase 5 — Complete search, newsletter, and publication

1. Implement resilient provider orchestration: Typesense with timeout/circuit behavior and automatic static fallback.
2. Implement normalized facets, ranking, exact ID matches, keyboard results UI, index aliases/build IDs, preview isolation, and observability.
3. Implement the server-only Kit adapter, disabled/configured UI state, idempotency, rate-limit strategy, consent audit fields, and failure handling.
4. Implement scheduled publishing, corrections, release/news generation, feed validation, and external syndication receipts.

Acceptance: provider outage tests prove uninterrupted static search; a sandbox Kit round-trip is evidenced; drafts and previews never enter production search or feeds.

### Phase 6 — Harden, measure, and release

1. Tighten CSP with nonce/hash strategy and test production response headers.
2. Complete representative axe, keyboard, screen-reader, zoom, forced-colors, reduced-motion, and mobile accessibility evidence.
3. Run Lighthouse CI on representative route groups with plan-aligned blocking thresholds and multiple runs.
4. Build and scan the production image, generate an SBOM, attach provenance, identify the immutable artifact, and verify non-root runtime/health.
5. Execute the external activation plan only after the owner prerequisites in `OWNER_ACTIONS_REQUIRED.md` are complete.

Acceptance: the evidence bundle in `LAUNCH_EVIDENCE_PLAN.md` is complete and linked from the traceability ledger; rollback is proven against an immutable known-good artifact.

## Explicit non-actions in this audit

- No source defect was fixed.
- No snapshot was updated.
- No dependency was installed.
- No provider, credential, repository, DNS, TLS, deployment, monitoring, or release state was changed.
- No legal, factual, institutional, licensing, or media-rights claim was approved.
