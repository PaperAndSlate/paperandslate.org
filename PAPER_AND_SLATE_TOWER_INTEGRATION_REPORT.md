# Paper & Slate Tower / Forgejo Integration Report

**Checked:** 2026-08-28 (Tower observations through 2026-08-28T21:27:03Z)
**Project:** `paper-and-slate-web`
**Environment:** staging
**Decision:** release closure remains open. This report records platform evidence and remediation; it does not authorize a production release.

**Revision scope:** This is a timestamped platform snapshot. The hosted runs and
deployment records below were observed before the local Lighthouse remediation
commits `07ffa25dfb972c7fc58a6ec83fe51e807609cda3` and
`5df3a6457a7121f56e7d0db6feb4c5ab9f32c126`; no hosted execution evidence for
the current local revision is claimed here. Where this report says “current,”
it means current at the stated observation time.

**Platform identity:** Tower controller `4.12.0`; installed `@tower/tower-development-plugin` `0.15.2`; Forgejo `16.0.3+gitea-1.22.0`; Forgejo runner `13.0.0`. The referenced Tower remediation commit is `bf01bee3e4c1557520c3fdd095a4e59f901c82ee`; the controller does not expose a build fingerprint for independent verification, so that commit is recorded as supplied by the current brief.

## Executive result

The three current release-branch Actions runs fail during admission/scheduling, before a job starts:

| Forgejo run | Tower run id | Workflow         | Ref / commit                                                      | Observed result                                                                                           |
| ----------: | -----------: | ---------------- | ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
|         143 |          152 | `container.yml`  | `release/v1-closure` / `330ab498b4b2cd780fcaaab91bf70fbdc5a07e95` | failure in about one second; job/task records exist, but task `startedAt=null`, runner `null`, steps `[]` |
|         144 |          153 | `lighthouse.yml` | same                                                              | failure in about one second; job/task records exist, but task `startedAt=null`, runner `null`, steps `[]` |
|         145 |          154 | `quality.yml`    | same                                                              | failure in about one second; job/task records exist, but task `startedAt=null`, runner `null`, steps `[]` |

This is not evidence of a failing repository command. It is evidence of a Forgejo Actions admission, scheduler, or runner-registration problem. The only repository runner is listed as `idle` with `lastOnline=null`, so the current aggregate health result is not trustworthy as runner evidence.

Tower’s normalized run list uses internal ids 152, 153, and 154 while displaying Forgejo run numbers 143, 144, and 145. `tower_ci_run_get` must be called with the internal id: passing 143, 144, or 145 retrieves older runs (run numbers 134, 135, and 136). This id/number ambiguity is a connector evidence bug and must be fixed or prominently documented before CI evidence can be safely automated.

Tower has repaired the managed Valkey binding and the environment-contract validator now passes without exposing values. The project is still degraded because one failed `GLITCHTIP_DSN` binding remains and the contract has not been validated against a real deployment. The existing managed GlitchTip integration is keyed as `SENTRY_DSN`.

## Evidence and source boundaries

Tower was used for provider and project operations. No raw Docker socket, provider shell, raw SQL, secret reveal, production deployment, public DNS change, final tag, or remote push was performed. Local repository changes that predated this platform work were preserved.

The named reports requested by the task were absent when inspected. This report, the web handoff, the owner action checklist, and the sanitized capability snapshot were therefore created in the web repository root. The existing [RC3 owner closure document](docs/rc3-owner-closure.md) remains the broader product/release checklist.

## Findings

### 1. Forgejo Actions admission and runner scheduling

Current workflow labels are:

- `container.yml` and `supply-chain.yml`: `ubuntu-latest`
- `lighthouse.yml` and `quality.yml`: `playwright`

The repository runner record is:

```text
id:          1
name:        tower-docker-runner
status:      idle
busy:        false
version:     13.0.0
labels:      ubuntu-latest, node22, docker, playwright
lastOnline:  null
```

The labels cover the four requested classes, but the record does not prove that the runner process is online or able to accept a task. `tower_ci_health_report` currently reports an overall healthy result while reporting zero passing runs and a runner with no heartbeat timestamp. Exact run and runner records are therefore the authoritative evidence.

