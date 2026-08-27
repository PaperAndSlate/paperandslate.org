# Search Technical Architecture

## Components

```text
Content loaders
    ↓
Normalized search records
    ├── Static index artifact
    └── Typesense indexer
             ↓
        Typesense alias
             ↓
Search provider API
             ↓
Global search UI
```

## Collection design

Suggested Typesense collection fields:

```text
id                string
site              string
content_type      string facet
project_id        string facet optional
version           string facet optional
status            string facet optional
doc_type          string facet optional
title             string
summary           string optional
body              string optional
breadcrumb        string[]
headings           string[]
aliases            string[]
tags               string[] facet
url                string
rank_boost         int32
updated_at         int64 optional
```

## Query weights

Example priority:

```text
title: 10
aliases: 9
headings: 7
breadcrumb: 5
summary: 4
body: 1
```

Apply `rank_boost` for exact/high-value content and a demotion for archived versions.

## Security

- browser receives search-only key;
- write key is server/CI only in Infisical;
- collection is read-only from client;
- query length and result size are bounded;
- no private or preview content in production index;
- drafts appear only in preview indexes;
- no email or user data is indexed.

## Index naming

Tower may provision an immutable project collection. Use environment-specific collections or aliases:

```text
paperandslate_content_dev
paperandslate_content_preview_[pr]
paperandslate_content_prod_v[build]
paperandslate_content_prod → alias
```

Adapt to Tower’s collection constraints.

## Build/deploy ordering

1. Validate content.
2. Build application.
3. Deploy candidate.
4. Run candidate health checks.
5. Upload new search index.
6. Run smoke queries.
7. Switch production alias.
8. Retain previous index for rollback.

If aliasing is unavailable, version records with a build ID and use atomic configuration change.

## Static fallback

Generate a minimal latest-content index. The global search client tries hosted search and falls back after a short timeout or provider health failure.

Do not flash an alarming outage message; show “Using local search; historical results may be limited.”

## Analytics

Record:

- query hash or normalized query when privacy policy permits;
- result count;
- selected result position;
- zero result;
- provider latency;
- fallback use.

Avoid persistent identifiers and raw IP storage.
