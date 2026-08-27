# Documentation and Global Search

## Search scope

One search interface should index:

- foundation pages;
- project records;
- documentation pages;
- headings and sections;
- schema properties;
- requirement IDs;
- RFCs;
- decisions;
- news and releases;
- people and maintainers where public.

## Search provider architecture

Define an interface:

```ts
interface SearchProvider {
  search(query: string, options: SearchOptions): Promise<SearchResponse>
  suggest?(query: string, options: SuggestOptions): Promise<Suggestion[]>
  health?(): Promise<SearchHealth>
}
```

Implementations:

- `StaticSearchProvider` for local development and fallback;
- `TypesenseSearchProvider` for hosted unified search.

The UI must not know which provider is active.

## Why Typesense fits Tower

Tower can provision a project-scoped Typesense collection with separate write and search-only keys. It provides typo tolerance, filters, facets, ranking, and autocomplete without requiring a relational database.

Search remains optional to rendering: a Typesense outage must not take the site down.

## Search record

```ts
interface SearchRecord {
  id: string
  type: 'page' | 'project' | 'doc' | 'section' | 'schema-property' | 'requirement' | 'rfc' | 'decision' | 'news'
  title: string
  summary?: string
  body?: string
  url: string
  breadcrumb: string[]
  projectId?: string
  version?: string
  status?: string
  docType?: string
  tags: string[]
  headings?: string[]
  aliases?: string[]
  sourceSha?: string
  updatedAt?: number
  rankBoost: number
}
```

## Ranking rules

Highest boosts:

1. exact project name;
2. exact schema property path;
3. exact requirement ID;
4. exact RFC number;
5. title prefix;
6. latest stable docs;
7. current draft when no stable exists;
8. body match.

Lower ranking:

- archived docs;
- old news;
- unsupported versions;
- repeated section fragments.

## Query behaviors

Examples:

- `provenance` — concepts, property reference, guides, RFCs.
- `RFC-0002` — direct RFC result first.
- `organization.parent` — exact schema property first.
- `.well-known` — Discovery project and implementation guide.
- `v1.0` — version facet, not a dominant free-text term.

## Search UI

Keyboard:

- open with `Cmd/Ctrl + K`;
- arrow navigation;
- Enter opens;
- Escape closes;
- focus returns to trigger.

Visual result includes:

- icon/content type;
- title;
- breadcrumb;
- project;
- maturity/version;
- highlighted match.

## Zero-result handling

Show:

- spelling suggestions;
- project filters to clear;
- links to project registry and docs home;
- an optional privacy-safe “report missing documentation” action.

Track zero-result queries without storing user identifiers.

## Index lifecycle

1. Build normalized search records.
2. Validate unique IDs and URLs.
3. Upload to a temporary collection or alias target.
4. Run smoke queries.
5. Atomically switch alias.
6. Retain previous index for rollback.

## Static fallback

Generate a compressed JSON index for latest public content. It may omit full historical docs to control bundle size. Load it lazily only when search opens.
