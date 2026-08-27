# Frontmatter Schema Examples

## Documentation page

```yaml
---
title: Publish a discovery manifest
description: Add a Paper & Slate education discovery file to a school website.
docType: guide
projectId: discovery
normative: false
order: 20
audience:
  - developer
  - school-technology
keywords:
  - well-known
  - manifest
  - school website
lastReviewed: 2026-08-26
reviewBy: 2027-02-26
---
```

Source, ref, SHA, and edit URL are injected by the ingestion pipeline.

## Normative specification page

```yaml
---
title: Discovery resolution
summary: Normative processing rules for locating and resolving an education discovery manifest.
docType: specification
projectId: discovery
normative: true
versionScope: next
status: draft
requirementPrefix: PNS-DISCOVERY
order: 30
---
```

## News

```yaml
---
title: Introducing Paper & Slate
slug: introducing-paper-and-slate
summary: An open foundation building common educational infrastructure.
status: published
type: announcement
publishedAt: 2026-08-25T15:00:00Z
authors:
  - callum
projects: []
tags:
  - foundation
  - launch
featured: true
coverImage: ./cover.jpg
newsletter: false
---
```

## RFC

```yaml
---
number: '0002'
title: Core document format
slug: core-document-format
summary: Defines the initial structure and processing model for Paper & Slate documents.
authors:
  - callum
sponsors:
  - callum
status: draft
createdAt: 2026-08-25
updatedAt: 2026-08-25
affectedProjects:
  - file-system
targetVersions:
  - next
discussionUrl: https://github.com/PaperAndSlate/standards/discussions/...
---
```

## Decision record

```yaml
---
id: 2026-001
status: accepted
title: Combine the public site and documentation at launch
date: 2026-08-26
decisionMaker: founder-steward
relatedRfcs: []
affectedProjects:
  - website
summary: Use one Next.js deployment on paperandslate.org with docs at /docs.
---
```

## Policy

```yaml
---
title: Security Policy
version: '1.0'
status: active
effectiveAt: 2026-09-01
owner: foundation-steward
lastReviewed: 2026-09-01
reviewBy: 2027-03-01
---
```
