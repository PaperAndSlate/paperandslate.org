# ADR 0004: Fumadocs, Tailwind 4, and the source-owned docs system

Status: accepted for the local Phase 1/3 foundation (2026-08-26)

## Decision

Pin Fumadocs Core/UI 16.15.2, Fumadocs MDX 15.3.1, Tailwind CSS 4.3.3, `@tailwindcss/postcss` 4.3.3, PostCSS 8.5.26, `@types/mdx` 2.0.14, and Phosphor Icons 2.1.10 alongside Next.js 16.3.3. The Next MDX integration is installed at the application boundary, while the central reviewed-document adapter uses Fumadocs' server Markdown renderer.

Only the two reviewed `central:next` records cross the adapter. Fixture, sibling-local, and future Git-imported records continue through the escaped custom renderer and existing ingestion validation. This keeps provenance, raw routes, static search, registry identity, and source safety independent of presentation.

## Local evidence and limits

Strict-peer installation and registry metadata pass locally, and the dedicated docs tests cover the boundary and accessible docs surfaces. This is local implementation evidence only. It does not claim production deployment, legal/factual approval, provider activation, provenance parity, or complete Fumadocs feature parity.
