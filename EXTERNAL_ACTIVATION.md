# External activation boundary

Status: RC3 staging execution is partially active; exact-candidate verification, hosted artifact/provider activation, and production remain pending
Date: 2026-08-28

The current audit and owner procedure are [`AUDIT_VERIFICATION_REPORT.md`](AUDIT_VERIFICATION_REPORT.md), [`RELEASE_EVIDENCE_HANDOFF.md`](RELEASE_EVIDENCE_HANDOFF.md), and [`NEXT_PHASE_MANUAL_REVIEW.md`](NEXT_PHASE_MANUAL_REVIEW.md).

## Current RC3 execution state

- Remote private Forgejo `release/v1-closure` and local `HEAD` agree at `06491dc57fa3f3a43c365a4ab24e07f21e7b04d6`; the follow-up CI/browser/container fixes are now remote evidence. RC1 remains unchanged at `031b5447786f9c619288c9044bb5bc65319a30d7`, and no RC3 or final tag exists.
- Coolify application `ngqtewtqeqhj88v1005a38va` completed exact-SHA source-build staging deployment `b4c1jatqaidljtcpc4nly1yp` for `06491dc…`; the deployment receipt records a healthy replacement container and exact source import. Direct `/health` verification returned `v1.0.0-rc.3`, `staging`, and the exact SHA, but provider readiness is false and no immutable OCI digest is attached.
- Staging non-secret release, canonical, and Typesense configuration variables reconciled healthy without exposing values. Typesense infrastructure is healthy but its authoritative collection still has zero documents; application-level search remains unverified.
- Exact-candidate CI is not green: Forgejo runs 61/container, 62/Lighthouse, and 63/quality all failed. Run 61 recorded a running/ready container whose host-side health fetch failed; run 62 found Chrome but could not launch it as root without a sandbox; run 63 has no green quality receipt.
- Tower-side DNS and `/health` jobs succeeded for staging, but returned no response identity; they are reachability receipts, not candidate acceptance. The full provider contract also failed on Tempo HTTP 503, while the project health snapshot remains degraded due CI, unresolved synthetic history, empty Typesense, and historical SLO burn.
- Read-only hosted publication checks returned 200 for the representative route set and RSS/Atom/JSON Feed; mapped browser smoke passed 12 representative routes without console, page, or request errors. Mapped Lighthouse scored all six configured routes at 1.0 in each category, but `/` and `/projects/file-system` emitted slow-load warnings. Hosted visual capture remains blocked by an image-load issue, and route-specific `og:url` does not match the canonical on non-home pages.

The historical activation notes below remain useful for context but are not proof of RC3 activation.

## Current non-secret state

- Private Forgejo repository: `https://git.tower/callum/paperandslate-web.git`.
- Baseline `main` and `release/v1-closure` branches were pushed under the scoped `callum` namespace. The final remediation commit/tag still requires the release gate.
- Tower-managed staging resources for Typesense `search`, Valkey `cache`, and S3 `release-evidence` were reconciled.
- `.tower/project.yaml` and `infrastructure/tower/intent.yaml` describe staging only; no production target is configured.

## Not activated or not proved

The Coolify workload, immutable hosted registry image, secret bindings, Typesense credentials/indexing, Kit delivery, GlitchTip event, Infisical environment, staging URL, DNS/TLS, hosted monitoring, rollback drill, external syndication, publication workflow, production feed acceptance, signed RC identity, and production deployment remain pending explicit owner authority and evidence. No credential value is stored or reported.

The documentation pipeline reads central, fixture, and local sibling `../standards` sources when available. CI validates the committed generated bundle because the sibling repository is not assumed to exist in a Forgejo checkout; this boundary is explicit in `pnpm docs:bundle:check`.

Codex can perform the next authorized staging/bootstrap steps after the owner returns the redacted package described in `NEXT_PHASE_MANUAL_REVIEW.md`. Production, public GitHub publication, final `v1.0.0`, DNS/TLS mutation, and final human/legal/media approval remain outside this task.
