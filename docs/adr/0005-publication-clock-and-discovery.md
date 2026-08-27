# ADR 0005: Explicit publication clock and discovery filters

Status: accepted for v1 release-candidate implementation
Date: 2026-08-27

## Decision

Public news/release discovery uses one explicit publication clock (`PUBLICATION_AS_OF`, defaulting to the reviewed local date) and shared predicates. Future, draft, withdrawn, superseded, and archived records do not enter public feeds, sitemap, search, or AI-readable discovery. A scheduled record is public only after its scheduled date. Corrections remain public with their stable identity; superseded records do not.

Documentation records retain draft and historical state for the working docs UI, but public discovery helpers expose only supported and historical records. This keeps an editorial preview visible to authors without treating it as published.

## Consequences

Date-dependent behavior is deterministic in tests and can be reviewed before a publication window. Production must set the approved publication clock policy and editorial owner. `pnpm content:validate`, `pnpm feeds:check`, `pnpm seo:check`, and publishing tests are local evidence; they do not approve public copy.
