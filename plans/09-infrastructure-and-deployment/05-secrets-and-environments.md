# Secrets and Environment Configuration

## Principles

- Validate configuration before build/start.
- Keep server-only values out of `NEXT_PUBLIC_*`.
- Store development/staging/production separately.
- Use Infisical through Tower for deployed environments.
- Never put secrets in docs source registries or content frontmatter.

## Public configuration

```text
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_GITHUB_ORG_URL
NEXT_PUBLIC_SEARCH_PROVIDER
NEXT_PUBLIC_TYPESENSE_HOST
NEXT_PUBLIC_TYPESENSE_SEARCH_KEY
NEXT_PUBLIC_ANALYTICS_ID
NEXT_PUBLIC_DEPLOYMENT_ENV
```

The Typesense browser key must be search-only and scoped appropriately.

## Server-only configuration

```text
KIT_ENABLED
KIT_API_KEY
KIT_FORM_ID
KIT_TAG_ID
TYPESENSE_ADMIN_KEY
TYPESENSE_COLLECTION
GITHUB_DOCS_TOKEN
DOCS_SOURCE_MODE
PAPER_AND_SLATE_STANDARDS_PATH
GLITCHTIP_DSN
PREVIEW_CONTENT_ENABLED
```

A GitHub token should have minimum read access and may be unnecessary for public clones unless rate limits or private previews require it.

## Environment behavior

### Local

- `.env.local` ignored;
- Kit disabled;
- static search;
- local docs source by default;
- error reporting off or local.

### Preview

- no production Kit;
- preview search index or static fallback;
- noindex;
- preview content enabled;
- separate GlitchTip environment.

### Staging

- production-like docs sources;
- staging Typesense;
- Kit disabled/test;
- full monitoring.

### Production

- exact canonical URL;
- production search;
- Kit enabled when ready;
- source ref policy enforced;
- error tracking and analytics enabled.

## Rotation

- document owners and rotation steps;
- avoid secrets with no expiry when providers support expiry;
- rotate immediately after exposure;
- test new values before revoking old values where overlap is supported.

## Logging

Configuration validation errors may name missing variables but must not output values.