The current job/task records did materialize: Tower job ids match 152/153/154, with task ids 142/143/144 respectively. All three remain unstarted and unassigned. The failure is therefore after workflow/job materialization but before runner admission or acknowledgement, narrowing the likely fault to scheduler dispatch, runner availability/registration, or provider state rather than YAML parsing or a repository step.

An independent Tower-owned control dispatch reproduced the failure outside Paper & Slate. Tower accepted `ci.yml` on `callum/tower-staging-validation` at 2026-08-28T21:19Z and created Tower run id 155 (Forgejo display run 9), targeting `docker`. It failed in one second with a materialized job/task but `startedAt=null`, no runner, and no steps. That repository previously completed the same workflow successfully as run 8 on 2026-07-31, so the current failure is not specific to Paper & Slate workflow syntax or application commands.

The project has no manifest queue declarations and no observed queue. Tower exposes project-scoped run/task/runner data, but not the global Forgejo scheduler configuration, global Actions queue, stale-task administration, or runner-host service logs. Project-bound log queries for `tower-ci` and `tower-docker-runner` were empty; the generic `forgejo` service was rejected as not bound to this project. This is a capability boundary, not proof that the host or scheduler is healthy.

The observability snapshot also queried retired host metrics (`host_cpu_percent` and `host_memory_percent`); the controller returned 422 `unknown_metric` and named the current approved catalog as `container_cpu`, `container_memory`, `ci_failures`, `request_rate`, and `request_error_rate`. The snapshot still summarized overall health as healthy. The snapshot implementation should stop issuing retired metric queries and should surface this instrumentation mismatch rather than masking it.

No current Paper & Slate workflow has executed a step, so no current step log or artifact is available through Tower. The Tower CI reporter identity operation is available, but the checked workflows do not currently emit a Tower structured report; after runner repair, the acceptance plan must either capture the provider-backed run logs/artifacts or add an explicitly reviewed reporter/summary step. This is an evidence gap, not a reason to treat the pre-run records as application failures.

The repository has no `.forgejo/workflows/tower-ci.yaml`. The existing workflows are the available real-workflow acceptance path. Forgejo’s official documentation says that a runner must be available for a workflow to execute and that artifacts should use v3 or a Forgejo-patched v4 action. The repository currently pins Forgejo’s hosted `upload-artifact` commit `c6a366c94c3e0affe28c06c8df20a878f24da3cf` with the comment `v3.2.2`. Because runs 143–145 stop before steps, the artifact action is not yet implicated.

**Remediation plan**

1. The platform operator checks the Forgejo global/repository Actions enablement, scheduler/queue state, stale or abandoned tasks, and runner service logs. The operator also verifies the runner host clock, Forgejo endpoint resolution, system CA plus Tower CA trust, network access to Forgejo, `code.forgejo.org`, the registry, and the package registry, and the Tower CI Docker-in-Docker path.
2. Once the host is ready, Codex can call Tower’s repository-scoped runner-enrollment action with the existing labels. The operator must exchange the one-time 15-minute enrollment on the target runner host exactly once; the token must never be pasted into chat or logs. Codex can then re-list the runner and require a recent `lastOnline` value before dispatching work.
3. Codex can dispatch the existing `container.yml`, `quality.yml`, `lighthouse.yml`, and `supply-chain.yml` workflows through Tower, inspect run/task status, list verified artifacts, and create short-lived artifact download URLs. A minimal control workflow is not present; adding one would be an additional repository change and is not necessary if the real workflows execute.
4. If a runner is online but a task still never starts, the platform operator inspects the global Forgejo scheduler and stale-task state. Tower cannot perform that global inspection through the current project-scoped contract.

### 2. Credential and permission correctness

Tower’s broker credential list is empty. Forgejo token metadata contains both token ids `20` and `21` with the same broad scopes (`read:organization`, `write:package`, `write:repository`, and `read:user`); both are non-expiring and have no recorded use. Id 21 is named `tower-agent-paperandslate-staging-rc-2`. `tower_credential_get(21)` returns a controller error because id 21 is a Forgejo token metadata record, not a Tower credential record. The credential capability response also does not advertise a Forgejo broker provider, so this is not a normal Tower credential-issue lifecycle.

