# Acceptance Criteria

## Product

- The site clearly positions Paper & Slate as open educational infrastructure.
- The top navigation is Foundation, Projects, Documentation, Governance, and News & Updates.
- No page claims registered nonprofit status.
- Planned and unfinished projects are labeled.
- Users reach project docs from homepage in at most two interactions.

## Public pages

- Every route in the approved launch map has real content or is deliberately hidden.
- Project cards show type, status, and purpose.
- Project pages show source, version, status, maintainer, license, and update date.
- Governance pages state actual current authority.
- News supports categories, corrections, and feed output.
- Roadmap items show update date and horizon.

## Documentation

- Docs are visually related to the public site but optimized for reading and reference.
- Project docs can be imported from the standards monorepo.
- Every imported page shows repository, path, ref, and SHA.
- Unsafe MDX imports are rejected.
- Project versions are independent.
- Historical versions remain addressable.
- Normative pages are clearly marked.
- Search finds exact property paths and RFC numbers.
- Dark mode works without flash.
- Markdown and `llms.txt` outputs exist.

## Search

- Global search covers all content types.
- Search is keyboard accessible.
- Production can fall back when Typesense is unavailable.
- Preview/draft content does not leak into production index.
- Zero-result state is useful.

## Newsletter

- Kit integration is server-side.
- Disabled mode is graceful.
- No email appears in logs.
- Consent and privacy link exist.
- Rate limiting and honeypot are tested.

## Engineering

- Strict TypeScript passes.
- All content schemas pass.
- Internal links and anchors pass.
- Representative E2E tests pass.
- No critical axe violations.
- Lighthouse budgets pass.
- Container runs non-root.
- Secrets validated and server-only.
- Production rollback is documented and tested.

## Visual

- Brand logo is used from SVG artwork, not recreated in type.
- Typography, colors, textures, status colors, and icon style match the brand guide.
- Public pages have restrained linen/paper texture.
- Docs reduce texture behind dense reading areas.
- Mobile layouts remain complete at 390 px.
- Dark surfaces use light logo assets.

## Governance

- Governance, RFC, project lifecycle, contribution, security, code of conduct, conflicts, licensing, and trademark documents exist.
- At least one RFC is rendered through the actual system.
- Decision records identify the real decision maker.
- Maintainer list reflects real people and scopes.
