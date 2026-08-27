# Repository Architecture

## Recommended public repository

```text
PaperAndSlate/paperandslate.org
```

Use a pnpm/Turborepo monorepo even though phase one has one deployable application. This creates clear ownership boundaries and makes a future docs split or platform addition easier.

## Structure

```text
paperandslate.org/
├── apps/
│   └── web/
│       ├── src/
│       │   ├── app/
│       │   ├── components/
│       │   ├── features/
│       │   ├── lib/
│       │   └── styles/
│       ├── public/
│       ├── next.config.ts
│       └── package.json
├── packages/
│   ├── design-system/
│   │   ├── src/components/
│   │   ├── src/tokens/
│   │   ├── src/icons/
│   │   └── assets/
│   ├── content/
│   │   ├── src/schemas/
│   │   ├── src/loaders/
│   │   ├── src/feeds/
│   │   └── src/metadata/
│   ├── docs-ingestion/
│   │   ├── src/registry/
│   │   ├── src/fetch/
│   │   ├── src/normalize/
│   │   ├── src/validate/
│   │   └── src/generate/
│   ├── search/
│   │   ├── src/providers/
│   │   ├── src/indexer/
│   │   └── src/ui-model/
│   ├── config/
│   │   ├── eslint/
│   │   ├── typescript/
│   │   └── tailwind/
│   └── testing/
├── content/
├── config/
│   ├── docs-sources.yml
│   ├── project-presentation.yml
│   ├── search.yml
│   └── redirects.yml
├── scripts/
│   ├── docs-ingest.ts
│   ├── docs-check.ts
│   ├── search-index.ts
│   ├── content-new.ts
│   ├── feeds-check.ts
│   └── release-check.ts
├── infrastructure/
│   ├── tower/
│   ├── docker/
│   └── monitoring/
├── tests/
│   ├── e2e/
│   ├── accessibility/
│   ├── content/
│   └── fixtures/
├── .github/
│   ├── workflows/
│   ├── ISSUE_TEMPLATE/
│   └── PULL_REQUEST_TEMPLATE.md
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
└── README.md
```

## Feature organization inside `apps/web`

```text
features/
├── foundation/
├── projects/
├── governance/
├── news/
├── docs/
├── search/
├── newsletter/
└── metadata/
```

Each feature may own server-only loaders, view models, components specific to the feature, and tests. Shared visual primitives belong in the design-system package.

## Import boundaries

- `apps/web` may import every internal package.
- `design-system` must not import application features or content loaders.
- `content` may import schemas/config but not React components.
- `docs-ingestion` is Node-only and never imported into client code.
- `search` separates indexing code from browser query code.
- server-only modules use `server-only` guards.

Enforce boundaries with ESLint rules or dependency-cruiser.

## Generated directories

```text
.generated/
├── docs/
├── assets/
├── manifests/
└── search/
```

Generated data is build output and ignored by Git except fixtures.

## Repository bootstrap

The first commit may contain only:

- README;
- licenses;
- governance basics;
- package/workspace scaffolding;
- no invented project implementation.

Do not automatically create or commit the repository until the owner is ready. The pack can be used to create a simple README if desired.