The current permission set is broader than a repository Git-push identity needs because it includes package write access and is non-expiring. Separate package-read tokens already exist (ids 14 and 15) with the normalized `read:package` scope. Local read-only `git ls-remote` succeeded for the configured Forgejo remote, and a local package metadata query succeeded. Neither result proves a permitted push, Actions dispatch, or runner enrollment.

**Remediation plan**

1. The owner/platform administrator creates or rotates a short-lived repository Git identity with only the minimum repository read/write permissions required by the release workflow. It must not be reused as a package-publish identity.
2. The owner keeps a separate `read:package` identity for private package installation. The CI secret and local credential store are updated through the approved secret manager, never through chat or committed files.
3. After the replacement is verified, the owner revokes or expires token 21 and records the audit event. Codex can use Tower to verify non-secret metadata and can apply a permission update when the original token material and the required admin authority are supplied through the approved Tower flow; Codex cannot recover the missing original token material.
4. The Tower connector should return a clear “Forgejo token, not Tower credential” result for id 21 instead of a generic 500. This is a connector error-handling remediation, not a repository code fix.

### 3. Managed staging resources and environment contract

The manifest declares active shared staging resources for Typesense, Valkey, and S3. The latest Tower health evidence is:

| Resource              | State   | Evidence / remaining gap                                                                                                                                                                                                         |
| --------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Valkey `cache`        | healthy | managed project credential accepted; `VALKEY_URL` was defined server-side and reconciled to the staging application; value excluded                                                                                              |
| Typesense `search`    | healthy | collection `tower_paper-and-slate-web_search`, zero documents, distinct search/write credentials, wrong-credential rejection observed; temporary write/delete roundtrip not run because the exposed path requires roundtrip mode |
| S3 `release-evidence` | healthy | project credential accepted and bounded probe/roundtrip evidence present                                                                                                                                                         |

The contract validator report `65aa18b6-908a-4d74-b00d-c92c2fb0d34f` passed with `missing=0`, `required=9`, `supplied=9`, `unexpected=0`, `valuesExcluded=true`. This is a variable-name/binding validation result, not deployment acceptance. `tower_project_status` still reports the environment contract as unknown/stale and secrets as degraded because one binding is failed.

A subsequent full live provider contract run, id `5e963eb0-0d01-40d9-b5a6-ba55914ef621`, passed at 2026-08-28T21:18:50Z for Forgejo, Coolify, Tempo, LiteLLM, GlitchTip, and S3. It proves the bounded provider compatibility suite, not runner admission or application deployment configuration.

The failed binding is:

```text
target key: GLITCHTIP_DSN
state:      failed
error:      Infisical secret read GLITCHTIP_DSN returned 404
```

The existing managed GlitchTip project is project id `2` and reports `dsnSecretRef=SENTRY_DSN`, with DSN values excluded. An attempted cross-key binding was canonicalized by the exposed binding path to `GLITCHTIP_DSN` and failed; no DSN value was retrieved. This shows a naming mismatch and a likely connector/provider limitation in cross-source aliasing.

**Remediation plan**

1. The owner creates an Infisical/Tower-managed `GLITCHTIP_DSN` alias from the existing managed DSN without sharing the value with Codex, or approves a web-thread change that makes the manifest/app contract consistently use `SENTRY_DSN`.
2. Tower should provide an idempotent cross-source binding/upsert that honors `sourceRef=SENTRY_DSN` and a supported cleanup/disable operation for the failed binding. The current exposed tool leaves the failed record in the binding list.
3. Codex can reconcile the bindings, re-run the value-excluding contract check, deploy staging through the bounded Coolify action, inspect the deployment/health evidence, and confirm that the project status has moved from stale/unknown to deployment-backed acceptance once the source secret exists.
4. Codex can run the bounded Typesense checks available through Tower. A temporary write/delete roundtrip must be enabled by the controller or performed by an authorized platform operator; zero documents is not evidence that indexing is correct.

### 4. Repository, deployment, DNS, and TLS authority

The bound Coolify application is `paper-and-slate-web-staging`, UUID `ngqtewtqeqhj88v1005a38va`, on branch `release/v1-closure`, with the active `.dev.tower` hostname `paper-and-slate-web.dev.tower`, health path `/health`, and port 3000. The latest app record is `running:healthy`; the staging hostname resolved to `192.168.0.11` and bounded HTTPS/HTTP probes returned 200. Cloudflare is not configured for this project.

