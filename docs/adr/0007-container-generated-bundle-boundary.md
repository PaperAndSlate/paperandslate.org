# ADR 0007: Container builds consume the committed generated docs bundle

Status: accepted for v1 release-candidate implementation
Date: 2026-08-27

## Decision

The Docker build validates and consumes `.generated/docs` and `.generated/search` committed as release inputs. It does not assume that the sibling `../standards` checkout exists inside a container or CI checkout. A local source checkout runs `pnpm docs:ingest` and `pnpm docs:validate`; a CI/container checkout runs `pnpm docs:bundle:check` and fails if the generated bundle is missing, malformed, stale in schema, duplicated, or hash-invalid.

## Consequences

Builds are reproducible from the repository checkout and do not silently omit sibling sources. Source ingestion and generated-bundle validation are distinct evidence types and must be reported separately. A release must retain the source lock/provenance and the exact source commit alongside the image identity.
