# Documentation Source Registry Example

```yaml
schemaVersion: 1
policy:
  allowedOrganizations:
    - PaperAndSlate
  defaultMode: git
  rejectArbitraryMdxEsm: true
  maxFileBytes: 2000000
  maxAssetBytes: 15000000

sources:
  - id: standards-main
    repository: PaperAndSlate/standards
    ref: main
    mode: git
    sparsePaths:
      - projects
      - shared
    projects:
      - projectId: file-system
        docsPath: projects/file-system/docs
        routeBase: file-system/next
        version: next
        status: draft
        include:
          - '**/*.md'
          - '**/*.mdx'
          - '**/*.{png,jpg,jpeg,webp,svg}'
          - '../schemas/**/*.json'
          - '../examples/**/*'
        exclude:
          - '**/internal/**'
      - projectId: discovery
        docsPath: projects/discovery/docs
        routeBase: discovery/next
        version: next
        status: experimental

  - id: file-system-v1
    repository: PaperAndSlate/standards
    ref: file-system-v1.0.0
    mode: git
    immutable: true
    projects:
      - projectId: file-system
        docsPath: projects/file-system/docs
        routeBase: file-system/v/1.0
        version: '1.0'
        status: stable

  - id: js-validator
    repository: PaperAndSlate/javascript
    ref: main
    mode: git
    projects:
      - projectId: tools-javascript
        docsPath: docs
        routeBase: tools/javascript/next
        version: next
        status: experimental
```

## Generated lock

```json
{
  "schemaVersion": 1,
  "generatedAt": "2026-08-26T12:00:00Z",
  "toolVersion": "0.1.0",
  "sources": [
    {
      "id": "standards-main",
      "repository": "PaperAndSlate/standards",
      "requestedRef": "main",
      "resolvedSha": "0123456789abcdef",
      "files": 142,
      "contentHash": "sha256:..."
    }
  ]
}
```