The latest bounded post-deploy sweep at `2026-08-28T21:27:03Z` observed deployment `b4c1jatqaidljtcpc4nly1yp` for commit `06491dc57fa3f3a43c365a4ab24e07f21e7b04d6` as `finished` at the health-check stage, with 22 provider log entries and no reported latest error. The sweep summary was `observed/healthy` for that deployment, but its project components still reported degraded CI, unknown deployment-backed environment contract, one unresolved error, and one failed secret binding. This is a staging deployment-health pass only; it is not current-release or project release-closure evidence.

The Forgejo branch currently points to `330ab498b4b2cd780fcaaab91bf70fbdc5a07e95`, is unprotected, has zero required approvals, and has status checks disabled. The local readiness candidate referenced for this snapshot was `5df3a6457a7121f56e7d0db6feb4c5ab9f32c126`; it was not pushed. Forgejo reports no releases for the repository. The remote RC1 tag remains a separate historical ref at `eb883af82ac8b4db60468f86b36f1bf44b6868c8`.

**Remediation plan**

- Codex can verify repository branch/ref metadata, staging DNS, staging TLS/HTTP health, deployment metadata, and bounded staging deploy/restart/rollback actions through Tower after an explicit staging action request.
- The owner must decide branch-protection rules, required checks, repository/tag authority, public DNS ownership, public certificate/TLS issuance, and production deployment authority. No public DNS, Cloudflare, production certificate, final RC tag, or production deployment was changed.
- The release identity must be selected explicitly: the remote commit used by CI, the image digest produced from that exact commit, the SBOM/provenance artifacts, and the staging deployment digest must agree before release approval.

### 5. Monitoring, errors, and rollback evidence

All six manifest monitor targets currently have a latest healthy probe: `health`, `homepage`, `projects`, `docs`, `search`, and `rss`. The 24-hour SLO window is nevertheless degraded: availability is approximately `99.855%` against a 99% target, while latency p95 is approximately `2792–2901 ms` against a 2000 ms target. Six warning alerts are active for the SLO budgets. One unresolved GlitchTip error is also reported.

The web manifest’s expected monitor paths are distinct: `/health`, `/`, `/projects`, `/docs/file-system/v/1.0`, `/api/search`, and `/feeds/rss.xml`. If a future web revision materializes all six targets as `/`, the web-owned fix is to restore those explicit `path` values in `.tower/project.yaml` and rerun the focused manifest/monitor validation; Tower should not infer route paths. The current checked manifest contains the distinct paths.

This distinction matters: a green last probe does not erase a degraded historical SLO window, and a healthy monitoring component does not prove release-specific performance. No production rollback was performed, and no release-specific A→B→A rollback evidence exists.

**Remediation plan**

1. Codex can run and archive bounded staging monitor probes, inspect SLO state, annotate a staging deployment, diagnose bounded Coolify deployment logs, and invoke a bounded rollback when explicitly authorized.
2. The owner/operator defines the production incident owner, rollback approval, previous known-good digest, rollback window, and retention location for evidence.
3. After a clean staging deployment, capture a baseline, candidate window, and controlled return-to-known-good evidence. Resolve or explicitly disposition the existing GlitchTip error; do not mark historical SLO degradation as cleared without a new window.

### 6. SBOM, registry, and release identity

The active Tower OCI policy is `paper-and-slate-web/paper-and-slate-web`, retaining 10 images for 90 days with SBOM and vulnerability scanning enabled. The registry credential metadata is active, scoped for pull/push, and expires on 2026-11-26. There is only one reported image, tagged `sha-7aaa9b45ba0b6264d089eb530ecfd471a8e2008b`, with digest `sha256:8e88472b8b55250cea13dd039d171d1c53d5722fba773f78bbea1c0010e29f1a`.

That historical image has a successful CycloneDX SBOM with 3690 components and a successful Trivy report with 277 findings: 5 critical, 49 high, 107 medium, 112 low, and 4 unknown; 18 have a fix available. Provenance is generated. Signing is `not-configured`, and the SBOM object-key field is null even though the artifact is listed. There is no reported image for current remote commit `330ab...` or local commit `99859...`.

**Remediation plan**

