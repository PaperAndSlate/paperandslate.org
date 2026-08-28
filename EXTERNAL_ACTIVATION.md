# External activation boundary

Status: RC3 staging execution is partially active; exact-candidate verification, hosted artifact/provider activation, and production remain pending
Date: 2026-08-28

The current audit and owner procedure are [`AUDIT_VERIFICATION_REPORT.md`](AUDIT_VERIFICATION_REPORT.md), [`RELEASE_EVIDENCE_HANDOFF.md`](RELEASE_EVIDENCE_HANDOFF.md), and [`NEXT_PHASE_MANUAL_REVIEW.md`](NEXT_PHASE_MANUAL_REVIEW.md).

## Current RC3 execution state

- Remote private Forgejo `release/v1-closure` is at `c0c0b5d28642a57442adfd2d53d6b0ddddd53c09`; local follow-up fixes through `11b030f96b26242c9eebc3fc4ae7df0fbb87d23b` are not pushed because the existing Forgejo credential is incorrect or expired after the endpoint recovered from a transient DNS failure.
- Coolify application `ngqtewtqeqhj88v1005a38va` accepted source deployment `lftxn28cksvcf76etxz6b6s7` for the exact candidate, but Tower status calls timed out before completion or health identity could be verified.
- Staging non-secret release, canonical, and Typesense configuration variables reconciled healthy without exposing values. Typesense infrastructure is healthy but its authoritative collection still has zero documents; application-level search remains unverified.
- Exact candidate CI is not green: container run 64 failed readiness, Lighthouse run 65 failed browser discovery, and quality run 66 was waiting at the last successful read.

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
