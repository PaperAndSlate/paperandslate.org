# Paper & Slate launch readiness

Date: 2026-08-27
Verdict: locally verified release candidate; not approved for hosted or production launch

## What is green locally

The current production artifact passes the source/build/content gates, route and link validation, production CSP/hydration/browser checks for 12 routes, Lighthouse assertions for 6 indexable routes with 12 runs, performance budgets, container health/non-root checks, focused search/newsletter tests, secret scanning, and local SBOM generation. Thirteen production visual states have been captured without runtime errors.

Run and inspect:

```sh
pnpm verify
```

The generated evidence is under `.generated/launch/` and the release bundle is under `.generated/evidence/<release-id>/`. The visual manifest stays human-review-pending by design.

## Gates still required

1. Final reviewed source commit and private Forgejo CI receipt.
2. `v1.0.0-rc.1` tag/signature, hosted immutable OCI digest, SBOM, provenance, and vulnerability disposition.
3. Authorized Tower/Coolify staging workload, secret bindings, deployment ID, and health/browser/feed acceptance.
4. Typesense, Kit, Valkey, GlitchTip, and secret-manager activation/round-trip evidence.
5. Human visual comparison and media/font rights approval.
6. Qualified legal/privacy/licensing/trademark and factual/institutional/people/project/funding approval.
7. DNS/TLS ownership, canonical URL, SLO/on-call, monitor, incident, and staging rollback authority/evidence.
8. Publication/correction/syndication ownership and production feed acceptance.

Production deployment, DNS/TLS changes, public GitHub publication, final `v1.0.0`, authentication, API, and platform integration remain outside this task. The exact owner/operator steps are in [`NEXT_PHASE_MANUAL_REVIEW.md`](NEXT_PHASE_MANUAL_REVIEW.md) and [`RELEASE_EVIDENCE_HANDOFF.md`](RELEASE_EVIDENCE_HANDOFF.md).
