# Project Registry Example

Recommended source: `config/projects.yml` or generated merge of standards manifests and website presentation metadata.

```yaml
schemaVersion: 1
projects:
  - id: file-system
    slug: file-system
    name: Paper & Slate File System
    shortName: File System
    summary: Human-readable structured documents for educational content.
    type: format
    status: draft
    version: 0.1.0
    health: active
    repository: https://github.com/PaperAndSlate/standards
    repositoryPath: projects/file-system
    docsRoot: /docs/file-system
    sourceDocsPath: projects/file-system/docs
    maintainers:
      - callum
    licenses:
      code: Apache-2.0
      documentation: CC-BY-4.0
      schemas: CC0-1.0
    dependencies: []
    tags:
      - documents
      - markdown
      - content
    featured: true
    visibility: public
    lastMeaningfulUpdate: 2026-08-25
    presentation:
      image: /images/projects/file-system.jpg
      order: 10
    links:
      - label: Documentation
        url: /docs/file-system
      - label: Source
        url: https://github.com/PaperAndSlate/standards/tree/main/projects/file-system

  - id: discovery
    slug: discovery
    name: .well-known Education Discovery
    shortName: Discovery
    summary: A predictable public location for school and education-organization information.
    type: standard
    status: experimental
    version: 0.1.0
    health: active
    repository: https://github.com/PaperAndSlate/standards
    repositoryPath: projects/discovery
    docsRoot: /docs/discovery
    sourceDocsPath: projects/discovery/docs
    maintainers:
      - callum
    licenses:
      documentation: CC-BY-4.0
      schemas: CC0-1.0
    dependencies:
      - organization-schema
    tags:
      - discovery
      - web
      - well-known
    featured: true
    visibility: public
    lastMeaningfulUpdate: 2026-08-25
```

## Merge behavior

Project-owned fields should win for technical truth:

- status;
- version;
- dependencies;
- licenses;
- maintainers;
- source paths.

Website-owned presentation fields may control:

- image;
- feature order;
- editorial summary after review;
- homepage visibility.

The merge must fail when the website attempts to override a technical status or version without an explicit reviewed exception.
