# Source Ownership and Repository Contract

## Principle

Documentation is edited where the corresponding technical truth is maintained.

The central docs site is an assembler and presentation layer, not a second authoritative copy.

## Standards monorepo contract

Recommended structure:

```text
PaperAndSlate/standards/
├── projects/
│   ├── file-system/
│   │   ├── project.yml
│   │   ├── docs/
│   │   │   ├── index.mdx
│   │   │   ├── learn/
│   │   │   ├── guides/
│   │   │   ├── reference/
│   │   │   ├── specification/
│   │   │   └── migrations/
│   │   ├── schemas/
│   │   ├── examples/
│   │   ├── rfcs/
│   │   └── CHANGELOG.md
│   ├── discovery/
│   ├── organization-schema/
│   ├── course-schema/
│   └── curriculum-standards/
├── shared/
│   ├── terminology/
│   ├── schemas/
│   └── conformance/
└── tooling/
```

## `project.yml` requirements

Each project manifest should provide:

- stable ID;
- display name;
- slug;
- type;
- status;
- version;
- docs path;
- schema paths;
- maintainers;
- licenses;
- repository-relative links;
- dependencies;
- release configuration.

The website project registry imports these manifests but may add public presentation content such as cover imagery and feature ordering.

## Documentation file contract

Project docs may use Markdown or restricted MDX.

Allowed:

- frontmatter;
- Markdown;
- GitHub-flavored tables;
- fenced code;
- approved custom components;
- relative links and images;
- requirement annotations;
- reusable snippets through an approved include mechanism.

Disallowed in imported content:

- arbitrary JavaScript imports;
- arbitrary JSX components;
- network access during render;
- environment-variable reads;
- server actions;
- inline scripts;
- unsafe raw HTML.

## Approved MDX components

Initial allowlist:

- `Callout`
- `Steps`
- `Tabs` / `Tab`
- `CodeGroup`
- `Requirement`
- `PropertyTable`
- `Example`
- `Diagram`
- `StatusBadge`
- `VersionNote`
- `RelatedPages`
- `Download`

Components must have stable serialized props so imported docs remain portable.

## Source metadata

The ingestion process injects:

```yaml
source:
  repository: PaperAndSlate/standards
  path: projects/file-system/docs/index.mdx
  ref: main
  sha: abc123...
  editUrl: https://github.com/PaperAndSlate/standards/edit/main/...
```

Authors should not manually set trusted source fields.

## Local authoring

Support sibling-repository development:

```text
workspace/
├── paperandslate.org/
└── standards/
```

Environment:

```text
DOCS_SOURCE_MODE=local
PAPER_AND_SLATE_STANDARDS_PATH=../standards
```

The same validation and normalization pipeline runs against local paths.

## GitHub source mode

CI and production use registered Git sources. Fetch only required paths with shallow clone and sparse checkout when practical.

## Why not Git submodules

Do not use submodules as the primary aggregation mechanism because they:

- create confusing contributor setup;
- require manual pointer updates;
- complicate preview builds across coordinated pull requests;
- encourage generated source to appear editable;
- provide weak metadata and policy control compared with an explicit registry.

The ingestion registry should pin source refs and write an auditable lock file instead.
