# Phased Implementation Plan

## Phase 0 — Confirm and bootstrap

### Outcomes

- Create architecture decision records from this pack.
- Confirm legal wording and license plan.
- Create public repositories when approved.
- Establish workspace, CI, and Tower project.

### Tasks

- Create `PaperAndSlate/paperandslate.org`.
- Optionally create `PaperAndSlate/standards` with a README and project skeleton.
- Configure pnpm/Turborepo.
- Add license, security, code of conduct, contributing, and trademark placeholders.
- Add strict TypeScript, linting, formatting, tests, and dependency automation.
- Add Tower web preview deployment.
- Create environment schema.

### Exit criteria

- Main builds a blank but branded shell.
- Pull requests receive preview URLs.
- No database or auth dependencies exist.

## Phase 1 — Brand and design foundation

### Outcomes

- Production logo assets integrated.
- Tokens, fonts, themes, and core primitives implemented.
- Component development environment or design-system docs available.

### Tasks

- Add SVG logos from this pack.
- Configure Bodoni Moda, Inter, IBM Plex Mono.
- Implement semantic tokens.
- Initialize shadcn/ui with selected style and neutral base.
- Build buttons, links, badges, cards, forms, dialogs, sheets, command search shell, code blocks, callouts, and layout primitives.
- Implement header/footer and responsive navigation.
- Add accessibility baseline and dark theme.

### Exit criteria

- Component board reproduced with responsive and dark variants.
- Automated accessibility checks pass for primitives.

## Phase 2 — Public site MVP

### Outcomes

- Homepage, Foundation, Projects, Governance, News, and utility routes exist.
- Content is Git-backed and validated.

### Tasks

- Implement content schemas and loaders.
- Build homepage.
- Build Foundation pages.
- Build project registry and project detail template.
- Build governance index and policy template.
- Build news index/article template.
- Build roadmap, people, funding, reports, contact.
- Build legal/accessibility/security pages.
- Generate metadata and Open Graph images.
- Add RSS, Atom, and JSON Feed.

### Exit criteria

- Public site is complete without docs ingestion.
- All content is factual or explicitly planned.
- Lighthouse and accessibility targets are met on representative pages.

## Phase 3 — Documentation core

### Outcomes

- `/docs` is a distinct branded experience.
- Central documentation works through Fumadocs.
- Version/project navigation exists.

### Tasks

- Integrate Fumadocs packages.
- Implement docs shell, sidebar, project selector, version selector, TOC, page actions, code components, requirement components, and dark mode.
- Add central Getting Started, Concepts, and Governance docs.
- Add `llms.txt`, `llms-full.txt`, and Markdown views.
- Implement print styles.

### Exit criteria

- Central docs are usable and searchable with local static search.
- Source and page metadata render correctly.

## Phase 4 — Cross-repository docs ingestion

### Outcomes

- Project docs load from the standards monorepo.
- Builds are reproducible and safe.

### Tasks

- Implement docs source registry.
- Implement local/git/fixture adapters.
- Add sparse checkout, lock file, source provenance, MDX allowlist, link rewriting, asset copying, collision detection, and validation.
- Add source diff report.
- Add GitHub repository dispatch from standards repo.
- Add nightly drift rebuild.

### Exit criteria

- At least one real project is imported from a source repository.
- A malicious fixture cannot execute or escape its source root.
- Source SHA appears on every imported page.

## Phase 5 — Unified search and publishing

### Outcomes

- One search covers public pages and docs.
- Newsletters can be enabled by configuration.

### Tasks

- Provision Tower Typesense.
- Implement normalized search records and indexer.
- Implement global search dialog, facets, exact field/RFC ranking, static fallback, and search analytics.
- Implement Kit route and disabled state.
- Add scheduled publishing.
- Add zero-result reporting.

### Exit criteria

- Hosted search can fail without breaking navigation.
- Kit secrets remain server-only.
- Preview content never enters production search.

## Phase 6 — Governance and release readiness

### Outcomes

- Public governance is operational, not decorative.

### Tasks

- Publish charter, governance, RFC process, project lifecycle, maintainers, contribution, security, conflicts, licenses, trademarks, and funding.
- Add RFC and decision registries.
- Create templates and commands.
- Exercise the process with initial RFCs.
- Add project release/version manifests.

### Exit criteria

- A contributor can determine how to propose and review a material change.
- Current authority is explicit.
- Project maturity has evidence and rules.

## Phase 7 — Launch hardening

### Outcomes

- Production-quality release.

### Tasks

- Full accessibility review.
- Browser/device matrix.
- Lighthouse and bundle budgets.
- Security headers/CSP.
- Dependency/SBOM scans.
- Link and content audit.
- SEO/sitemap/structured data validation.
- Synthetic monitors and rollback drill.
- Privacy and legal review.
- Content freeze and launch plan.

### Exit criteria

- Launch checklist complete.
- Production and search rollback tested.
- No unresolved critical accessibility/security/content issue.

## Phase 8 — Post-launch tools

Prioritize based on real use:

- schema explorer enhancements;
- client-side validators;
- discovery generator;
- data-model diagrams;
- conformance fixtures;
- future Developer Platform docs.

Do not begin authentication or API implementation solely because the navigation reserves it.

## DCP-0 — Non-production Developer Control Plane foundation

After the public-site/RC3 phase, accept only the successor decision, architecture plan, Data Platform projection receipt, disabled Tower intent, and isolated requirements evidence. Before any implementation, require a provider-selection review, threat model, privacy/security approval, database/migration plan, transport decision, contract fixtures, and explicit external authority. DCP-0 does not reopen RC3 or provision infrastructure.

## DCP-1A — Fixture-gated control-plane kernel

Build the repository-only Web-owned kernel behind disabled-by-default flags. Pin Better Auth core, its organization plugin, and direct PostgreSQL support for database-backed fixture evaluation. Implement organization/project ownership, explicit RBAC authorization, metadata-only API-key lifecycle orchestration behind an unselected provider port, redacted audit plus transactional outbox, UUIDv7 identities, monotonic policy versions, retention, metrics, and deterministic migration intent.

DCP-1A has no public route or UI, no real signup/email/OAuth, no API-key scheme, no Data wire mapping or network transport, no provider credentials, no database connection/application, and no Tower mutation. Its exit proof is focused source, architecture, migration, security, requirements, type, lint, and test evidence that leaves RC3 classifications unchanged.

## DCP-1B — Projection/provider integration (gated)

Do not begin DCP-1B until Web accepts an immutable Data-owned projection receipt and the owners agree ID mapping, scope mapping, policy versioning, verifier/provider material, rotation/revocation behavior, transport authentication, replay, secret binding, and joint fixtures. Runtime provider, database, Tower, staging, UI, production, and release work each require their own authority and evidence.
