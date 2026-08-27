# Paper & Slate Public Website and Documentation System

## Objective

Fully implement the Paper & Slate public website and unified documentation system described by the supplied planning brief in this existing workspace, then verify it and report a truthful launch-readiness state.

## Original Request

`/goal` with the pasted Paper & Slate completion brief. The brief requires implementation rather than a plan-only handoff, preservation of existing work, no unauthorized remote repository changes, and a final evidence-backed report.

## Intake Summary

- Input shape: `existing_plan`
- Audience: developers, educators, schools and districts, education software companies, data organizations, researchers, standards contributors, and the public
- Authority: `requested`
- Proof type: `artifact`
- Completion proof: working repository artifacts, route and content inventory, passing focused and full available checks, visual QA evidence where possible, and a final Judge/PM audit mapping implementation to the brief
- Goal oracle: the repository's implementation ledger plus build/test/browser/fixture evidence demonstrates that the launch scope is implemented or truthfully marked as externally blocked; no required Worker remains queued or active
- Likely misfire: producing a polished homepage or scaffolding while silently omitting documentation ingestion, versioning, governance, feeds, security, operational tooling, and verification
- Blind spots considered: current workspace may already contain partial work; planning-pack facts may conflict; assets and public facts may be missing; external credentials and Tower access may be unavailable; full browser, Lighthouse, Docker, and provider acceptance may differ from local checks
- Existing plan facts: preserve the supplied phase 0-8 sequence, route catalog, required stack and package boundaries, truthful-content rules, no-auth/no-database constraints, local `standards` fixture repository, source-lock and provenance rules, static search fallback, optional Typesense and Kit adapters, security/accessibility/SEO/performance requirements, CI/CD/Docker/Tower intent, visual QA, and no commit/push/remote-repository authorization

## Goal Oracle

The oracle for this goal is:

`IMPLEMENTATION_LEDGER.md`, `IMPLEMENTATION_REPORT.md`, `LAUNCH_READINESS.md`, the working app and generated artifacts, and current verification receipts together prove the full local launch scope or identify only genuine external blockers.

The PM must keep comparing task receipts to this oracle. Planning, discovery, a passing tiny slice, or a clean-looking board is not enough. The goal finishes only when a final Judge/PM audit maps receipts and verification back to this oracle and records `full_outcome_complete: true`.

## Goal Kind

`existing_plan`

## Current Tranche

Execute the supplied implementation plan continuously in the existing Paper & Slate workspace. First map the repository and authoritative planning pack; then implement the largest safe vertical slices across the branded public site, docs/content pipeline, search/publishing/governance, hardening/operations, and verification artifacts. Continue through safe local work until the final audit can distinguish complete work from factual, credential, DNS, remote-repository, Tower, or other genuinely external activation.

## Non-Negotiable Constraints

- Preserve unrelated dirty-worktree changes; do not reset, clean, rebase, commit, push, create pull requests, or create remote repositories.
- Read and inspect the complete authoritative planning pack and its assets before changing application code; record conflicts in ADRs.
- Use truthful Paper & Slate copy: no invented people, donors, sponsors, nonprofit/tax status, adoption, government endorsement, stability, or finished standards claims.
- Do not implement authentication, API keys, organization accounts, billing, database/ORM, PostgreSQL, Valkey, RabbitMQ, Qdrant, S3, Keycloak, or other excluded infrastructure.
- Imported documentation is untrusted: no arbitrary MDX imports/exports, runtime execution, unsafe protocols, path traversal, unsafe HTML/SVG, remote request-time fetches, or source shadowing.
- Use local source hashes honestly when a Git SHA is unavailable; never fabricate commit IDs.
- Keep public search usable without Typesense and newsletter safe/disabled without Kit credentials.
- Worker write scopes must remain explicit and non-overlapping; verify every completed slice.

## Stop Rule

Stop only when a final audit proves the full original outcome is complete.

Do not stop after planning, discovery, or Judge selection if a safe Worker task exists. Do not stop after one verified package while the broader owner outcome still has safe local follow-up work. External blockers apply to exact activation tasks, not to local implementation.

## Slice Sizing

Use the largest safe useful vertical package: repository/bootstrap and content foundation, public site and design system, docs and ingestion, search/publishing/governance, then hardening and final evidence. Avoid one-task-per-file churn; each Worker should leave a working product slice and run its scoped checks.

## Board Health

The PM owns board health. Machine truth lives in `state.yaml`; repair only GoalBuddy control files when the board is stale or inconsistent.

## Canonical Board

`docs/goals/paperandslate-public-site-docs/state.yaml`

## Run Command

```text
Codex: /goal Follow docs/goals/paperandslate-public-site-docs/goal.md.
Claude Code: /goalbuddy Follow docs/goals/paperandslate-public-site-docs/goal.md.
```

## PM Loop

On each continuation, read this charter and the GoalBuddy execution contract, read `state.yaml`, work only on the active task, record a receipt, activate the next safe task, and run the checker and full oracle at phase/risk/final boundaries. Completion requires a final Judge/PM receipt with `full_outcome_complete: true` and a passing `check-can-stop` result.
