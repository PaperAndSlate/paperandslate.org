# Deployment Architecture

## Provider-neutral build

Package the application as a standalone Next.js container so it can run on Tower/Coolify, Vercel, or another Node-compatible platform.

Recommended default:

- Tower/Coolify for development and staging;
- production may also run on Tower/Coolify behind Cloudflare;
- Vercel remains an optional lower-operations production route if preferred.

Do not couple content or search to provider-only APIs without adapters.

## Production topology

```text
Users
  ↓
Cloudflare DNS/CDN/WAF
  ↓
Coolify/Tower Next.js web workload
  ├── static/generated content
  ├── Kit API (server-only outbound)
  ├── Typesense search
  └── GlitchTip telemetry
```

## Docker

### Build stage

- pinned Node base image;
- Corepack/pnpm;
- frozen lockfile;
- run docs ingestion;
- validate content;
- run Next.js build;
- generate standalone output;
- produce build manifest.

### Runtime stage

- minimal Node image;
- non-root user;
- standalone server only;
- copy public and static assets;
- no Git credentials;
- no source repositories;
- read-only filesystem when possible;
- health endpoint.

## Health endpoint

```json
{
  "status": "ok",
  "version": "git-sha",
  "builtAt": "2026-08-26T...Z",
  "docsSources": {
    "count": 3,
    "lockHash": "..."
  },
  "search": "configured"
}
```

Do not reveal secrets or internal hostnames.

## Deployment pipeline

1. Source checkout.
2. Dependency install with frozen lockfile.
3. Lint, typecheck, unit tests.
4. Content and docs ingestion.
5. Link and schema validation.
6. Build.
7. Container scan/SBOM.
8. Deploy candidate.
9. Run smoke, accessibility, and synthetic checks.
10. Publish/swap search index.
11. Promote.
12. Retain prior image and search index.

## Rollback

Rollback must restore:

- prior application image;
- prior generated docs lock;
- prior search index alias;
- prior environment configuration if changed.

Content-only changes are still deployments and receive the same rollback capability.

## Domain plan

Launch:

- `paperandslate.org`
- `www.paperandslate.org` → canonical redirect

Reserve:

- `docs.paperandslate.org` → optional redirect to `/docs`
- `status.paperandslate.org` → future status page
- `api.paperandslate.org` → future only
- `console.paperandslate.org` → future only

Do not publish empty future subdomains.

## CDN and caching

- Cloudflare caches immutable assets;
- HTML caching follows Next.js deployment semantics;
- purge on deploy;
- historical docs may receive long cache lifetimes;
- API/newsletter route bypasses cache;
- security headers can be applied at app and edge.
