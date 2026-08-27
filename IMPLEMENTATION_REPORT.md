# Paper & Slate implementation report

Date: 2026-08-27
Status: v1.0.0-rc.1 source remediation verified; post-RC staging health-probe fix is deployed, while hosted release gates remain open
Current source of truth: [`AUDIT_VERIFICATION_REPORT.md`](AUDIT_VERIFICATION_REPORT.md)

This report records the implementation performed against AUDIT-001 through AUDIT-012. It is not a legal approval, production approval, provider receipt, or final release declaration.

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

The current commands and generated reports are listed in [`AUDIT_VERIFICATION_REPORT.md`](AUDIT_VERIFICATION_REPORT.md). The post-fix aggregate run passed all 31 checks with release identity `local-rc-staging-health-fix` and source `59c1e2cb8231866729ad3248d763417aa88790f1`. The intended aggregate command is:

```sh
pnpm verify
```

It includes requirements, docs, content, feeds, routes, security/SEO, formatting, lint, typecheck, tests, production build/browser/visual checks, Lighthouse/performance, container, SBOM, secret scan, vulnerability scan, `launch:report`, and `evidence:bundle`. `VERIFY_SKIP_EXTERNAL=true` is an explicit local opt-out and must not be described as a full verification run.

## Explicitly not completed

The following are not represented as complete: qualified legal/privacy/licensing/trademark/factual/media approvals; provider credentials or privacy decisions; protected Forgejo review/signature and passing CI; hosted immutable OCI artifact/SBOM/provenance; canonical URL configuration; DNS/TLS; hosted monitoring/on-call policy; two-good-deployment rollback drill; production; public GitHub; final `v1.0.0`; external publication/syndication/feed acceptance; authentication; API; and platform integration. The six authorized staging monitors are active/healthy, but prior failures leave historical SLO-budget alerts that require an approved clean-window disposition.

The private Forgejo repository and Tower shared staging resources were created/reconciled under the authorized scope. Immutable tag `v1.0.0-rc.1` points to `031b5447786f9c619288c9044bb5bc65319a30d7`. Follow-up commit `59c1e2cb8231866729ad3248d763417aa88790f1` fixes the missing Coolify health-probe client, is pushed to `release/v1-closure`, and is healthy in Coolify deployment `axrm4kappbnargjw1mbtuie4` for application `ngqtewtqeqhj88v1005a38va`. That follow-up is not a new RC tag, the direct Coolify build has no hosted registry digest, and the remaining owner/operator actions are described in [`NEXT_PHASE_MANUAL_REVIEW.md`](NEXT_PHASE_MANUAL_REVIEW.md) and [`RELEASE_EVIDENCE_HANDOFF.md`](RELEASE_EVIDENCE_HANDOFF.md).
