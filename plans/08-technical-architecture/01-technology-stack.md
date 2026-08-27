# Technology Stack

## Core application

- Next.js App Router
- React Server Components by default
- TypeScript in strict mode
- Node.js current supported LTS at implementation time
- pnpm workspaces
- Turborepo

Do not pin the plan to an unreleased framework version. At implementation, use the current stable Next.js release and record exact versions in the lockfile and an architecture decision record.

## Styling and UI

- Tailwind CSS 4
- shadcn/ui as source-owned primitives
- Radix/Base UI primitives only through the selected shadcn configuration where practical
- Phosphor Icons
- `next/font` for Bodoni Moda, Inter, and IBM Plex Mono
- CSS variables in OKLCH or the current shadcn token format

### Why shadcn/ui

The components are copied into the codebase rather than consumed as a rigid visual package. This fits Paper & Slate because the brand requires a custom editorial layer while still benefiting from tested dialog, command, popover, form, tab, and menu primitives.

## Documentation

- Fumadocs Core
- Fumadocs UI
- Fumadocs MDX
- approved remark/rehype plugins
- Shiki or Fumadocs-supported syntax highlighting
- JSON Schema parser/generator for property reference
- Fumadocs OpenAPI integration reserved for the future

## Content

- MDX for editorial and explanatory content
- Markdown for formal governance files where possible
- YAML or TypeScript registries for structured data
- Zod for content validation
- unified/remark/rehype for AST validation and transforms

## Search

- Provider abstraction
- Typesense hosted through Tower for production unified search
- static generated fallback for local development and degraded operation

## Forms

- React Hook Form only where forms exceed simple server-action handling
- Zod shared client/server validation
- same-origin route handler for Kit newsletter
- no broad form library required for static contact links

## Testing

- Vitest for unit and component logic
- Testing Library
- Playwright for end-to-end and visual workflows
- axe-core integration
- Lighthouse CI
- link checker
- content fixture tests

## Tooling

- ESLint with Next.js and TypeScript rules
- Prettier or Biome; choose one formatter and enforce it
- markdownlint for source docs where compatible
- cspell with Paper & Slate dictionaries
- Changesets for packages and tool releases, not necessarily for editorial content
- Renovate or Dependabot
- commit hooks only for fast checks; CI remains authoritative

## Analytics and monitoring

- privacy-conscious web analytics, provider selected during implementation;
- GlitchTip through Tower for errors;
- OpenTelemetry-compatible request correlation if server functionality grows;
- Tower synthetic monitors;
- structured server logs with secret and personal-data redaction.

## Packages to avoid initially

- database ORM;
- authentication framework;
- queue framework;
- client state-management library for global state;
- heavyweight animation framework;
- a second documentation framework;
- a second component suite;
- a browser-based CMS.

## Dependency principles

- prefer packages with active maintenance and clear licenses;
- use primary-source documentation;
- wrap framework-specific behavior behind small internal APIs;
- pin lockfile and enable automated update PRs;
- review client bundle impact;
- do not expose imported documentation to arbitrary runtime package imports.
