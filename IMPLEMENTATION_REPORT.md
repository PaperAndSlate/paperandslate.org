# Paper & Slate implementation report

Date: 2026-08-28
Status: RC3 execution is in progress; release closure remains blocked by exact-candidate CI, hosted artifact/provider, monitoring/rollback, and human-approval gates
Current source of truth: [`AUDIT_VERIFICATION_REPORT.md`](AUDIT_VERIFICATION_REPORT.md)
Candidate evidence report: [`V1_RC_REPORT.md`](V1_RC_REPORT.md)

This report records the implementation performed against AUDIT-001 through AUDIT-012. It is not a legal approval, production approval, provider receipt, or final release declaration.

## Current RC3 execution snapshot

The current local source candidate is `fa6cc7db48fc262a03349f32270a88ba735113a4`; local `release/v1-closure` is one commit ahead of the private Forgejo branch at `dc6d78a3886079b7fef8816731969fd88c00b755`, and no push was made for the local follow-up. Historical Forgejo runs 61/container, 62/Lighthouse, and 63/quality failed for the older `06491dc…` candidate; later remote dispatches 64–69 for `dc6d78a…` were rejected before runner assignment. Deployment `b4c1jatqaidljtcpc4nly1yp` also belongs to `06491dc…`, is a direct source-build deployment without an immutable OCI digest, and is not evidence for local `fa6cc7d…`. This report must not be read as an RC3 closure or as proof of production readiness.

Read-only hosted checks against that older staging deployment returned 200 for the representative route/publication set and all three feeds; mapped browser smoke passed 12 representative routes without console, page, or request errors. A one-off mapped Lighthouse sweep scored all six configured routes at 1.0 in each category, with slow-load warnings on `/` and `/projects/file-system`. These are historical hosted observations for `06491dc…`, not current-candidate evidence. The image-bearing route still needs browser-delivery diagnosis, and route-specific `og:url` metadata is inconsistent with its canonical URL.

The RC2 implementation snapshot below is retained for historical provenance and requires receipt-bound regeneration after the RC3 candidate is verified.

## Historical RC2 implementation snapshot

The current candidate source is `7aaa9b45ba0b6264d089eb530ecfd471a8e2008b` on private Forgejo branch `release/v1-closure`, deployed to authorized staging as `v1.0.0-rc.2` at Coolify deployment `zzpooecepztro4urk5sx6obv` for application `ngqtewtqeqhj88v1005a38va`. Staging health reports `deployment=staging`, `releaseId=v1.0.0-rc.2`, and the exact SHA at `https://paper-and-slate-web.dev.tower`.

The exact-SHA hosted publication check passed 12 routes and three feeds, hosted Lighthouse passed 12 reports across six routes, and the visual harness captured 13 states with no runtime errors. Visual comparison and rights remain human-review-pending. The full local `pnpm verify` passed at `65f739168f71e6c8a6b9c16d5c09929b0ead41cc`; final candidate focused formatting, lint, typecheck, and standards-change tests passed at `7aaa9b45ba0b6264d089eb530ecfd471a8e2008b`.

## Implemented changes

