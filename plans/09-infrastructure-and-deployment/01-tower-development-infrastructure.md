# Tower Development Infrastructure

## Recommended launch resources

Paper & Slate’s public site is static-first and does not need the full Tower resource catalog.

### Required

#### `web`

One Next.js HTTP workload deployed through Coolify.

Responsibilities:

- public website;
- documentation;
- feeds and metadata routes;
- newsletter server route;
- optional search fallback endpoint.

Configuration:

- Dockerfile or verified Next.js-compatible build pack;
- standalone Next.js output;
- HTTPS `.dev.tower` domain;
- `/health` endpoint;
- deployment SHA exposed in health metadata;
- non-root runtime user;
- resource limits set after profiling.

#### `typesense`

Recommended for unified search from the first public beta.

Use:

- project collection;
- write key bound only to index jobs;
- search-only key exposed to the web client;
- preview collection per pull request if affordable;
- search smoke tests after indexing.

### Required managed capabilities

- Infisical secrets and Coolify bindings
- Pull-request preview environments
- GlitchTip project integration
- Synthetic monitor for web and docs
- OCI image/SBOM/vulnerability report when Docker is used

## Not required at launch

### PostgreSQL

No database is needed for Git-backed content, static project registries, or public docs.

Add later only for:

- database-backed CMS;
- authenticated console;
- content feedback;
- organization claims;
- operational audit records.

### Valkey

Do not add for static page caching. Consider later for:

- rate limiting at scale;
- sessions;
- distributed locks;
- expensive interactive tools.

### RabbitMQ

No queue is needed. Cross-repository builds can use GitHub Actions or Inngest later.

### S3

No need while media volume is modest and source-controlled. Add for managed uploads or large downloadable artifacts.

### Qdrant

Do not use for basic search. Typesense is a better fit for exact terms, fields, RFC numbers, and autocomplete. Qdrant may support future semantic discovery or assistant experiences.

### Inngest

Optional later for:

- cross-repository docs ingestion;
- scheduled publishing;
- index rebuild workflows;
- validator jobs.

GitHub Actions is enough at launch.

## Environments

### Local

- local Next.js;
- static search fallback;
- local sibling standards repo;
- no Kit submission by default.

### Tower development

- `paperandslate-web.dev.tower` or project-assigned domain;
- Tower Typesense;
- Kit disabled or test form;
- GlitchTip development environment.

### Pull-request preview

- isolated web deployment;
- fixture or branch-aware docs source;
- preview search collection or static fallback;
- noindex;
- no production Kit credentials;
- optional preview access protection.

### Staging

- production-like build and imported sources;
- separate search collection;
- synthetic tests;
- release-candidate content;
- Kit test mode/disabled.

### Production

- `paperandslate.org`;
- production search index;
- Kit enabled only after configuration;
- Cloudflare DNS/CDN recommended;
- monitoring and rollback.

## Tower plugin usage instructions for Codex

When implementation begins, the agent may use the Tower plugin to:

1. create a Paper & Slate project;
2. provision a `web` workload;
3. provision Typesense;
4. create Infisical secrets;
5. bind secrets to the workload;
6. configure preview environments;
7. configure GlitchTip and synthetic monitoring;
8. validate deployment health.

It should not provision databases, queues, object storage, vector search, or identity services without a documented requirement and approval.
