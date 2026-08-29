# Paper & Slate launch readiness

Date: 2026-08-28
Verdict: repository-controlled hosted-validation readiness is locally complete; RC3 closure, launch, publication, and production readiness remain externally blocked

## Current local candidate

- The exact candidate commit, tree, branch, remote relationship, and worktree state are recorded in `.generated/launch/repository-identity.json`, `.generated/requirements/traceability-check.json`, and the latest `.generated/evidence/<release-id>/manifest.json`.
- The candidate is intentionally local. It has not been pushed, tagged, released, deployed, published, or rebound to any historical RC receipt.
- An immediately following commit that changes only `IMPLEMENTATION_LEDGER.md` and `.generated/requirements/` is an evidence-only descendant under the repository source-state policy. It does not create a new application candidate.
- The current generated register contains 1,073 uniquely identified requirements mapped across all 89 planning Markdown files. Local verification status is classified separately from hosted, provider, deployment, artifact, release, and human evidence.

## Local verification

The final candidate must be accepted only from a successful `pnpm verify` run with external skips disabled. That aggregate run covers:

- workflow policy, traceability, documentation ingestion and validation, search indexing, content, feeds, release records, routes, security, licensing, SEO, and rollback policy;
- repository formatting, lint, TypeScript, unit tests, production builds, clean package consumers, and deterministic generation;
- browser smoke, automated release-candidate accessibility, links, visual baselines, production browser checks, and local visual capture;
- wrapper failure behavior, non-root Docker build/runtime/health, SBOM generation, repository identity, secret/security scanning, Lighthouse, performance budgets, vulnerability reporting, launch reporting, and evidence bundling.

The Lighthouse gate is local evidence only. It requires all six configured routes, two runs per route, retained route identity in the aggregate summary, and the existing category and resource/performance budgets. The Docker gate is local evidence only and requires a non-root UID, declared health check, exact local release identity, and a successful local runtime probe. Neither gate is hosted CI or staging proof.

Generated evidence lives under `.generated/launch/`; the hashed local bundle lives under `.generated/evidence/<release-id>/`. The visual manifest remains `human-review-pending` by design even when automated visual checks pass.

## Historical hosted evidence

- Forgejo runs 61/container, 62/Lighthouse, and 63/quality failed for `06491dc57fa3f3a43c365a4ab24e07f21e7b04d6`. Later dispatches did not produce a current-candidate hosted receipt.
- Staging deployment `b4c1jatqaidljtcpc4nly1yp` used the older `06491dc…` source-build candidate. Its healthy `/health` response, publication/feed checks, browser checks, and Lighthouse results are historical staging evidence only.
- Historical RC2 source `7aaa9b45ba0b6264d089eb530ecfd471a8e2008b` and deployment `zzpooecepztro4urk5sx6obv` remain provenance records, not current RC3 evidence.
- Immutable RC1 remains `031b5447786f9c619288c9044bb5bc65319a30d7`. There is no current-candidate RC3 tag or immutable hosted artifact.

No historical hosted, staging, provider, monitor, publication, or artifact receipt is promoted to the current local candidate.

## Hosted and operator gates

1. Push the exact approved candidate only under repository-owner authority, then obtain exact-SHA GitHub/Forgejo CI, CodeQL, dependency-review, protected-review, and branch-protection receipts across the supported platform matrix.
2. Build and publish an immutable OCI artifact from that exact candidate. Record the hosted digest, image and lockfile SBOMs, scan disposition, provenance, signature or approved signing exception, and deployed-digest equality.
3. Deploy the exact immutable digest to authorized staging. Record deployment identity, `/health`, canonical/metadata, route, browser, accessibility, visual, publication, feed, and post-deploy provider receipts without rebinding older source-build evidence.
4. Complete Typesense collection/index/alias/ranking/facet/preview validation and prove static fallback under provider failure.
5. Complete application-level Valkey TTL, shared idempotency, distributed rate-limit, restart, and failure-policy validation.
6. Repair or approve the managed GlitchTip DSN binding and capture an exact-candidate labelled event. Keep newsletter/Kit disabled until provider and privacy approval exists.
7. Start a release-specific monitor/SLO window against the exact deployment, retain historical degraded SLO evidence, approve on-call ownership, and execute a two-good-deployment A-to-B-to-A rollback drill.
8. Obtain DNS/TLS, canonical production host, deployment, rollback, registry, release/tag, and publication authority before any production mutation.

## Human gates

- Visual comparison, brand, manual assistive-technology, media/font/icon provenance and rights approval.
- Qualified legal, privacy, licensing, trademark, factual, institutional, people, project, funding, governance, editorial, vulnerability-disposition, and security approval.
- Publication, corrections, syndication, feed, on-call/SLO, rollback, release-owner, reviewer, and production acceptance.

The standards project remains Planned/Experimental; EOM is not IANA-registered or production-final; data-platform and standards-registry outputs are not official without source-rights proof; UI claims remain unauthorized; icon/media rights await accepted provenance repair; and Documents terminology remains authoritative.

Production deployment, DNS/TLS changes, public GitHub publication, final `v1.0.0`, authentication, API, and platform integration remain outside this local integration task. Operator steps remain in [`NEXT_PHASE_MANUAL_REVIEW.md`](NEXT_PHASE_MANUAL_REVIEW.md) and [`RELEASE_EVIDENCE_HANDOFF.md`](RELEASE_EVIDENCE_HANDOFF.md).
