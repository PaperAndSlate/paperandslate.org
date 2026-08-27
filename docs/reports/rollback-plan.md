# Rollback plan

This local plan identifies immutable-artifact redeployment as the rollback strategy. A release operator should stop the current release, redeploy the last known good artifact, and verify `/health` plus static routes. Tower/Coolify activation, credentials, production monitoring, and a live rollback drill remain pending.

T104–T114 do not add deployment or rollback evidence. The current truthful homepage source governs visual acceptance by PM decision; unchanged legacy snapshots remain baseline-drift evidence and are not rollback artifacts. A production rollback drill, deployment identity, DNS/TLS, monitoring, and operator evidence are still required before this plan can support a production-readiness claim.

T120's local build and browser evidence, T122's local documentation receipt, and T130's formatting/focused-check receipt do not constitute deployment or rollback evidence. Production deployment, release identity/SBOM, DNS/TLS, monitoring, Tower/Coolify authority, operator credentials, and a live rollback drill remain pending.
