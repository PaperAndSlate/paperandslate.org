# Paper & Slate

This repository is the local foundation for the Paper & Slate public website and documentation system. It currently provides a blank, branded Next.js App Router shell and workspace tooling.

## Local development

Requires Node.js 20.9+ and pnpm 10.6.0.

```sh
pnpm install
pnpm --filter @paper-and-slate/web dev
```

The application is intentionally static and infrastructure-free at this phase. Future content and documentation work will be added only when its source, provenance, and review status are clear.

## Verification

Run `pnpm verify` for the aggregate local gate. It includes the focused
format, lint, type, test, build, package, reproducibility, workflow, license,
browser, and evidence checks; container, hosted, and provider checks remain
environment-dependent. See [IMPLEMENTATION_LEDGER.md](IMPLEMENTATION_LEDGER.md)
for the current scope and deferred work.

## Licensing and status

Code is Apache-2.0 and documentation is intended for CC BY 4.0 unless a file states otherwise. The Paper & Slate name and marks are reserved; see [TRADEMARKS.md](TRADEMARKS.md). This is a local implementation foundation, not a claim of institutional status, endorsement, certification, or launch readiness.