- Production CSP now uses a request-scoped nonce, keeps production free of `unsafe-eval`, and propagates the nonce through the dynamic root layout. Headers and health identity are checked against a real standalone production artifact.
- Documentation project roots, current/historical version routes, aliases, breadcrumbs, canonical metadata, raw routes, sitemap entries, search records, and AI-readable outputs use a shared normalized route model. Draft records are excluded from public discovery surfaces.
- Lighthouse and container wrappers use explicit async entrypoints, isolated ports/runtime directories, supported standalone launch, retained JSON/HTML evidence, and nonzero failure behavior. The performance checker enforces category, web-vitals, resource-size, font, image, CSS, JavaScript, and request-count budgets.
- The search accessible-name mismatch was corrected. Production browser evidence covers search, theme, mobile navigation, docs, health, and runtime/CSP errors.
- A clean 13-state visual evidence harness captures the production build, hashes each screenshot/reference, and deliberately leaves comparison and rights approval to humans. A small component/state library page provides evidence coverage for loading, empty, error, form, callout, code, badge, and button states.
- The requirements ledger now distinguishes substantive WEB-REQ status from index-only plan traceability and records implementation files, checks, evidence, blockers, and update time.
- Newsletter handling now bounds streamed bodies, enforces same-origin policy, uses an explicit trusted-proxy mode, supports distributed Valkey idempotency/rate limiting when configured, and fails closed when configured Valkey is unavailable. Focused tests cover malformed, oversized, chunked, duplicate, rate, and provider-failure paths.
- Publication state/date policy is centralized and tested. Feeds, sitemap, search, `llms.txt`, `llms-full.txt`, and release discovery use the same public filters.
- Docker packaging validates the committed generated docs bundle rather than assuming a sibling checkout, excludes volatile evidence/node_modules from context, runs as non-root, and exposes a healthcheck. `docs:bundle:check` makes the CI boundary explicit.
- Launch reporting and evidence bundling now derive current statuses from generated evidence, record source/lock/image identity, hash included files, and list owner-only gates without hiding them.

## Local evidence recorded

The historical commands and generated reports are listed in [`AUDIT_VERIFICATION_REPORT.md`](AUDIT_VERIFICATION_REPORT.md) and [`V1_RC_REPORT.md`](V1_RC_REPORT.md). The earlier aggregate local run passed 28 local checks with release identity `rc2-local-final` and source `65f739168f71e6c8a6b9c16d5c09929b0ead41cc`, with external checks intentionally skipped; that receipt is not current-candidate evidence. The intended aggregate command is:

```sh
pnpm verify
```

It includes requirements, docs, content, feeds, routes, security/SEO, formatting, lint, typecheck, tests, production build/browser/visual checks, Lighthouse/performance, container, SBOM, secret scan, vulnerability scan, `launch:report`, and `evidence:bundle`. `VERIFY_SKIP_EXTERNAL=true` was an explicit local opt-out for that aggregate run and must not be described as a full external verification run. Hosted staging publication and Lighthouse were subsequently run separately against the exact candidate SHA.

## Explicitly not completed

The following are not represented as complete: qualified legal/privacy/licensing/trademark/factual/media approvals; final provider privacy/activation decisions; protected Forgejo review/signature and passing CI; hosted immutable OCI artifact/SBOM/provenance; release-specific SLO evidence; two-good-deployment rollback drill; production; public GitHub; final `v1.0.0`; external publication/syndication acceptance; authentication; API; and platform integration. The six authorized staging monitors have fresh healthy probes, but the available SLO is a degraded historical 24-hour window and one controller route-materialization check remains advisory.

The private Forgejo repository and Tower shared staging resources were reconciled under the authorized scope. Immutable tag `v1.0.0-rc.1` remains at `031b5447786f9c619288c9044bb5bc65319a30d7`; it was not moved or retagged. The local `fa6cc7d…` candidate is not tagged or hosted, and its technical gates have not been run by hosted CI. Typesense is empty and the app reports static fallback with `providerReady:false`; S3/Valkey resource probes are healthy, but app-level Valkey behavior and the final exact-SHA GlitchTip event remain open. The registry has no hosted image for the older `06491dc…` candidate, so no current-candidate OCI/SBOM/provenance/signature or rollback proof is claimed. Remaining owner/operator actions are described in [`NEXT_PHASE_MANUAL_REVIEW.md`](NEXT_PHASE_MANUAL_REVIEW.md), [`RELEASE_EVIDENCE_HANDOFF.md`](RELEASE_EVIDENCE_HANDOFF.md), and [`RC3_REMEDIATION_AND_OWNER_ACTION_PLAN.md`](RC3_REMEDIATION_AND_OWNER_ACTION_PLAN.md).
