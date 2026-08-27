# SEO and Discoverability

## Goals

- make Paper & Slate understandable from search results;
- make project and specification URLs durable citation targets;
- prevent drafts and previews from being mistaken for stable standards;
- support developers, researchers, and AI documentation tools.

## Metadata system

Centralize title and description generation.

Title templates:

```text
Homepage: Paper & Slate — Open Educational Infrastructure
Project: File System — Paper & Slate
Docs: Metadata | File System Documentation — Paper & Slate
RFC: RFC-0002: Core Document Format — Paper & Slate
News: Introducing Paper & Slate — News & Updates
```

Descriptions should be authored, not copied blindly from first paragraph.

## Canonical URLs

- one canonical origin: `https://paperandslate.org`;
- latest docs canonical route without version where stable;
- historical docs self-canonical when intentionally indexed;
- preview and draft deploys noindex;
- aliases redirect rather than duplicate.

## Structured data

Use appropriate JSON-LD:

- Organization or Project for Paper & Slate, with legal wording reviewed;
- WebSite with search action if supported appropriately;
- Article/NewsArticle;
- TechArticle for documentation where suitable;
- BreadcrumbList;
- SoftwareSourceCode for implementation repositories where accurate;
- Person only for real public profiles.

Do not invent founding dates, legal entity details, addresses, ratings, or awards.

## Sitemap

Generate from registries. Include:

- public foundation pages;
- projects;
- latest and supported docs;
- RFCs and decisions;
- published news;
- reports;
- policies.

Exclude:

- drafts;
- preview routes;
- internal generated aliases;
- search result pages;
- disabled future platform docs.

## Robots

Production:

- allow public content;
- exclude internal utility paths if any;
- link sitemap.

Preview/staging:

- `noindex, nofollow` headers/meta;
- robots disallow as backup.

## Open Graph and social images

Generate consistent 1200 × 630 cards for:

- site;
- projects;
- docs pages;
- RFCs;
- news;
- reports.

Include status/version on project and docs cards so shared drafts are not misread as stable.

## Feeds and AI-readable output

- RSS, Atom, JSON Feed;
- `llms.txt`;
- `llms-full.txt`;
- Markdown page routes;
- clean semantic HTML;
- source links and version metadata.

## Search-engine trust

- publish author/maintainer and update metadata;
- preserve corrections;
- avoid thin placeholder pages;
- use durable redirects;
- expose licenses;
- keep page dates accurate;
- distinguish modified time from original publication.

## Performance

Core Web Vitals directly affect discoverability and user trust. Follow the performance plan.

## External discoverability

When repositories exist:

- concise GitHub descriptions;
- topics/tags;
- README links to canonical docs;
- release links to versioned docs;
- project metadata in package registries;
- no duplicate long-form docs in README that drift from the site.
