# External activation boundary

Status: private repository and bounded Tower resource bootstrap completed; hosted application/provider activation and production remain pending
Date: 2026-08-27

The current audit and owner procedure are [`AUDIT_VERIFICATION_REPORT.md`](AUDIT_VERIFICATION_REPORT.md), [`RELEASE_EVIDENCE_HANDOFF.md`](RELEASE_EVIDENCE_HANDOFF.md), and [`NEXT_PHASE_MANUAL_REVIEW.md`](NEXT_PHASE_MANUAL_REVIEW.md).

## Current non-secret state

- Private Forgejo repository: `https://git.tower/callum/paperandslate-web.git`.
- Baseline `main` and `release/v1-closure` branches were pushed under the scoped `callum` namespace. The final remediation commit/tag still requires the release gate.
- Tower-managed staging resources for Typesense `search`, Valkey `cache`, and S3 `release-evidence` were reconciled.
- `.tower/project.yaml` and `infrastructure/tower/intent.yaml` describe staging only; no production target is configured.

## Not activated or not proved

The Coolify workload, immutable hosted registry image, secret bindings, Typesense credentials/indexing, Kit delivery, GlitchTip event, Infisical environment, staging URL, DNS/TLS, hosted monitoring, rollback drill, external syndication, publication workflow, production feed acceptance, signed RC identity, and production deployment remain pending explicit owner authority and evidence. No credential value is stored or reported.

The documentation pipeline reads central, fixture, and local sibling `../standards` sources when available. CI validates the committed generated bundle because the sibling repository is not assumed to exist in a Forgejo checkout; this boundary is explicit in `pnpm docs:bundle:check`.

Codex can perform the next authorized staging/bootstrap steps after the owner returns the redacted package described in `NEXT_PHASE_MANUAL_REVIEW.md`. Production, public GitHub publication, final `v1.0.0`, DNS/TLS mutation, and final human/legal/media approval remain outside this task.
