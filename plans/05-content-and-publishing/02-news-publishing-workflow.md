# News Publishing Workflow

## Authoring model

The founder initially publishes through Git-backed MDX. The workflow should feel closer to a lightweight editorial system than manually creating arbitrary files.

## Commands

Recommended scripts:

```text
pnpm content:new news
pnpm content:preview
pnpm content:validate
pnpm content:schedule
pnpm content:feeds
```

`content:new news` prompts for:

- title;
- type;
- summary;
- author;
- projects;
- RFCs;
- publication state;
- date;
- cover image.

It creates a correctly named file with validated frontmatter and section prompts.

## File naming

Before publication:

```text
content/news/2026/2026-08-25-introducing-paper-and-slate.mdx
```

The route slug comes from frontmatter and must remain stable after publication.

## Branch workflow

1. Create content branch.
2. Run local preview.
3. Validate schema, links, images, spelling, and accessibility metadata.
4. Open pull request.
5. Preview deployment comments with URL.
6. Review desktop/mobile/social images.
7. Merge.
8. Production deploy publishes according to status/date.
9. Search and feeds update.
10. If `newsletter: true`, prepare a Kit broadcast workflow only when intentionally enabled.

## Editorial checks

- Headline matches article substance.
- Summary works in search and feeds.
- Project/status details are accurate.
- Dates and version numbers are verified.
- Claims of adoption have evidence.
- Images have alt text and permission.
- Links use canonical routes.
- Article does not replace a formal RFC or changelog.

## Categories versus tags

Use one primary content type and a small set of tags.

Avoid creating dozens of categories. Tags should be normalized through a registry so `well-known`, `.well-known`, and `discovery` do not become uncontrolled duplicates.

## Preview states

Preview banner shows:

- Draft
- Scheduled date
- Unpublished source branch
- Noindex status
- Difference from production version if updating an existing article

## Corrections

Frontmatter example:

```yaml
updatedAt: 2026-08-27
correction:
  date: 2026-08-27
  summary: Corrected the stated review period from 21 to 30 days.
```

The article renders a visible correction box. The feed may include the update date.

## Releases

A project release should normally create:

- GitHub release;
- project changelog entry;
- versioned docs update;
- optional news release post;
- search refresh.

The news post is explanatory, not the source of release truth.
