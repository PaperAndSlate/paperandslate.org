# Paper & Slate Public Website and Documentation System

This pack is the implementation blueprint for the first public Paper & Slate product: a polished foundation website and a unified documentation system built with Next.js.

Paper & Slate is positioned as **an open educational infrastructure foundation**. The initial site presents the initiative as mature and deliberate without falsely claiming registered nonprofit status. Its primary audience is developers and implementers, followed by educators, schools and districts, education software companies, government data organizations, researchers, standards contributors, and the general public.

## Primary architectural decision

Launch the public website and documentation system as **one deployable Next.js application on `paperandslate.org`**, with documentation at `/docs` and strongly separated route groups, layouts, content pipelines, and UI shells.

This gives Paper & Slate:

- one coherent domain and search experience;
- stronger SEO and simpler analytics;
- one design system and one deployment pipeline;
- shared project, version, governance, and status metadata;
- a clean path to split documentation onto `docs.paperandslate.org` later if operational scale or team ownership warrants it.

The documentation remains decentralized at the source. Project-specific docs live beside each project in the Paper & Slate standards monorepo or another approved project repository. A controlled registry and build-time ingestion pipeline assemble those sources into `/docs`.

## Recommended technology

- Next.js App Router, TypeScript, React Server Components
- pnpm workspaces and Turborepo
- Tailwind CSS 4
- shadcn/ui as source-owned interface primitives
- Fumadocs Core, UI, and MDX for the documentation layer
- Phosphor Icons
- Bodoni Moda, Inter, and IBM Plex Mono through `next/font`
- MDX and validated frontmatter for public content
- Typesense for unified search when Tower infrastructure is available, with a static search fallback
- GitHub as the public source of truth
- Tower/Coolify for development and preview infrastructure

## Pack structure

| Directory | Purpose |
|---|---|
| `00-overview` | Executive decisions, scope, metrics, and risks |
| `01-strategy` | Positioning, audiences, principles, voice, and trust |
| `02-information-architecture` | Sitemap, navigation, routes, and content models |
| `03-public-site` | Detailed specifications for every public page family |
| `04-documentation-system` | Docs taxonomy, source ingestion, versioning, search, and tools |
| `05-content-and-publishing` | MDX structure, news workflow, Kit, feeds, and templates |
| `06-governance` | Governance model, RFC process, lifecycle, policies, and licensing |
| `07-design-system` | Brand system, tokens, components, layouts, and mockup index |
| `08-technical-architecture` | Next.js, repository, security, performance, and observability |
| `09-infrastructure-and-deployment` | Tower resources, deployment, CI/CD, secrets, Git strategy |
| `10-quality-and-operations` | Accessibility, SEO, testing, content quality, and operations |
| `11-implementation` | Phases, epics, acceptance criteria, launch checklist, master prompt |
| `12-reference` | Examples for registries, frontmatter, environments, manifests, ADRs |
| `assets` | Logos, brand board, page mockups, source mockups, and concept boards |

## Visual assets

The pack includes transparent SVG and PNG logo exports in light and dark themes:

- icon-only;
- horizontal lockup;
- stacked lockup;
- small icon sizes for favicons and application icons.

It also includes representative mockups for:

- homepage, light and dark;
- mobile homepage;
- foundation and mission;
- projects index and project detail;
- governance and RFC presentation;
- news index and article;
- documentation home and reference page;
- global search;
- component library;
- complete brand board.

## Suggested repository names

Do not create these automatically until implementation begins:

- `PaperAndSlate/paperandslate.org` — public website and documentation application
- `PaperAndSlate/standards` — standards monorepo and project-owned documentation

GitHub should be the public canonical origin. A normal local clone is sufficient. Tower Forgejo can later be configured as a read-only mirror or operational backup, but Paper & Slate should not have two writable canonical origins.

## Recommended reading order

1. `00-overview/01-executive-summary.md`
2. `00-overview/02-key-decisions.md`
3. `02-information-architecture/01-site-map.md`
4. `04-documentation-system/01-documentation-product-strategy.md`
5. `08-technical-architecture/01-technology-stack.md`
6. `09-infrastructure-and-deployment/01-tower-development-infrastructure.md`
7. `11-implementation/01-phased-implementation-plan.md`
8. `11-implementation/05-master-implementation-prompt.md`

## Important legal wording

Until Paper & Slate is incorporated as a nonprofit, public copy must not claim that it is a registered charity, tax-exempt organization, or legally incorporated foundation. It may accurately describe itself as an independent open-foundation initiative and use “Paper & Slate” as its brand identity.
