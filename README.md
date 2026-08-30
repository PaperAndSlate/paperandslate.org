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

## Who it is for

Developers and implementers first, followed by educators, schools and districts, education software companies, public data organizations, researchers, standards contributors, and the public.

## What it provides

The public front door, unified `/docs` experience, project/status/governance presentation, and controlled ingestion of source-adjacent project documentation.

## Documentation and architecture

Start with [`plans/README.md`](plans/README.md), then the strategy pack, information architecture, documentation product strategy, technical architecture, ADRs, implementation ledger, and active goal states. Better Auth owns humans; Web owns project/API-key lifecycle; Data Platform receives a verifier projection only.

## Relationship and evidence boundary

Web explains and enables the independent projects; it does not replace their source authority. Keep Developer Control Plane work separate from RC3, launch, release, deployment, and production claims. See [`AGENTS.md`](AGENTS.md) for orchestration and evidence rules.

## Contribution

Keep public copy source-backed, explicit about maturity and legal status, and consistent with the Paper & Slate brand and experience contract.
