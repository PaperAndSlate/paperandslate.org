# Security policy

This repository is a local Phase 0 bootstrap and has no authentication, data store, provider integration, or production deployment. Do not submit credentials or personal data in issues or source files.

The security reporting contact and supported-version policy are not yet established. Until they are, report suspected issues privately to the project maintainer through an approved channel. This placeholder is not a promise of response time or production support.

## Developer Control Plane non-production boundary

DCP-1A adds a disabled-by-default, fixture-gated server-side kernel and migration intent only. It does not add public auth routes, a live database, a real API-key provider, Data transport, credentials, Tower resources, deployment, or production support. Synthetic fixture material must never enter source or generated evidence. Plaintext keys, session material, authorization headers, verifier material, and secret values are prohibited from persistence, audit, outbox, metrics, errors, logs, and receipts. See `docs/security/developer-control-plane-threat-model.md` and `docs/privacy/developer-control-plane-data-handling.md` for the bounded controls and remaining gates.
