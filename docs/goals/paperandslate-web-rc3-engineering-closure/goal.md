# Paper & Slate Web — RC3 Engineering Closure

## Objective

Prepare the Paper & Slate Web RC3 repository for hosted validation and complete every repository-controlled engineering, release-evidence, observability, staging, and CI gate that can be executed safely. Preserve truthful separation between local/hosted evidence and external or human approval gates.

## Original Request

Create and execute a persistent Goal Mode goal named `Paper & Slate Web — RC3 Engineering Closure`. Continue from the current hosted-validation-readiness state, inspect and improve CI/workflows, investigate the Node DEP0169 warning, make the repository ready to be pushed and validated by hosted CI, and report accurate evidence without pushing, tagging, releasing, deploying, publishing, or completing external gates without evidence.

## Intake Summary

- Input shape: `existing_plan`
- Audience: maintainers, reviewers, hosted CI operators, release owners, and future public-site users
- Authority: `requested`
- Proof type: `artifact`
- Completion proof: exact source/release identities, repository-controlled fixes, durable receipts, complete applicable local verification, and a final audit that leaves only genuinely external or human gates blocked
- Goal oracle: current CI/workflow configuration, release/staging evidence, authoritative readiness documents, executable checks, and the final GoalBuddy audit agree about what is complete, unavailable, or externally blocked
- Likely misfire: declaring hosted-validation readiness from stale prose, local-only checks, a dirty tree, or a successful health endpoint while omitting CI security, package, browser, observability, artifact, rollback, or environment evidence
- Blind spots considered: pre-existing dirty documentation edits, private Forgejo/Tower remote rather than public GitHub access, missing credentials and provider bindings, platform-specific filesystem behavior, stale RC3 evidence, dependency-originated warnings, and external production/legal/governance gates
- Existing plan facts: preserve the RC3 source/evidence identities supplied by the user; do not repeat completed remediation unless new evidence requires it; inspect the exact `06491dc` release state and prior hosted runs; cover Linux, Windows, macOS, supported Node versions, frozen install, build, quality, tests, browser/Lighthouse, package consumers, schemas/vocabularies/modules/fixtures, conformance, examples, deterministic generation, documentation, security/license policy, reproducibility, traceability, and workflow hardening; do not push, tag, release, deploy, publish, submit to IANA, or claim external gates complete

## Goal Oracle

The oracle for this goal is:

`RELEASE_EVIDENCE_HANDOFF.md`, `LAUNCH_READINESS.md`, `IMPLEMENTATION_REPORT.md`, the CI/workflow configuration, current release/staging receipts, and executable verification together identify every repository-controlled readiness item and leave only evidenced external or human blockers.

The PM must keep comparing task receipts to this oracle. Planning, discovery, a green local subset, or a clean-looking report is not enough. The goal finishes only when a final Judge/PM audit maps current receipts and verification to this oracle and records `full_outcome_complete: true`, or when the exact terminal approval-wait shape is genuinely reached.

## Goal Kind

`existing_plan`

## Current Tranche

Execute the hosted-validation-readiness and RC3 engineering-closure plan continuously. Reconstruct the exact current release state, harden and complete repository-controlled CI/release/staging/observability tooling, rerun applicable local gates after each safe package, and finish with one evidence-consistent audit. External provider credentials, remote hosted execution, production authority, legal/governance approval, pilots/adoption, deployment, and stable publication remain explicitly separate.

## Non-Negotiable Constraints

- Preserve the six pre-existing modified release-closure documents until their changes are independently reviewed; do not reset, checkout, or overwrite unrelated work.
- Do not push, force-push, tag, create a GitHub/Forgejo release, deploy production, publish RC3 or v1.0.0, submit to IANA, or claim external evidence that was not produced.
- Do not invent credentials, provider results, hosted CI results, OCI digests, SBOM/provenance/signing receipts, rollback evidence, or platform results.
- Do not weaken tests, security checks, browser thresholds, resource limits, or release gates merely to make them pass.
- Keep the supplied source, tree, evidence-repository, and Standard scan identities distinct; never silently rebind existing RC3 evidence to modified source.
- Inspect secrets and environment variables without printing values. Use controlled fixtures for network tests and preserve URL/DNS/redirect safety.
- Make only bounded, repository-controlled changes; stop an individual slice when it requires a missing secret, external approval, destructive production action, or a materially expanded product decision, then continue other safe local work.

## Stop Rule

Stop only when a final audit proves the full repository-controlled engineering outcome is complete and `check-can-stop` passes, or when no safe local work remains and the exact remaining human approval is represented as a terminal approval-wait receipt. Do not stop after planning, a single CI fix, or a local green subset while safe remediation or evidence work remains.

## Slice Sizing

Use the largest safe useful vertical package. Initial packages are: exact-state/evidence reconstruction; workflow and cross-platform hardening; package/browser/reproducibility validation; staging/observability and release-evidence tooling; final authoritative audit. Combine repeated same-shape checks into coherent packages and review at phase/risk/final boundaries.

## Board Health

The PM owns board health. Machine truth lives in `state.yaml`; repair only GoalBuddy control files when the board is stale or inconsistent.

## Canonical Board

`docs/goals/paperandslate-web-rc3-engineering-closure/state.yaml`

## Run Command

```text
Codex: /goal Follow docs/goals/paperandslate-web-rc3-engineering-closure/goal.md.
Claude Code: /goalbuddy Follow docs/goals/paperandslate-web-rc3-engineering-closure/goal.md.
```

## PM Loop

On each continuation, read this charter and the GoalBuddy execution contract, read `state.yaml`, re-check the intake and evidence identities, work only on the active board task, record a receipt, update the board, and immediately choose the next largest safe local package. Run `check-can-stop` before ending the turn. Completion requires a final Judge/PM receipt with `full_outcome_complete: true` and an evidence-consistent current repository state.
