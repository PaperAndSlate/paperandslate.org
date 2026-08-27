# Paper & Slate launch readiness

Date: 2026-08-27
Verdict: immutable RC1 and healthy staging follow-up verified; not approved for hosted or production launch

## What is green locally

The current production artifact passes the source/build/content gates, route and link validation, production CSP/hydration/browser checks for 12 routes, Lighthouse assertions for 6 indexable routes with 12 runs, performance budgets, container health/non-root checks, focused search/newsletter tests, secret scanning, and local SBOM generation. Thirteen production visual states have been captured without runtime errors, including a live authorized-staging capture that remains human-review-pending.

Run and inspect:

```sh
pnpm verify
```

The generated evidence is under `.generated/launch/` and the release bundle is under `.generated/evidence/<release-id>/`. The visual manifest stays human-review-pending by design.

## Gates still required

1. Passing private Forgejo CI task logs/artifacts and protected review; current runs 10–19 are failed and have no task-level logs exposed through Tower.
2. Keep immutable `v1.0.0-rc.1` at `031b544...`; if the `59c1e2c...` follow-up is selected, create a new authorized RC tag with verified signature, hosted immutable OCI digest, SBOM, provenance, and vulnerability disposition.
3. The authorized Coolify staging workload and six monitors are healthy at deployment `axrm4kappbnargjw1mbtuie4`; complete canonical URL configuration and full hosted browser/feed acceptance.
4. Typesense, Kit, Valkey, GlitchTip, and secret-manager activation/round-trip evidence; Typesense currently returns 401 and the application is intentionally using static fallback.
5. Human visual comparison and media/font rights approval; current captures retain rights-review-pending watermarks.
6. Qualified legal/privacy/licensing/trademark and factual/institutional/people/project/funding approval.
7. DNS/TLS ownership, canonical URL, SLO/on-call, incident policy, historical-alert disposition, and a two-good-deployment staging rollback drill.
8. Publication/correction/syndication ownership and production feed acceptance.

Production deployment, DNS/TLS changes, public GitHub publication, final `v1.0.0`, authentication, API, and platform integration remain outside this task. The exact owner/operator steps are in [`NEXT_PHASE_MANUAL_REVIEW.md`](NEXT_PHASE_MANUAL_REVIEW.md) and [`RELEASE_EVIDENCE_HANDOFF.md`](RELEASE_EVIDENCE_HANDOFF.md).
