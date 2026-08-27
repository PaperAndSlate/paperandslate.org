# Paper & Slate launch readiness

Date: 2026-08-27
Verdict: v1.0.0-rc.2 candidate is healthy in private staging and hosted machine evidence is partially green; not approved for final release or production

## Current candidate

Candidate source `7aaa9b45ba0b6264d089eb530ecfd471a8e2008b` is deployed as `v1.0.0-rc.2` to `https://paper-and-slate-web.dev.tower` in Coolify deployment `zzpooecepztro4urk5sx6obv`. `/health` reports the exact staging deployment, release, and SHA. Immutable `v1.0.0-rc.1` remains unchanged at `031b5447786f9c619288c9044bb5bc65319a30d7`; `v1.0.0-rc.2` has not been tagged.

## What is green locally

The local aggregate run passed 28 checks at source `65f739168f71e6c8a6b9c16d5c09929b0ead41cc` with external checks intentionally skipped. Final-candidate focused format, lint, typecheck, and standards-change tests passed at `7aaa9b45ba0b6264d089eb530ecfd471a8e2008b`. Hosted staging publication passed 12 routes and three feeds; hosted Lighthouse passed 12 reports across six routes; and the visual harness captured 13 states without runtime errors. Visual comparison and rights approval remain human-review-pending.

Run and inspect:

```sh
pnpm verify
```

The generated evidence is under `.generated/launch/` and the release bundle is under `.generated/evidence/<release-id>/`. The visual manifest stays human-review-pending by design.

## Gates still required

1. Passing private Forgejo CI task logs/artifacts and protected review. Exact-candidate runs 25–27 failed and Tower exposed no Actions jobs/tasks, so the provider failure must be inspected in Forgejo before another workflow change or rerun.
2. Keep immutable `v1.0.0-rc.1` at `031b544...`; create `v1.0.0-rc.2` only after the exact source has passing CI, approved review/signature, hosted immutable OCI digest, SBOM, provenance, scan, and vulnerability disposition.
3. The authorized Coolify staging workload is healthy at deployment `zzpooecepztro4urk5sx6obv`; hosted canonical, publication, feed, and Lighthouse checks pass. Route-specific monitor materialization still needs controller review.
4. Complete or explicitly defer provider gates: Typesense collection/index/alias/ranking/facet/preview evidence, app-level Valkey TTL/idempotency/rate-limit/failure tests, a final exact-SHA GlitchTip event, and the Kit decision. The application remains in safe static-fallback mode.
5. Human visual comparison and media/font rights approval; current captures retain rights-review-pending watermarks.
6. Qualified legal/privacy/licensing/trademark and factual/institutional/people/project/funding approval.
7. DNS/TLS ownership for any production host, release-specific SLO/on-call and historical-alert disposition, and a two-good-deployment staging rollback drill. Fresh monitor probes pass, but the available 24-hour SLO is historical and degraded.
8. Private OCI image, image/lockfile SBOM, provenance, signature, registry scan, and deployed-digest equality. The project-scoped registry is currently empty.
9. Publication/correction/syndication ownership and production feed acceptance. Staging route/feed validation is evidence, not editorial or public-publisher approval.

Production deployment, DNS/TLS changes, public GitHub publication, final `v1.0.0`, authentication, API, and platform integration remain outside this task. The exact owner/operator steps are in [`NEXT_PHASE_MANUAL_REVIEW.md`](NEXT_PHASE_MANUAL_REVIEW.md) and [`RELEASE_EVIDENCE_HANDOFF.md`](RELEASE_EVIDENCE_HANDOFF.md).
