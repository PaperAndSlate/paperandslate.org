# Standards Monorepo Structure

## Recommended repository

```text
PaperAndSlate/standards
```

The monorepo houses normative standards, schemas, examples, conformance fixtures, and project-owned documentation. It should not house the public website application.

## Proposed structure

```text
standards/
├── projects/
│   ├── file-system/
│   │   ├── project.yml
│   │   ├── README.md
│   │   ├── docs/
│   │   ├── specification/
│   │   │   ├── specification.md
│   │   │   ├── requirements.yml
│   │   │   └── references.yml
│   │   ├── schemas/
│   │   ├── examples/
│   │   ├── conformance/
│   │   ├── migrations/
│   │   └── CHANGELOG.md
│   ├── discovery/
│   ├── organization-schema/
│   ├── course-schema/
│   └── curriculum-standards/
├── shared/
│   ├── terminology/
│   ├── identifiers/
│   ├── provenance/
│   ├── namespaces/
│   ├── multilingual/
│   └── licenses/
├── rfcs/
├── decisions/
├── tooling/
│   ├── schema-check/
│   ├── examples-check/
│   └── docs-check/
├── scripts/
├── .github/
├── pnpm-workspace.yaml
└── README.md
```

## Project independence

Each project has its own:

- manifest;
- status;
- version;
- changelog;
- release tags;
- maintainers;
- docs tree;
- schema/example checks;
- compatibility policy.

A shared repository does not imply a shared release.

## Tagging strategy

Use project-prefixed tags:

```text
file-system-v1.0.0
discovery-v0.2.0
organization-schema-v1.1.0
```

The docs source registry pins these tags for historical versions.

## Dependencies

Declare dependencies in project manifests:

```yaml
dependencies:
  - project: organization-schema
    range: '>=1.0 <2.0'
    type: normative
```

Dependency ranges describe compatibility but do not force synchronized release.

## Shared concepts

A concept belongs in `shared` only when multiple projects use the same semantics. Avoid moving uncertain concepts into shared core prematurely.

Shared areas version independently or are incorporated by specific project versions through explicit references.

## RFC location

Foundation-wide RFCs use a root `rfcs` sequence. A project may keep design notes locally, but material proposals receive foundation-wide RFC numbers.

## Website relationship

The website imports:

- project manifests;
- docs;
- changelogs;
- release metadata;
- RFC references;
- schemas/examples for downloads and generated reference.

The website does not import executable build scripts or arbitrary project packages during page rendering.

## Coordinated pull requests

For changes requiring website presentation updates:

1. Open standards PR.
2. Open website PR referencing the standards branch/SHA through preview configuration.
3. Preview combined result.
4. Merge standards first.
5. Website production rebuild triggers.
6. Merge website presentation changes if separate.

Automation can simplify this later; do not require a distributed workflow engine at launch.
