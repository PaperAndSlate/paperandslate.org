# Executive Summary

## Product to build

Build a public website and documentation platform for Paper & Slate, an open educational infrastructure foundation. The product must establish credibility with developers and institutions while making the work approachable to educators and the wider education community.

The first release intentionally excludes:

- user authentication;
- API key creation;
- hosted education-data APIs;
- school organization claims;
- billing or monetization;
- private dashboards;
- an administrative database-backed CMS.

The site should nevertheless be structured so those capabilities can be documented and introduced later without reorganizing the entire information architecture.

## Product goals

1. Explain what Paper & Slate is and why common educational infrastructure is needed.
2. Present every standard, schema, tool, and experimental project in a coherent registry.
3. Publish mission, principles, governance, funding, people, roadmap, and public policies.
4. Provide professional technical documentation assembled from project-owned source repositories.
5. Make project status, version, source, maintainers, license, and last update visible.
6. Establish public RFC and decision processes before the first standard stabilizes.
7. Support news, release notes, implementation stories, governance notices, RSS, Atom, JSON Feed, and a future Kit newsletter.
8. Provide fast, unified search across public pages, docs, RFCs, projects, news, and schema properties.
9. Meet WCAG 2.2 AA and strong performance targets.
10. Remain inexpensive and operationally simple while no authenticated product exists.

## Combined versus separate website and docs

### Recommendation

Use one Next.js application and one primary origin:

- `https://paperandslate.org/` for the public foundation experience;
- `https://paperandslate.org/docs` for documentation.

The experiences should not look identical. The public site is editorial and material: linen, paper, slate, photography, high-contrast display typography, and generous whitespace. Documentation is denser and more functional: persistent navigation, project and version selectors, code blocks, reference tables, search, and dark mode.

### Why combine at launch

- The product has one team and one publishing workflow.
- Public pages and docs share projects, versions, status, governance, and search metadata.
- A single domain improves discoverability and avoids cross-domain analytics and canonical complexity.
- One deployment is easier to secure, monitor, cache, and preview.
- Documentation can remain independently owned at the repository level without requiring a separate web application.
- There is no API console or authentication boundary requiring a different application yet.

### How to preserve the option to split later

- Put public and docs routes in separate Next.js route groups.
- Isolate docs loaders, search adapters, layouts, and components in packages.
- Avoid public-site components importing from docs route files.
- Generate canonical URLs through a domain-aware helper.
- Keep a `DOCS_BASE_URL` configuration option.
- Never rely on relative cross-boundary URLs in source documentation.

A future migration to `docs.paperandslate.org` should then be a deployment and routing decision, not a content rewrite.

## Recommended build shape

```text
paperandslate.org/
├── apps/
│   └── web/                  Next.js application
├── packages/
│   ├── design-system/        tokens and shared UI
│   ├── content/              schemas, loaders, MDX utilities
│   ├── docs-ingestion/       source registry and importer
│   ├── search/               indexing and query adapters
│   ├── config/               TypeScript, ESLint, Tailwind
│   └── testing/              shared test helpers
├── content/
│   ├── foundation/
│   ├── governance/
│   ├── news/
│   ├── projects/
│   └── docs/                 foundation-wide documentation
├── public/
├── scripts/
└── infrastructure/
```

## Main navigation

**Foundation · Projects · Documentation · Governance · News & Updates**

Persistent actions:

- global search;
- GitHub;
- theme control inside documentation;
- optional “Get involved” call to action after contribution paths exist.

## Initial project registry

The implementation should support all intended projects, even if some launch as planned or experimental:

1. Paper & Slate File System
2. `.well-known` Education Discovery
3. Educational Organization Schema
4. Course and Catalog Schema
5. Curriculum Standards Schema
6. School Website Information / Markup
7. Validators and Generators
8. SDKs and Reference Libraries
9. Future Developer Platform and APIs

Projects must never appear stable merely because the site design looks established. Each card and page displays explicit maturity.

## Core stack decision

Use Next.js 16-compatible App Router architecture, Tailwind CSS 4, shadcn/ui, Fumadocs, MDX, and a provider-neutral search layer. Fumadocs supplies the documentation primitives while Paper & Slate owns the surrounding information architecture and visual design.

## Infrastructure decision

At launch, the application does not require PostgreSQL, RabbitMQ, Valkey, Qdrant, or object storage.

Recommended Tower development resources:

- one `web` workload for the Next.js application;
- one `typesense` resource when unified search is enabled;
- Infisical secret bindings;
- preview environments;
- GlitchTip integration;
- synthetic monitors and SLOs.

Optional later resources:

- S3 for a managed media library;
- Inngest for cross-repository rebuild and indexing workflows;
- PostgreSQL only if publishing moves beyond Git-backed content.

## Launch outcome

A visitor should leave with this clear understanding:

> Paper & Slate is an open foundation building the common infrastructure education software and schools have been missing.