- Codex can dispatch the supply-chain workflow after runner repair, inspect verified CI artifacts, inspect registry metadata, and record immutable image evidence after a real CI push.
- The runner/workflow must build and push an image tagged by the exact commit identity, publish the digest, SBOM, vulnerability report, provenance, and evidence summary, and deploy staging by digest.
- The owner must disposition the critical/high findings, decide whether signing is mandatory, configure an approved signing authority if required, and approve the release risk. A generated provenance file and a successful scan do not by themselves close release risk.

### 7. Visual, Lighthouse, legal, factual, media, and publication evidence

The repository contains a `lighthouse.yml` workflow on the `playwright` label and a `quality.yml` workflow with browser validation. Neither has run a job for the current release ref because admission fails first. Existing staging endpoint probes are not a substitute for browser screenshots, Lighthouse reports, or human visual acceptance.

**Remediation plan**

- Codex can run the repository’s local deterministic browser/Lighthouse checks, dispatch the Forgejo workflows after runner repair, list/download verified artifacts, compare the report identity to the tested commit, and check RSS/XML/schema/canonical/link/HTTP invariants.
- The owner/editor must approve visual/brand presentation and obtain qualified legal, factual, privacy, rights, attribution, and media approvals. Each approval should record reviewer, role/qualification, scope, date, source/license, and disposition. Codex may assemble the evidence packet and flag missing fields; it cannot grant those approvals.
- The owner/editor must approve publication timing, canonical URLs, feed contents, image/media rights, and the final production publication. Codex can validate the staging feed and publication artifacts, but cannot certify editorial truth or rights ownership.

## Tool capability summary

Tower can currently:

- read Forgejo runs, tasks, repository runners, branches, and releases;
- dispatch known repository workflows after a valid runner is online;
- issue a repository-scoped one-time runner enrollment and verify the resulting runner metadata;
- reconcile named secret bindings without returning values;
- define server-side non-public variables such as `VALKEY_URL` without returning values;
- inspect managed resource health/latency, registry policy/image evidence, staging app status, deployment metadata, monitor probes, and SLO summaries;
- perform bounded staging Coolify lifecycle actions, deployment diagnosis, artifact listing, and short-lived artifact download authorization.

For CI evidence, Codex must preserve the Tower-id mapping from `tower_ci_runs_list` and pass internal ids to `tower_ci_run_get`; the displayed Forgejo run number is not a safe lookup key in the current connector.

Tower cannot currently:

- inspect or repair the global Forgejo scheduler, global Actions queue, stale task administration, or runner-host process/DinD logs through this project-scoped contract;
- recover the original secret material for Forgejo token id 21;
- create a cross-source `SENTRY_DSN` → `GLITCHTIP_DSN` alias through the exposed binding path as tested;
- provide a current image, SBOM, signature, or release identity before a runner executes the supply-chain workflow;
- approve legal, factual, media, editorial, visual/brand, production, DNS, certificate, or release-risk decisions.

## Acceptance gates still open

1. A runner with a recent heartbeat must accept a controlled job.
2. The Tower-owned control run 155 must reach a runner and complete at least one real step; it currently reproduces the pre-run failure.
3. Runs 143–145 (Tower ids 152–154) must be diagnosed as historical pre-run failures, and new real workflow runs must reach a runner and expose retrievable steps/logs/artifacts.
4. The failed GlitchTip binding must be replaced or the manifest/app naming contract must be made consistent; staging must then be deployment-validated.
5. The current exact commit must have immutable image, SBOM, provenance, scan, and staging-by-digest evidence.
6. SLO performance must meet the release-specific acceptance window, with an explicit rollback test/evidence trail.
7. Qualified legal/factual/privacy/media/editorial/brand approvals, public DNS/TLS authority, production deployment authority, and publication/feed approval must be recorded by the owner.

These gates are intentionally not marked complete by local green checks, a last healthy probe, a syntactic contract pass, or the existence of an older registry image.

### Official Forgejo references

- [Forgejo Actions overview](https://forgejo.org/docs/latest/user/actions/overview/)
- [Forgejo Actions advanced features and artifact guidance](https://forgejo.org/docs/latest/user/actions/advanced-features/)
- [Forgejo Actions configuration and timeout settings](https://forgejo.org/docs/latest/admin/config-cheat-sheet/)
