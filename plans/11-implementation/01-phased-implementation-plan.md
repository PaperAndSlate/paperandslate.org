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

## DCP-1A.5 — Projection/verifier contract proposal (documentation only)

Record a **Proposed** Web-owned v3 contract before any DCP-1B implementation. Keep `policy_version` as a finite positive authorization-state version distinct from the finite positive per-organization `organization_sequence` delivery order. Define strict lifecycle events for verifier publication, rotation, revoke, project activation/disable, organization disable, scope/policy change, and heartbeat; exact duplicate/replay behavior; and fail-closed gap, rollback, stale, mismatched-duplicate, and unknown-version handling.

Define an opaque versioned non-plaintext verifier descriptor and immutable non-secret `key_ref` shape without selecting a production key format or algorithm. Record Web transaction/outbox/audit/compensation ownership, Data validation/application/constant-time-verification ownership, conditional Better Auth 1.7.2 Web primitives, transport and managed-secret design inputs, and joint fixture owners. Reject the synthetic Data v2 `hmac-sha256-v1` fixture and string policy values as production semantics.

The Proposed candidate freezes `projection_version: "3.0.0"`, lowercase UUIDv7 control identifiers, and independent safe integer counters in `1..9007199254740991`. Every authorization-affecting mutation allocates the next `policy_version` and `organization_sequence` atomically; a heartbeat allocates only the next organization sequence and carries the current policy version. Counters cannot be zero, fractional, non-finite, negative, reset, wrapped, or reused. The closed event set is exactly `key.verifier_published`, `key.rotated`, `key.revoked`, `project.activated`, `project.disabled`, `organization.disabled`, `key.policy_changed`, and `projection.heartbeat`, with no v2 aliases or implicit plaintext/reason events.

The envelope requires strict event-specific objects and exact identity/null rules: key events require organization/project/key IDs; project events require organization/project and `key_id: null`; organization-disabled and heartbeat require both project and key IDs null. Publication has active state, non-empty sorted unique scopes, nullable expiry, and the opaque descriptor; rotation has distinct predecessor/replacement IDs and an end exactly 86,400 seconds after `committed_at`; revoke, project activation/disable, and organization disable use `{}`; policy change carries sorted unique scopes and may use `[]` to deny all; heartbeat carries a watermark equal to its sequence. Wire payloads contain no reason metadata. The reviewed scope map is exactly `data:read → data.read`, `provenance:read → provenance.read`, `bulk:read → bulk.read`, and `geometry:read → geometry.read`; only GET/HEAD read capabilities are eligible.

Events and acknowledgements use RFC 8785 JSON Canonicalization Scheme, UTF-8 without BOM, exact UTC `Z` timestamps, and `canonical_event_digest = sha256:<64 lowercase hex>` over canonical event bytes. The durable `1.0.0` acknowledgement includes projection version, event ID, organization ID, sequence, canonical digest, outcome (`applied|quarantined`), closed/null reason code, and decision time. Exact duplicates return the original acknowledgement bytes; mismatched duplicates quarantine; malformed, unknown, stale, gap, rollback, unavailable-verifier, and unknown-binding cases fail closed without state mutation. Delivery is at-least-once, strict-next-sequence, and replay begins at the last durable acknowledgement plus one using original bytes. Revocation/disable cannot be undone; heartbeat watermark equality and the 60-second stale limit apply, with 30/45/60-second thresholds remaining acceptance inputs rather than monitoring evidence.

DCP-1A.5 is complete only as a reviewed documentation proposal. It does not accept the provider, implement the mapping, bind transport or secrets, connect a database, mount routes/UI, mutate Tower, activate DCP-1B, or authorize deployment, release, publication, or production. Acceptance requires immutable Web/Data proposal identities, provider/security/privacy review, joint fixtures, and explicit coordinator authority for the next bounded phase.

## DCP-1B — Projection/provider integration (gated)

Do not begin DCP-1B until Web and Data accept immutable identities for the Proposed v3 contract, the owners approve numeric policy and sequence semantics plus lifecycle mapping, Security approves a production verifier-scheme registry and `key_ref` binding, transport authentication and managed-secret design are accepted, and joint fixtures plus independent security/privacy receipts pass. Data T681 remains producer-local v2 evidence only. Runtime provider, database, Tower, staging, UI, production, and release work each require their own authority and evidence.
