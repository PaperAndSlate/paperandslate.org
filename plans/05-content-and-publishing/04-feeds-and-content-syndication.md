# Feeds and Content Syndication

## Required feeds

- RSS 2.0
- Atom 1.0
- JSON Feed

Routes:

```text
/feeds/rss.xml
/feeds/atom.xml
/feeds/feed.json
```

Also expose `<link rel="alternate">` metadata in the document head.

## Feed scope

Default feed includes published News & Updates items. It may include release and RFC notices because those are news types.

Optional future feeds:

- releases only;
- RFCs only;
- project-specific updates;
- governance decisions.

Do not create empty feeds merely to reserve URLs. Redirect or introduce them when they have value.

## Feed fields

- stable ID/GUID;
- canonical URL;
- title;
- summary;
- full content when licensing and rendering permit;
- published date;
- updated date;
- author;
- content type;
- tags;
- related project;
- cover image where supported.

## Content handling

- sanitize rendered HTML;
- use absolute URLs;
- include alt text for feed images where format permits;
- do not include interactive MDX components;
- preserve code formatting;
- include correction text.

## Project release syndication

Project GitHub releases remain source-of-truth release artifacts. News release posts may be syndicated in the main feed.

## `llms.txt`

Separately generate:

- `/llms.txt` — structured documentation index;
- `/llms-full.txt` — combined latest public docs within practical size limits;
- per-page `.md` views.

These are not substitutes for RSS or human-facing docs.

## Cache behavior

Feeds can be statically generated and revalidated on content changes. Set correct XML/JSON content types and caching headers.

## Validation

CI should validate:

- XML well-formedness;
- required channel/feed metadata;
- unique IDs;
- absolute canonical URLs;
- no draft or future posts;
- no broken image URLs.
