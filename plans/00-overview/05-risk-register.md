# Risk Register

| Risk | Impact | Likelihood | Mitigation |
|---|---:|---:|---|
| The site looks established while the work is not implemented | High | High | Display explicit project maturity, versions, and “planned” state. Avoid fabricated adoption claims. |
| Paper & Slate is mistaken for an incorporated nonprofit | High | Medium | Use accurate legal wording and a legal-status note. Do not use charity or tax-deductible language. |
| Aggregated docs drift from source repositories | High | Medium | Import at build time, pin source refs, show SHA, trigger rebuilds, and run nightly drift checks. |
| Project docs execute arbitrary MDX code | High | Medium | Treat imported content as data; use an allowlisted component set and reject arbitrary imports/exports. |
| One global version selector incorrectly couples projects | Medium | High | Version each project independently and scope selectors to the current project. |
| Premature standards appear authoritative | High | High | Use Planned, Experimental, Draft, Candidate, and Stable labels in all search and navigation surfaces. |
| Governance becomes ceremonial or misleading | Medium | Medium | Publish current founder authority plainly and add roles only when people actually hold them. |
| Dual GitHub/Forgejo origins diverge | High | Medium | Keep GitHub canonical; make Forgejo a read-only mirror only. |
| Search infrastructure adds unnecessary complexity | Medium | Medium | Define a provider interface and retain a static fallback. Avoid making page rendering depend on search. |
| Visual texture harms accessibility or performance | Medium | Medium | Use CSS texture at low contrast, raster assets only when needed, and test contrast on textured surfaces. |
| High-contrast display font reduces readability | Medium | Medium | Restrict Bodoni Moda to short headings. Use Inter for body and documentation. |
| News workflow is too technical for regular publishing | Medium | Medium | Provide templates, validation, local preview, scheduled drafts, and one-command post creation. |
| Kit credentials leak to the client | High | Low | Submit through a server route; keep API keys in Infisical/server environment only. |
| Imported links point to unstable branches | Medium | High | Rewrite source-relative links, pin docs builds to refs, and validate every route. |
| A standards monorepo becomes tightly coupled | Medium | Medium | Maintain per-project manifests, versions, changelogs, maintainers, and release workflows. |
| The app becomes over-engineered before content exists | High | Medium | Build static-first, skip databases and queues, and phase interactive tools after launch. |
