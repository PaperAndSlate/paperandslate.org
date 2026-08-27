# ADR 0003: Dependency security floor

## Status

Accepted for T100 local remediation.

## Decision

Pin the security remediation floor to these exact versions:

- Next.js `16.3.3`
- React `19.2.8` and React DOM `19.2.8` (preserved)
- `@playwright/test` `1.55.1`
- `yaml` `2.8.3`

Update the pnpm lockfile from these direct manifest pins and enforce a production dependency audit in CI with `pnpm audit --prod`. The audit gate must not be bypassed with overrides, hidden installs, or unrelated dependency changes.

## Context

The previous floor used Next.js `15.5.24`, `@playwright/test` `1.51.1`, and `yaml` `2.7.0`; the current advisory set includes vulnerable PostCSS transitively supplied by the older Next.js line and vulnerable direct tooling/runtime YAML floors. These exact versions are the approved remediation slice.

The existing custom docs renderer, ingestion pipeline, generated registries, static fallback/search, raw routes, and truthful content are preserved. Fumadocs and Tailwind are intentionally deferred because they require a separately approved compatibility and product-surface change.

## Consequences

The repository receives a narrow, auditable dependency floor with React unchanged and no dependency overrides. Full application verification remains required after installation, including routes, content/docs validation, SEO/security checks, lint/typecheck, browser smoke, and build verification.
