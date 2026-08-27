# ADR-0013: Forgejo-canonical v1 release candidate and bounded staging platform

## Status

Accepted for the v1 release-candidate goal.

## Context

The original implementation was a local, non-Git workspace with a static public site, optional provider adapters, and intent-only Tower files. The current goal authorizes Git initialization, Forgejo source control, Tower staging deployment, provider activation where the application genuinely needs it, and an immutable release-candidate evidence bundle. It explicitly defers GitHub publication, production deployment/DNS, final v1 approval, and authentication/API/platform integration.

## Decision

Use a real Git repository with `main` as the default branch and a reviewed release branch/tag for the candidate. Forgejo is canonical for development and staging. Tower/Coolify hosts one public web workload in staging, using a CI-built immutable container image and a release-specific identity. Typesense is the hosted search path with static search fallback; Valkey is limited to distributed newsletter abuse controls and short-lived provider state; Infisical holds staging secrets; GlitchTip and synthetic monitors provide staging observability. Do not provision Postgres, Keycloak, queues, workers, Qdrant, Inngest, AI Gateway keys, or Stripe listeners because the current v1 public surface does not use them.

## Consequences

- Every deployment and evidence record can point to an exact Forgejo commit, image digest, and staging deployment.
- A missing provider credential blocks only that provider's activation evidence; local contract tests and the rest of the RC continue.
- Public claims remain conservative and attributable to Glasscow LLC's Paper & Slate initiative.
- The next phase must complete human/legal/media/factual review before any final v1.0.0 promotion.
