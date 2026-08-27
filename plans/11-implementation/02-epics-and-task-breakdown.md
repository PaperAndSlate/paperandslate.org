# Epics and Task Breakdown

## Epic A — Repository and platform foundation

- Initialize pnpm workspace and Turborepo.
- Create Next.js app.
- Configure strict TypeScript.
- Configure formatter/linter.
- Configure Vitest and Playwright.
- Add environment validation.
- Add Dockerfile and health route.
- Configure GitHub Actions.
- Configure Tower previews.
- Add CODEOWNERS and templates.

## Epic B — Brand and design system

- Import logo SVGs.
- Create logo component and allowed lockups.
- Configure fonts.
- Create light/dark tokens.
- Implement layout primitives.
- Add shadcn primitives.
- Implement status system.
- Implement editorial typography.
- Implement responsive header/footer.
- Implement mobile navigation.
- Build component documentation.
- Add visual regression baselines.

## Epic C — Content platform

- Define Zod schemas.
- Implement collection loaders.
- Implement draft/scheduled rules.
- Implement asset metadata and image helpers.
- Implement content CLI.
- Add spelling/domain dictionary.
- Add content fixtures and validation.
- Implement redirects registry.

## Epic D — Public foundation site

- Homepage.
- Foundation index.
- Mission.
- Principles.
- People.
- Funding.
- Roadmap.
- Reports.
- Contact.
- Project registry.
- Project detail.
- Governance index.
- Policy template.
- RFC registry/detail.
- Decision registry/detail.
- News index/article.
- Utility/legal routes.
- 404/error states.

## Epic E — Documentation application

- Fumadocs configuration.
- Docs route group/layout.
- Docs sidebar and mobile drawer.
- Project and version selectors.
- Table of contents.
- Page actions.
- Code block and code groups.
- Callouts/steps/tabs.
- Requirement component.
- Property reference component.
- Source provenance.
- Previous/next.
- Print styles.
- Docs dark mode.
- AI-readable outputs.

## Epic F — Docs ingestion

- Source registry schema.
- Local adapter.
- Git adapter.
- Fixture adapter.
- Lock file.
- File collection.
- Safe MDX parser.
- Include resolver.
- Link resolver.
- Asset processor.
- Frontmatter normalization.
- Collision detection.
- Stable/draft severity policies.
- Diff report.
- GitHub dispatch.
- Nightly rebuild.

## Epic G — Search

- Search record schema.
- Index extraction.
- Static provider.
- Typesense provisioning.
- Typesense provider.
- Index alias strategy.
- Global command dialog.
- Search result design.
- Filters/facets.
- Exact property and RFC ranking.
- Zero-result state.
- Analytics.
- Degraded fallback.

## Epic H — Publishing and feeds

- Content creation command.
- Preview banner.
- Scheduled publishing.
- RSS.
- Atom.
- JSON Feed.
- Kit server route.
- Newsletter form.
- Correction notices.
- Release post template.
- RFC notice template.

## Epic I — Quality and trust

- WCAG test plan.
- CSP and security headers.
- Privacy policy.
- Accessibility statement.
- Security policy.
- License/trademark pages.
- SEO metadata.
- JSON-LD.
- Sitemap/robots.
- Open Graph generation.
- Lighthouse CI.
- GlitchTip.
- Synthetic monitors.
- Rollback drill.

## Suggested implementation sequencing

Parallelizable after foundation:

- Public content templates and design-system components.
- Docs shell and ingestion fixtures.
- Governance content drafting.

Do not parallelize before schemas and route decisions are stable:

- search indexing;
- project registry ingestion;
- version selectors;
- social metadata.
