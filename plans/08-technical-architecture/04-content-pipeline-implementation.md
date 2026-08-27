# Content Pipeline Implementation

## Pipeline package

Create `packages/docs-ingestion` as a Node-only package with explicit stages and typed intermediate artifacts.

## Proposed commands

```text
pnpm docs:ingest
pnpm docs:validate
pnpm docs:links
pnpm docs:fixtures
pnpm docs:diff
pnpm docs:source-report
```

## Intermediate model

```ts
interface NormalizedDocument {
  id: string
  route: string
  title: string
  description?: string
  projectId?: string
  versionScope?: string
  status?: ProjectStatus
  docType: DocType
  normative: boolean
  mdast: Root
  headings: HeadingRecord[]
  links: LinkRecord[]
  assets: AssetRecord[]
  source: SourceProvenance
  search: SearchRecord[]
  hashes: {
    source: string
    normalized: string
  }
}
```

## Fetch adapters

Implement:

- local filesystem;
- Git repository;
- fixture.

Future optional adapters:

- GitHub archive;
- package registry;
- signed release bundle.

## Git security

- allowlist organizations/repositories;
- never execute repository code;
- clone without hooks;
- use a temporary isolated directory;
- reject credentials in repository URLs;
- limit checkout depth and file size;
- pin historical imports to immutable tags/SHA;
- validate tag target.

## Link normalization

Classify links:

- page-relative docs link;
- source asset;
- schema/download;
- repository source;
- external URL;
- anchor.

Rewrite through a route resolver aware of project and version.

## Asset processing

- fingerprint imported assets;
- copy safe static formats;
- optimize raster images;
- reject SVG with scripts/external references unless sanitized;
- preserve downloadable schemas/examples unchanged and add checksums;
- generate asset manifest.

## Includes and snippets

Use a restricted include syntax rather than MDX imports, for example:

```md
<Include source="../examples/basic.json" language="json" lines="1-30" />
```

The ingestion pipeline resolves it, records the dependency, and fails when the source changes incompatibly.

## Validation severity

```text
error   — build cannot publish
warning — publish allowed for draft content, reported clearly
info    — editorial suggestion
```

Stable content has stricter thresholds.

## Diff report

For cross-repository updates, generate a preview report:

- pages added/removed;
- routes changed;
- requirements added/removed;
- headings changed;
- broken links;
- search record changes;
- source SHAs;
- version impact.

Attach the report to CI artifacts and pull requests.

## Reproducibility

The lock file plus repository state must reproduce the published docs. Record tool version and schema version in generated manifests.
