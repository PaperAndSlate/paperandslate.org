# ADR 0002: Framework compatibility floor

## Status

Accepted for the local compatibility prerequisite.

## Decision

Pin the existing web application framework floor to these exact versions:

- Next.js: `15.5.24`
- React: `19.2.8`
- React DOM: `19.2.8`
- `@types/react`: `19.2.18`
- `@types/react-dom`: `19.2.5`

This is a dependency-floor upgrade only. The existing custom docs renderer remains the current local fallback. The docs ingestion pipeline, generated registries, static fallback/search, raw Markdown routes, and truthful content remain authoritative and are preserved.

## Fumadocs and Tailwind boundary

Fumadocs Core/UI/MDX integration and Tailwind integration are deferred to a separately approved package. This decision does not add those packages, add peer overrides, conceal incompatible peer requirements, or change the current renderer into a claim of Fumadocs parity.

## Rationale

The previous Next.js 15.2.2 and React 19.0.0 floor was below the compatibility required by the considered Fumadocs MDX package. Next.js 15.5.24 with React 19.2.8 establishes the approved prerequisite while keeping the current local documentation behavior stable and the integration boundary explicit.

## Consequences

The web package and lockfile carry only the specified framework and React type updates. Documentation rendering remains locally supported by the custom renderer. Fumadocs component parity, Tailwind styling, and related browser/accessibility acceptance remain future work and require separate approval.
