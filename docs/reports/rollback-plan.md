# Rollback plan

Date: 2026-08-27
Status: procedure validated locally; hosted staging drill pending

## Strategy

Use immutable-artifact redeployment. Keep the last-known-good image digest and source identity. If the current release breaches the approved stop condition, stop or route away from the current workload, redeploy the known-good digest, verify `/health`, representative static routes, feeds, search, and monitors, then record the incident and restored digest.

## Required staging drill

An authorized operator must deploy two immutable, compatible staging artifacts A and B, record both deployment IDs/digests, verify A, switch to B, verify B, invoke the approved rollback action to A, and verify A again. Record timestamps, operator, health/route/feed/search probes, monitor results, logs/issue IDs, and any data-consistency impact. Do not call a source rebuild “rollback” unless its digest is independently recorded.

## Current boundary

`pnpm rollback:check` validates the local procedure/configuration. No hosted A→B→A drill, production rollback, DNS/TLS rollback, or data rollback has been performed. The exact authority and evidence return package is in [`NEXT_PHASE_MANUAL_REVIEW.md`](../../NEXT_PHASE_MANUAL_REVIEW.md).
