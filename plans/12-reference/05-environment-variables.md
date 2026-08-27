# Environment Variables Reference

## Site

| Variable | Scope | Required | Purpose |
|---|---|---:|---|
| `NEXT_PUBLIC_SITE_URL` | public | yes | Canonical origin |
| `NEXT_PUBLIC_GITHUB_ORG_URL` | public | yes | GitHub organization link |
| `NEXT_PUBLIC_DEPLOYMENT_ENV` | public | yes | local/preview/staging/production |
| `DEPLOYMENT_SHA` | server | recommended | Health and error correlation |
| `BUILD_TIME` | server | generated | Health/build metadata |

## Documentation

| Variable | Scope | Required | Purpose |
|---|---|---:|---|
| `DOCS_SOURCE_MODE` | server/build | yes | local/git/fixture |
| `PAPER_AND_SLATE_STANDARDS_PATH` | server/build | local only | Sibling source path |
| `GITHUB_DOCS_TOKEN` | server/build | optional | Read source with increased rate limit |
| `DOCS_ALLOW_DRAFTS` | build | preview only | Include draft central content |
| `DOCS_BASE_URL` | public/server | optional | Future docs subdomain support |

## Search

| Variable | Scope | Required | Purpose |
|---|---|---:|---|
| `NEXT_PUBLIC_SEARCH_PROVIDER` | public | yes | static/typesense |
| `NEXT_PUBLIC_TYPESENSE_HOST` | public | hosted search | Typesense host |
| `NEXT_PUBLIC_TYPESENSE_SEARCH_KEY` | public | hosted search | Search-only key |
| `TYPESENSE_ADMIN_KEY` | server/CI | indexing only | Write/index key |
| `TYPESENSE_COLLECTION` | server/public config | hosted search | Collection or alias |

## Kit

| Variable | Scope | Required | Purpose |
|---|---|---:|---|
| `KIT_ENABLED` | server/public behavior | yes | Enable integration |
| `KIT_API_KEY` | server | when enabled | Provider secret |
| `KIT_FORM_ID` | server | when enabled | Destination form |
| `KIT_TAG_ID` | server | optional | Subscriber tag |
| `NEWSLETTER_DOUBLE_OPT_IN` | server | recommended | Consent behavior |

## Observability

| Variable | Scope | Required | Purpose |
|---|---|---:|---|
| `GLITCHTIP_DSN` | server/client split | production recommended | Error reporting |
| `NEXT_PUBLIC_ANALYTICS_ID` | public | optional | Privacy-conscious analytics |
| `LOG_LEVEL` | server | yes | Structured logging level |

## Preview

| Variable | Scope | Required | Purpose |
|---|---|---:|---|
| `PREVIEW_CONTENT_ENABLED` | build | preview | Include draft content |
| `PREVIEW_PR_NUMBER` | build | preview | Search/index namespacing |
| `ROBOTS_NOINDEX` | server/build | preview/staging | Search-engine protection |

All variables must be parsed through a typed environment schema. Empty strings should not silently count as configured secrets.
