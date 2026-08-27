# Documentation Aggregation Pipeline

## Pipeline goals

- Import only explicitly approved repositories and paths.
- Make builds reproducible.
- preserve source provenance.
- prevent route collisions.
- validate content before rendering.
- support local, preview, and production modes.
- trigger rebuilds when project docs change.

## Inputs

1. Central documentation under `content/docs`.
2. Project source registry under `config/docs-sources.yml`.
3. Project manifests imported from the standards monorepo.
4. Version tags and release manifests.
5. Optional tool-repository docs.

## Registry example

```yaml
schemaVersion: 1
sources:
  - id: standards-main
    repository: PaperAndSlate/standards
    ref: main
    mode: git
    projects:
      - id: file-system
        docsPath: projects/file-system/docs
        routeBase: file-system/next
        status: draft
      - id: discovery
        docsPath: projects/discovery/docs
        routeBase: discovery/next
        status: experimental
```

## Build stages

### 1. Validate registry

Check:

- unique source IDs;
- allowed GitHub organization;
- valid route bases;
- no duplicate project/version pairs;
- recognized maturity;
- immutable refs for historical versions.

### 2. Resolve sources

Development modes:

- `local` — read from sibling paths;
- `git` — shallow clone/fetch;
- `fixture` — use committed test fixtures.

CI produces `docs-sources.lock.json` containing repository, requested ref, resolved SHA, import time, and file hashes.

### 3. Collect files

- include Markdown, MDX, supported images, schema references, and explicitly allowed downloads;
- honor a source-level include/exclude policy;
- reject symlinks escaping the source root;
- reject files above configured size limits unless declared as downloads.

### 4. Normalize

- parse frontmatter;
- inject source metadata;
- normalize line endings;
- rewrite relative image and document links;
- resolve includes;
- add project/version defaults;
- extract headings and structured search data;
- generate canonical route.

### 5. Validate MDX safety

- parse AST;
- reject arbitrary ESM imports and exports;
- allow only registered components;
- reject script tags and event-handler attributes;
- sanitize raw HTML if raw HTML is enabled at all;
- reject unsupported component props.

### 6. Validate content schemas

Check required fields by doc type. Stable specifications receive stricter rules than draft guides.

Examples:

- a normative page needs version and requirement scope;
- a migration page needs source and target versions;
- a schema page needs the schema source path;
- a release page needs a project and version.

### 7. Validate links

- internal route existence;
- local anchors;
- source-relative asset paths;
- external links with cache and timeout;
- canonical redirects;
- version-crossing links.

External link failures should be warnings during local development and configurable failures in scheduled link checks. Stable internal links always fail the build.

### 8. Detect collisions

Fail on:

- duplicate output routes;
- duplicate aliases;
- a project route shadowing central docs;
- conflicting assets;
- duplicate requirement IDs within a project version.

### 9. Generate artifacts

```text
.generated/
├── docs/
├── assets/
├── page-tree.json
├── project-index.json
├── search-records.json
├── redirects.json
├── source-provenance.json
└── docs-sources.lock.json
```

The directory is generated and ignored by Git, except small fixture snapshots used in tests.

### 10. Build site

Fumadocs reads normalized generated content and central content through one loader.

### 11. Index search

- static fallback index generated during build;
- Typesense indexer uploads the same normalized records after successful validation;
- index aliases swap atomically after upload.

### 12. Publish provenance

Every page displays source and SHA and exposes them in structured metadata.

## Repository event triggers

When the standards repository merges a docs-relevant change:

1. GitHub Action identifies affected projects.
2. It sends `repository_dispatch` to `paperandslate.org`.
3. Website CI runs ingestion and validation.
4. A preview or production deployment is created according to the source ref.
5. Search index is replaced only after deployment health passes.

Also run a nightly rebuild to catch missed events and external link drift.

## Failure policy

- Stable docs errors: fail build.
- Candidate docs structural errors: fail build.
- Draft docs missing optional metadata: warn.
- Planned docs may omit implementation artifacts but must pass safe MDX and route validation.
- Existing production content remains available if a new import fails.
