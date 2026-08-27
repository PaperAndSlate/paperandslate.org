# UI and Documentation Framework Evaluation

## UI recommendation: shadcn/ui + Tailwind CSS

### Why it fits Paper & Slate

Paper & Slate needs a distinctive editorial public site and a dense documentation interface. A strongly themed component suite would either make the public site look generic or require extensive overrides.

shadcn/ui is a strong fit because:

- components are added as source code and become owned by the project;
- it supports Next.js and monorepo workflows;
- primitives cover dialogs, command search, menus, sheets, forms, tabs, tables, and tooltips;
- CSS-variable theming fits the Paper & Slate token system;
- accessibility behavior begins from established primitives;
- it does not require the brand to look like the framework.

### Recommended setup

- initialize inside `packages/design-system` or with a monorepo-aware alias;
- select a restrained style such as New York or the current closest equivalent;
- use a neutral base and replace all semantic tokens;
- use CSS variables;
- add components selectively;
- wrap raw primitives in Paper & Slate semantic components.

### Alternatives considered

#### Material UI

Strengths:

- extensive component coverage;
- mature accessibility and data components.

Why not primary:

- Material visual assumptions are strong;
- editorial identity would require substantial theme and component override;
- larger runtime/style surface than needed.

#### Mantine

Strengths:

- broad component and hook collection;
- productive for application dashboards.

Why not primary:

- Paper & Slate is not a dashboard-first product;
- more prebuilt styling than needed;
- would create a second design-token abstraction.

#### Chakra UI

Strengths:

- accessible primitives and rapid composition.

Why not primary:

- runtime styling and component conventions are less aligned with a Tailwind/Fumadocs stack;
- custom editorial work would still be extensive.

#### Radix or Base UI directly

Strengths:

- low-level control;
- strong behavior primitives.

Why not alone:

- shadcn already provides a practical source-owned composition layer;
- building every pattern directly would add time without clear benefit.

## Documentation recommendation: Fumadocs

### Why it fits

- built for Next.js;
- supports custom sources and MDX;
- provides documentation page-tree and UI primitives;
- supports search integrations;
- supports OpenAPI generation for the future;
- supports `llms.txt` and Markdown output;
- can be integrated without using a separate non-Next.js application.

### Alternatives considered

#### Nextra

Strengths:

- simple Next.js MDX documentation;
- good for repository-local docs.

Why not primary:

- the Paper & Slate ingestion/versioning/search model needs more explicit source and headless control;
- Fumadocs is better aligned with custom docs-product composition.

#### Docusaurus

Strengths:

- excellent conventional docs versioning and plugin ecosystem;
- mature static documentation.

Why not primary:

- creates a separate React application and styling stack;
- less aligned with the user’s Next.js preference;
- combined public-site search and metadata become more complex.

Docusaurus would be reasonable if docs were intentionally a separate product and deployment from day one.

#### Custom Next.js MDX only

Strengths:

- maximum control;
- fewer framework dependencies.

Why not primary:

- Paper & Slate would need to rebuild navigation trees, source loaders, code tooling, search structures, OpenAPI integration, and AI-readable outputs;
- this is undifferentiated infrastructure.

## Decision

Use:

```text
Next.js + Tailwind CSS + shadcn/ui + Fumadocs + Phosphor Icons
```

Paper & Slate owns the brand, token system, composition, content taxonomy, ingestion system, and search model. Frameworks supply primitives rather than product identity.
