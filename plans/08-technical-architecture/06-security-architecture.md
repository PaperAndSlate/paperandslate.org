# Security Architecture

## Threat model summary

The launch application is mostly public and static, but important risks remain:

- malicious or compromised documentation source;
- MDX code execution;
- supply-chain compromise;
- server-side request forgery in future URL validators;
- newsletter abuse and secret exposure;
- cross-site scripting through content;
- unsafe SVG or HTML;
- preview content leakage;
- dependency vulnerabilities;
- deployment and Git credential compromise.

## Trust boundaries

1. Browser
2. Next.js server/runtime
3. Git-backed local content
4. Imported approved repositories
5. Search provider
6. Kit
7. GitHub/Tower CI and secrets

## Imported content

Treat imported docs as untrusted data even when repositories are in the PaperAndSlate organization.

Controls:

- no arbitrary MDX ESM;
- allowlisted components;
- sanitized raw HTML;
- safe URL protocols only;
- SVG sanitization or rasterization;
- size limits;
- path traversal prevention;
- no build hook execution;
- source allowlist;
- provenance and hash verification.

## Content Security Policy

Adopt a strict CSP. Target:

- `default-src 'self'`;
- nonce- or hash-based scripts;
- restrict images to self and approved providers;
- restrict connections to search, analytics, and Kit proxy endpoints;
- no `unsafe-eval` in production;
- frame ancestors denied unless deliberate embedding is supported.

Account for Next.js requirements during implementation and test headers in CI.

## Security headers

- HSTS after HTTPS is stable;
- `X-Content-Type-Options: nosniff`;
- Referrer Policy;
- Permissions Policy;
- CSP;
- frame restrictions;
- cross-origin policies where compatible.

## Newsletter route

- server-only secret;
- Zod validation;
- body size limit;
- rate limit;
- honeypot;
- timeout and retry limits;
- redacted logs;
- generic responses;
- CSRF risk assessed because endpoint accepts public submissions; validate Origin/Host when appropriate.

## Search

Use search-only key. Do not proxy through a privileged write credential. Limit preview index access if previews include unpublished content.

## Preview deployments

- noindex;
- random/PR domains;
- no production Kit submissions;
- separate search collection;
- no production secrets unless required;
- optional access protection for sensitive drafts.

## Supply chain

- lockfile required;
- automated dependency updates;
- GitHub dependency review;
- SBOM generation through Tower registry tooling when containerized;
- vulnerability scanning;
- provenance/attestation where available;
- minimal production image;
- non-root container user;
- read-only filesystem where practical.

## Security reporting

Publish `SECURITY.md` and a non-public contact path. Define response expectations and coordinated disclosure.

## Future URL checker warning

A `.well-known` domain checker creates significant SSRF and DNS-rebinding risk. Before implementation, require:

- scheme allowlist;
- DNS resolution and private/reserved range blocking;
- redirect revalidation;
- response size/time limits;
- no arbitrary ports;
- isolated egress worker;
- audit logging without sensitive response content.
