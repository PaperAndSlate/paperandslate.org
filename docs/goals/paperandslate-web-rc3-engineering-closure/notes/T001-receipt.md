# T001: RC3 release and hosted-validation state reconstruction

Task: `T001`
Kind: `scout`
Status: `current`

## Summary

RC3 is not closure-ready. Local and `origin/release/v1-closure` agree at `06491dc57fa3f3a43c365a4ab24e07f21e7b04d6`, but exact-candidate CI runs 61/container, 62/Lighthouse, and 63/quality failed. Source-build staging deployment `b4c1jatqaidljtcpc4nly1yp` is healthy and identity-verified, yet reports `providerReady:false` and has no immutable OCI digest. Hosted route/feed/browser evidence is partially positive; image delivery and route-specific `og:url` defects remain. Provider, artifact, SLO, rollback, approval, and release-tag gates remain open.

## Details

- The worktree contains six pre-existing modified release-closure documents: `EXTERNAL_ACTIVATION.md`, `IMPLEMENTATION_REPORT.md`, `LAUNCH_READINESS.md`, `NEXT_PHASE_MANUAL_REVIEW.md`, `RC3_REMEDIATION_AND_OWNER_ACTION_PLAN.md`, and `RELEASE_EVIDENCE_HANDOFF.md`. The new GoalBuddy board is also untracked.
- The private remote is `https://git.tower/callum/paperandslate-web.git`; `main` is `5b09ead`; immutable RC1 remains at `031b5447786f9c619288c9044bb5bc65319a30d7`; no RC3 or final tag exists.
- Run 61 recorded a running/ready container and Next.js readiness, but the runner-side health fetch to `127.0.0.1:3211` failed. Run 62 discovered Chrome but failed to launch as root without a sandbox. Run 63 has no green quality receipt.
- Hosted publication/feed checks returned 200; mapped browser smoke passed 12 routes; a one-off mapped Lighthouse sweep scored six routes at 1.0 with slow-load warnings on `/` and `/projects/file-system`. Visual capture remains blocked by image delivery, and non-home `og:url` is inconsistent with the canonical URL.
- Generated evidence is stale or failed: `.generated/launch/repository-identity.json` references `65f7391`/RC2-local-final, `verify.json` is failed, `container-check.json` is failed on Docker timeout, and `staging-publication.json` references historical `7aaa9b45`/RC2.
- Local capabilities include Node, pnpm, Git, Docker, and curl; Chrome/google-chrome/Playwright commands are absent. No secret values were printed.

## Recommended next package

P0: make container health probing topology explicit and bounded while making hosted browser execution non-root/sandbox-safe, with focused regression coverage. Preserve the existing health identity proof and do not lower browser thresholds. Repository-controlled fixes after that are image delivery and route metadata, then evidence identity hardening and timeout/provider-readiness truth. External/provider issues remain operator-owned: Forgejo runner/log/rerun visibility, Tower environment-contract HTTP 500, Tempo 503, Typesense indexing/credentials, Valkey application behavior, GlitchTip exact-SHA event, OCI publication/signing/provenance, digest deployment, monitor correction, SLO/rollback, and human/legal/publication approvals.
