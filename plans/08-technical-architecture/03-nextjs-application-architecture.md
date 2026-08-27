# Next.js Application Architecture

## Rendering strategy

Use static generation and React Server Components by default.

### Static or revalidated

- homepage;
- foundation pages;
- projects;
- governance;
- RFCs;
- news;
- documentation;
- feeds;
- sitemaps;
- Open Graph images where possible.

### Dynamic

- newsletter route;
- hosted search proxy only if direct search-only client access is not used;
- preview mode;
- future interactive validators requiring server fetches.

## Route groups

```text
app/
├── (public)/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── foundation/
│   ├── projects/
│   ├── governance/
│   └── news/
├── (docs)/
│   └── docs/
├── api/
├── feeds/
└── ...metadata routes
```

The root layout owns fonts, global metadata, analytics, and the universal theme bootstrap. Public and docs layouts own their shells.

## Server Components

Server Components should handle:

- content loading;
- project registries;
- docs page trees;
- metadata;
- feed generation;
- article rendering;
- static search-record generation;
- related-content queries.

Client Components should be limited to:

- mobile navigation;
- search dialog;
- theme control;
- project/version selectors when interactive;
- tabs/accordions;
- copy controls;
- newsletter form;
- future playgrounds.

## Data access

Do not use ad hoc filesystem reads throughout page components. Provide typed loaders:

```ts
getFoundationPage(slug)
getProjects(filters?)
getProject(id)
getNewsPosts(query?)
getRFCs(query?)
getDocsPage(slug, version?)
getDocsTree(project?, version?)
```

Loaders return presentation-safe typed models and centralize draft filtering, dates, aliases, and errors.

## Caching

- Content loaded from build-time files can be static.
- External source ingestion occurs before `next build`, not inside a user request.
- Newsletter responses are never cached.
- Search index metadata may use appropriate cache headers.
- Feeds and sitemap revalidate on content deployments.

## Metadata

Use Next.js metadata APIs for:

- canonical;
- title templates;
- description;
- Open Graph;
- social cards;
- alternates and feeds;
- robots;
- structured data through rendered JSON-LD.

## Error boundaries

- root error;
- docs source unavailable boundary;
- search provider degraded state;
- newsletter form error;
- not-found by content type;
- unsupported docs version.

## Preview mode

Preview deployments should render drafts based on an explicit build environment. Do not expose draft bypass cookies publicly unless a secure editorial preview system is later required.

## Static export

Do not require full static export. The application can be deployed as a Next.js server in standalone mode. Maintain static-friendly page design so provider migration remains easy.

## Configuration

Validate environment variables at startup/build with Zod. Separate public and server-only environment definitions.
