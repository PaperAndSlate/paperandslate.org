# Master Implementation Prompt

Use the following prompt in Codex Goal Mode after placing this planning pack in or beside the target repository.

---

Build the complete Paper & Slate public website and documentation system described in this planning pack.

Paper & Slate is an open educational infrastructure foundation. The primary audience is developers and implementers, followed by educators, schools and districts, education software companies, government data organizations, researchers, standards contributors, and the general public.

Read every Markdown file in this pack before changing code. Treat the pack as the product and architecture specification. If two files conflict, follow `00-overview/02-key-decisions.md`, then record the conflict and your resolution in an ADR.

## Required outcome

Create a production-quality Next.js application for `paperandslate.org` containing:

- public foundation website;
- mission, principles, people, funding, roadmap, reports, contact;
- project registry and project detail pages;
- governance, RFC, decision, policy, maintainer, and contribution pages;
- News & Updates with Git-backed MDX, feeds, corrections, scheduling, and Kit integration point;
- a distinct `/docs` experience using Fumadocs;
- safe cross-repository documentation ingestion;
- independent project versioning;
- unified global search;
- dark mode for docs;
- accessibility, SEO, monitoring, testing, CI/CD, and Tower deployment configuration.

Do not implement authentication, API keys, an API console, billing, organization claims, or a database-backed CMS.

## Architecture

Use:

- Next.js App Router and strict TypeScript;
- pnpm workspaces and Turborepo;
- Tailwind CSS 4;
- shadcn/ui as source-owned primitives;
- Fumadocs Core/UI/MDX;
- Phosphor Icons;
- Bodoni Moda, Inter, IBM Plex Mono through `next/font`;
- Zod content schemas;
- Vitest, Testing Library, Playwright, axe, and Lighthouse CI;
- Docker/standalone Next.js deployment;
- Typesense provider plus static fallback.

Use GitHub as canonical source. Do not configure bidirectional Forgejo mirroring.

## Visual implementation

Use the logo assets under `assets/logos`. Do not recreate the wordmark with live type.

Follow:

- `07-design-system/01-brand-guide.md`;
- `07-design-system/02-design-tokens.md`;
- `07-design-system/03-component-inventory.md`;
- page mockups under `assets/mockups`.

The public site should have a restrained paper/linen editorial character. Documentation should share the brand but be denser and less decorative.

## Content and truthfulness

- Use an ampersand: Paper & Slate.
- Present the initiative as established through quality and governance.
- Do not claim registered nonprofit, charity, 501(c)(3), a formal board, sponsors, implementations, or adoption unless facts exist in repository content.
- Label every unfinished project Planned, Experimental, Draft, or Candidate.
- Hide incomplete institutional pages rather than invent content.

## Documentation ingestion

Implement the exact source-ownership and ingestion model in `04-documentation-system` and `08-technical-architecture/04-content-pipeline-implementation.md`.

Imported MDX is untrusted data:

- reject arbitrary imports/exports;
- allowlist components;
- prevent path traversal;
- sanitize unsafe HTML/SVG;
- record repository/path/ref/SHA;
- generate a lock file;
- fail on route collisions and broken stable internal links.

Support local sibling-repository mode and registered Git source mode.

## Search

Implement a provider abstraction. Use Tower Typesense when available and a static fallback otherwise. Index public pages, docs, sections, schema properties, requirement IDs, projects, RFCs, decisions, and news.

## Tower

You may use the Tower plugin to create development infrastructure:

- one web workload;
- Typesense;
- Infisical bindings;
- preview environments;
- GlitchTip;
- synthetic monitors;
- image/SBOM/vulnerability reports.

Do not provision PostgreSQL, Valkey, RabbitMQ, S3, Qdrant, Inngest, or Keycloak unless a concrete requirement in the implemented phase justifies it and the decision is documented.

## Implementation behavior

1. Inspect the current repository first.
2. Create an implementation ledger mapping every plan requirement to files/tests.
3. Implement in phases from `11-implementation/01-phased-implementation-plan.md`.
4. Keep commits logically scoped if commits are authorized; otherwise do not commit.
5. Test every phase.
6. Preserve strict accessibility and performance budgets.
7. Create ADRs for meaningful deviations.
8. Do not silently skip requirements.
9. If a factual content value is unknown, use a clearly marked content TODO in a non-public fixture or hide the page; do not invent public facts.
10. Finish with a complete report: architecture, routes, content sources, Tower resources, tests, remaining factual-content needs, and launch readiness.

## Repository creation

If the target repository does not exist, ask for approval before creating or committing to `PaperAndSlate/paperandslate.org`. A blank repository or minimal README may be created only with explicit authorization.

---
