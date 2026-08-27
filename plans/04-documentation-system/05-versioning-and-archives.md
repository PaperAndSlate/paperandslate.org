# Documentation Versioning and Archives

## Independent project versions

Each standard, schema, or tool versions independently. Do not create a single “Paper & Slate 1.0” documentation selector.

Examples:

- File System 1.2
- Discovery 1.0
- Organization Schema 2.0
- JavaScript Validator 0.7

## Route model

### Latest stable

```text
/docs/file-system/...
```

This route resolves to the latest supported stable release and is canonical for general inbound links.

### Next or draft

```text
/docs/file-system/next/...
```

### Historical release

```text
/docs/file-system/v/1.1/...
```

Use major/minor documentation routes. Patch releases generally update the same docs set unless they contain meaningfully different behavior.

## No stable release yet

When a project has no stable release:

- `/docs/file-system` may resolve to current draft for usability;
- the page must display a prominent Draft or Experimental banner;
- canonical metadata may point to the draft route;
- search result badges must show maturity.

## Source pinning

Historical versions must resolve from immutable tags or commit SHAs. Never render old documentation from a moving maintenance branch without recording the exact SHA.

## Version manifest

Each project maintains:

```yaml
project: file-system
versions:
  - version: next
    ref: main
    status: draft
    supported: true
  - version: 1.2
    ref: file-system-v1.2.3
    status: stable
    supported: true
  - version: 1.1
    ref: file-system-v1.1.5
    status: stable
    supported: maintenance
  - version: 1.0
    ref: file-system-v1.0.4
    status: deprecated
    supported: false
```

## Support labels

- Current
- Maintenance
- Deprecated
- Unsupported
- Archived

Maturity and support are different concepts. A stable version can become unsupported.

## Page-level version notes

Use structured components:

- Introduced in
- Changed in
- Deprecated in
- Removed in
- Available in next only

## Cross-version links

By default, a link inside project docs should stay within the current project version. Use a helper rather than hard-coded absolute paths.

Cross-project links resolve to the other project’s latest stable version unless the source explicitly pins a compatibility version.

## Search behavior

Default search:

- prioritizes latest stable;
- shows current draft when no stable release exists;
- collapses duplicate historical results;
- permits version filtering;
- clearly marks archived results.

## Sitemap behavior

Index canonical latest and supported historical documentation. Exclude unsupported duplicate pages from the primary sitemap but keep them crawlable when citation value warrants it.

## Archive permanence

Released normative specifications, RFCs, and decisions should remain addressable indefinitely. Storage cost is low; broken citations have high public cost.
