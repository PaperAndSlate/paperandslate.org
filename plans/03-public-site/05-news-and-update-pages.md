# News and Updates Pages

## Purpose

News & Updates is the chronological public record of foundation activity. It combines editorial news with technical and governance notices while preserving content type.

## `/news`

### Header

- title;
- concise explanation;
- feed links;
- category filters;
- optional search.

### Featured article

A single feature may use a larger layout when it is genuinely important. Do not permanently feature the launch article after more relevant work exists.

### Card metadata

- type;
- published date;
- title;
- summary;
- related project or RFC;
- author optional;
- reading time optional.

### Categories

- Announcements
- Releases
- Project Updates
- RFCs
- Governance
- Community
- Implementation Stories
- Research
- Reports

## `/news/[slug]`

Article template:

- type and date;
- title;
- deck;
- author(s);
- related project/status;
- cover image optional;
- article body;
- correction note;
- related links;
- share controls;
- feed/newsletter callout.

## Release posts

Release frontmatter adds:

- project ID;
- version;
- release URL;
- docs URL;
- compatibility summary;
- upgrade guide;
- deprecations;
- security relevance.

## RFC notice posts

RFC notice frontmatter adds:

- RFC number;
- review start and end;
- affected projects;
- discussion URL;
- decision date if known.

## Governance decision posts

These summarize, but never replace, the formal decision record.

## Scheduled publishing

Git-backed scheduled posts can use a `publishedAt` future timestamp. The production build excludes future content. A scheduled workflow rebuilds at intervals or at the requested time.

For phase one, a 15-minute or hourly GitHub Action is sufficient. Exact-to-the-minute publishing is unnecessary.

## Corrections and withdrawals

### Correction

- preserve original publication date;
- add `updatedAt`;
- display correction text and date;
- record changes in Git history.

### Withdrawal

- keep the URL;
- replace the body with a withdrawal explanation;
- retain metadata;
- exclude from normal feature lists but keep searchable if public interest warrants it.

## Images

Use:

- project still lifes;
- diagrams;
- code or schema details;
- repository or release visuals;
- contributor-provided implementation images with permission.

Avoid arbitrary decorative hero images unrelated to the post.
