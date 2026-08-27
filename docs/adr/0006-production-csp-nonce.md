# ADR 0006: Request-scoped nonce for production CSP

Status: accepted for v1 release-candidate implementation  
Date: 2026-08-27

## Decision

Production responses generate a request-scoped nonce, pass it through the request headers used by the Next root layout, and emit a matching `script-src 'self' 'nonce-…'` policy without `unsafe-eval` or production `unsafe-inline` scripts. The root layout is dynamic because a static cached document cannot safely carry a per-request nonce. Development keeps its explicit framework allowances only in development.

## Consequences

The policy protects inline bootstrap/flight scripts while preserving hydration and interaction. Production browser checks must fail on CSP violations, hydration/runtime errors, failed chunks, or broken search/theme/mobile actions. HSTS and other security headers are emitted under the approved HTTPS condition. A hosted staging deployment must reproduce the local behavior before promotion.
