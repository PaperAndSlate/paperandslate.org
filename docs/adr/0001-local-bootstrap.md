# ADR 0001: Local Phase 0 bootstrap

- Status: accepted for local implementation
- Date: 2026-08-26

## Decision

Use a pnpm workspace with Turborepo, one Next.js App Router application, and a small shared configuration package. Keep the first shell static, server-component-first, and free of authentication, databases, ORM, queues, object storage, and provider activation.

## Exact versions

The initial dependency versions are pinned exactly in the manifests and `pnpm-lock.yaml`: pnpm 10.6.0; Node engine >=20.9.0; Next.js 15.2.2; React and React DOM 19.0.0; TypeScript 5.8.2; ESLint 9.22.0; Prettier 3.5.3; Vitest 3.0.8; Turborepo 2.4.4; Zod 3.24.2; Node types 22.13.10; React types 19.0.10; React DOM types 19.0.4.

## Consequences

The repository can be installed, linted, typechecked, tested, formatted, and built locally without credentials or external services. Content, documentation, governance, and production operations remain later slices and must not be represented by this shell as complete.

## Reconsideration

Revisit framework and dependency versions through a deliberate update with regenerated lockfile and verification. Any production legal, trademark, institutional, or provider claim requires evidence and appropriate review first.
