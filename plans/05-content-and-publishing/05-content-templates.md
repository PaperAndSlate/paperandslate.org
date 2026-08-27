# Content Templates

## News article

```yaml
---
title: Introducing Paper & Slate
slug: introducing-paper-and-slate
summary: An open foundation building common educational infrastructure.
publishedAt: 2026-08-25T15:00:00Z
status: published
type: announcement
authors: [callum]
projects: []
tags: [foundation, launch]
featured: true
coverImage: ./cover.jpg
newsletter: false
---
```

Body outline:

```text
Opening
Problem
Paper & Slate approach
Initial work
Governance and openness
How to follow or contribute
```

## Release post

```yaml
---
title: File System 1.0 released
status: published
type: release
project: file-system
version: 1.0.0
releaseUrl: ...
docsUrl: /docs/file-system
upgradeGuide: /docs/file-system/guides/migrate-to-1-0
breaking: true
---
```

Body:

- release summary;
- key capabilities;
- breaking changes;
- deprecations;
- migration;
- security notes;
- acknowledgements.

## RFC notice

```yaml
---
title: Review RFC-0002: Core document format
status: published
type: rfc
rfcIds: [RFC-0002]
reviewStartsAt: 2026-09-01
reviewEndsAt: 2026-10-01
projects: [file-system]
---
```

Body:

- proposal summary;
- why now;
- areas needing feedback;
- review deadline;
- discussion link.

## Project overview

Frontmatter:

- project ID;
- display title;
- public summary;
- image;
- featured sections.

Body:

1. Problem
2. Scope
3. Current state
4. Example
5. Project relationships
6. Work in progress
7. How to contribute

## Concept page

1. Definition
2. Why it matters
3. Example
4. Related projects
5. Common misunderstandings
6. Further reading

## Guide

1. Outcome
2. Prerequisites
3. Steps
4. Complete example
5. Validate
6. Troubleshooting
7. Next steps

## Specification section

1. Purpose
2. Normative requirements
3. Processing behavior
4. Errors
5. Examples marked informative
6. Security/privacy considerations
7. References

## Policy

Frontmatter:

```yaml
version: 1.0
effectiveAt: 2026-09-01
owner: foundation-steward
lastReviewed: 2026-09-01
reviewBy: 2027-09-01
status: active
```

Body:

1. Plain-language summary
2. Scope
3. Policy
4. Responsibilities
5. Enforcement or exceptions
6. Contact
7. Revision history

## Annual report

1. Year in review
2. Mission progress
3. Project table
4. Governance activity
5. Contributors
6. Implementations
7. Funding
8. Security and corrections
9. Next priorities
