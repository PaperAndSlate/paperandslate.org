# Paper & Slate Web v1 Platform Handoff

**Status:** not release-closed
**Environment checked:** staging
**Checked:** 2026-08-28 (Tower observations through 2026-08-28T21:41:35Z)
**Primary technical report:** [PAPER_AND_SLATE_TOWER_INTEGRATION_REPORT.md](PAPER_AND_SLATE_TOWER_INTEGRATION_REPORT.md)
**Owner action checklist:** [PAPER_AND_SLATE_WEB_OWNER_ACTIONS.md](PAPER_AND_SLATE_WEB_OWNER_ACTIONS.md)

**Revision scope:** This handoff preserves a timestamped platform snapshot.
The hosted run and deployment observations below predate local commits
`07ffa25dfb972c7fc58a6ec83fe51e807609cda3` and
`5df3a6457a7121f56e7d0db6feb4c5ab9f32c126`; no hosted validation for the
current local revision is claimed. “Current” describes the platform at the
observation time unless an item says otherwise.

**Platform identity:** Tower controller `4.12.0`; plugin `@tower/tower-development-plugin` `0.15.2`; Forgejo `16.0.3+gitea-1.22.0`; runner `13.0.0`. The current brief identifies remediation commit `bf01bee3e4c1557520c3fdd095a4e59f901c82ee`; no controller build fingerprint exposes it independently.

## Current decision

The staging platform is reachable and the managed Valkey binding is healthy, but the v1 RC workflow is not acceptance-ready. Forgejo runs 143–145 fail before task start, the only runner has no heartbeat timestamp, and the project still has one failed GlitchTip binding. No production deployment, public DNS/TLS change, final RC tag, remote push, or release approval was performed.

## What is proven

| Area                      | Current evidence                                                                                                                                            | State                          |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| Staging application       | `paper-and-slate-web-staging` is `running:healthy`; `/health` and `paper-and-slate-web.dev.tower` probes are healthy                                        | partial pass                   |
| Latest staging deployment | Deployment `b4c1jatqaidljtcpc4nly1yp` for `06491dc57fa3f3a43c365a4ab24e07f21e7b04d6` finished health-check with 22 provider log entries and no latest error | deployment pass only           |
| Staging DNS/TLS           | `.dev.tower` hostname resolves and bounded HTTPS probes return 200                                                                                          | staging-only pass              |
| Managed resources         | Valkey, Typesense, and S3 resource records are active/healthy                                                                                               | partial pass                   |
| Valkey binding            | `VALKEY_URL` is stored server-side and reconciled; value excluded                                                                                           | pass                           |
| Environment validator     | 9 required variables supplied; no missing/unexpected variables; values excluded                                                                             | syntactic pass only            |
| Forgejo read access       | branches and read-only remote metadata are accessible                                                                                                       | pass                           |
| Registry policy           | immutable OCI repository, SBOM and vulnerability scan policy, 90-day/10-image retention                                                                     | configured                     |
| Monitoring                | six latest probes healthy                                                                                                                                   | probe pass only                |
| Provider contract suite   | Tower full bounded contract run passed for Forgejo, Coolify, Tempo, LiteLLM, GlitchTip, and S3                                                              | provider pass; runner excluded |

The staging Tower CI reporter `67f03584-babf-4b4e-b09c-b6570e0a637a` is active and injects the write-only `TOWER_CI_REPORT_TOKEN`; no token material was returned. A workflow summary-posting step is still required before structured Tower CI evidence is proven.

## What is not proven

- A runner can accept `ubuntu-latest` or `playwright` jobs.
- Any current release workflow reaches a job step or produces current artifacts.
- Tower-visible executed-step logs or a structured CI reporter result for the current release workflows.
- The staging application received `GLITCHTIP_DSN` from the managed secret source.
- Typesense indexing/write-delete behavior works; the collection currently has zero documents.
- The current exact release commit has a registry image, digest, SBOM, vulnerability result, provenance, and staging-by-digest deployment.
- The historical 24-hour SLO does not meet the 2-second p95 target; current p95 is about 2.803–2.999 seconds.
- Production DNS/TLS, deployment, rollback, publication, legal, factual, privacy, media, or visual approvals.

## Run and runner diagnosis

Runs 143 (`container.yml`), 144 (`lighthouse.yml`), and 145 (`quality.yml`) all target commit `330ab498b4b2cd780fcaaab91bf70fbdc5a07e95` on `release/v1-closure`. Their Tower internal ids are 152, 153, and 154. Each failed in approximately one second. The job/task records exist, but have no `startedAt`, `completedAt`, runner, or steps. This is a pre-run admission/scheduling failure.

The bounded run/job/task response also omits queue timestamps/state, cancellation state, concurrency state, and a provider-error field. Treat those fields as unavailable evidence, not as proof that no queue or provider error existed.

Use the internal ids with `tower_ci_run_get`. The current connector returns older runs if the displayed Forgejo numbers 143–145 are passed directly; this lookup mismatch is recorded as a Tower connector defect.

Tower also dispatched the existing control workflow `ci.yml` in `callum/tower-staging-validation`. Tower run 155 (Forgejo display run 9, `runs-on: docker`) failed in one second with the same unstarted, unassigned job shape. This independently reproduces the platform failure. The same control workflow previously succeeded as run 8 on 2026-07-31.

The single repository runner is `tower-docker-runner` id 1, version 13.0.0, labels `ubuntu-latest`, `node22`, `docker`, and `playwright`, with `status=idle`, `busy=false`, and `lastOnline=null`. The aggregate health endpoint reports “healthy” despite zero passing runs and no heartbeat; this composite needs a heartbeat/recent-success requirement before it can be accepted as CI health.

Tower exposes repository-scoped CI records and enrollment/dispatch, but not the global Forgejo scheduler, global queue, stale-task controls, or runner-host service logs. The operator action is therefore recorded separately rather than being misrepresented as a Codex-verifiable pass.

The current Tower queue-health/topology calls show no project RabbitMQ queues or observations. That is application messaging state, not the Forgejo Actions queue. Forgejo provider reachability is healthy at the API boundary, but runner scheduling/heartbeat remains unproven.

The observability snapshot returned 422 `unknown_metric` for legacy `host_cpu_percent` and `host_memory_percent` queries while still reporting an overall healthy summary. The approved current metric catalog is different; this snapshot path needs correction before it can be used as an unqualified platform-health signal.

The correctly bound control-project investigation `c9ae9b28-a483-4814-a462-bcddc4a68108` identified control CI id 155 with payloads excluded. The direct `ciRunId` input was rejected and the generic identifier required the control project slug; use the exact `tower_ci_run_get` record for start/runner/step evidence.

Workflow contract: `TOWER_CI_CONTAINER_NETWORK` is an optional runner-provided network name used by `scripts/container-check.ts`; the script validates it, attaches the temporary check container with a generated alias, and uses a bounded fallback when it is absent. Do not replace it with a raw Docker socket or arbitrary host network. Keep `runs-on: playwright` limited to browser workflows with the registered label, pinned Playwright/CA setup, `pwuser`, two workers, and one retry. The repository’s Forgejo-hosted `upload-artifact` pin is the documented v3.2.2 commit; Forgejo guidance allows v3 or a Forgejo-patched v4, not an arbitrary upstream action version.

The latest staging post-deploy sweep observed deployment `b4c1jatqaidljtcpc4nly1yp` for commit `06491dc57fa3f3a43c365a4ab24e07f21e7b04d6` as finished and health-checked, with 22 provider log entries and no latest error. The project-level result remains degraded because CI admission, deployment-backed contract state, historical errors, and the failed GlitchTip binding are separate gates.

The current Tower monitor readback at approximately `2026-08-28T21:41:05Z` preserves the distinct web paths `/health`, `/`, `/projects`, `/docs/file-system/v/1.0`, `/api/search`, and `/feeds/rss.xml`, all with healthy latest probes. The earlier path-collapse finding is not present in the current checked manifest/readback; if a future web revision collapses them to `/`, restore the explicit `path` values in `.tower/project.yaml` and rerun focused manifest/monitor validation.

Tower’s monitor/resource APIs are responding, but route ownership remains in the web manifest. The expected `.tower/project.yaml` monitor paths are `/health`, `/`, `/projects`, `/docs/file-system/v/1.0`, `/api/search`, and `/feeds/rss.xml`. If a web revision collapses all six targets to `/`, restore those explicit `path` values in the web repository and rerun focused manifest/monitor validation; do not treat a generic `/` probe as evidence for the other routes. The checked manifest currently contains the distinct paths.

## Managed staging binding status

The environment validator report `65aa18b6-908a-4d74-b00d-c92c2fb0d34f` passed with no missing names and values excluded. The project status remains stale/unknown for deployment acceptance because one binding is failed:

```text
GLITCHTIP_DSN <- Infisical source GLITCHTIP_DSN: 404, source not found
```

The existing managed GlitchTip project is id 2 and uses `SENTRY_DSN` as its secret reference. The attempted cross-key alias was not honored by the exposed binding path. The correct next action is to create the alias in the approved secret manager or approve a consistent manifest/app rename. Do not paste or print the DSN.

`VALKEY_URL` is now a healthy managed binding. Typesense has distinct search/write credentials and a zero-document collection; a temporary write/delete roundtrip remains unproven. For application-owned indexing, run `pnpm search:index --publish-typesense` only in an approved staging environment using the server-side `TYPESENSE_API_KEY` write binding and `TYPESENSE_SEARCH_API_KEY` search binding, then record the exact SHA, collection/alias, counts, query results, and cleanup. S3 probe/roundtrip evidence is healthy.

## Release evidence plan

1. **Runner and CI:** owner repairs/enables the target runner host; Codex issues enrollment, verifies the heartbeat, dispatches the actual workflows, and records run/task/artifact evidence. The scoped Tower reporter is active, but the web workflow must explicitly post a redacted summary before structured Tower CI evidence can be accepted.
2. **Browser and Lighthouse:** Codex runs/dispatches the `playwright` workflows and checks that screenshots/reports/artifacts identify the exact commit. Owner/editor provides human visual and brand acceptance.
3. **Provider credentials:** owner rotates/reduces the non-expiring broad token 21 and maintains separate repository, package-read, registry, and provider identities. Codex verifies only non-secret metadata and approved Tower results.
4. **Deployment/resources:** owner supplies the missing managed GlitchTip alias or approves the contract rename. Codex reconciles bindings, validates staging against a real deployment, and checks resources through Tower. The full provider contract suite currently passes, but the environment contract remains deployment-unknown.
5. **Registry/SBOM:** Codex dispatches the supply-chain workflow, checks the immutable image/digest and artifacts, and records SBOM/provenance/scan metadata. Owner dispositions critical/high findings and decides on signing.
6. **Monitoring/rollback:** Codex can run staging probes, inspect SLOs, annotate deployments, and perform an explicitly authorized bounded staging rollback. Owner controls production incident and rollback approval.
7. **Publication/feed:** Codex can validate HTTP, XML, RSS, canonical, link, schema, and publication artifact invariants. Owner/editor approves facts, rights, privacy, media, timing, and final publication.

## Repository and deployment identity

The last observed remote `release/v1-closure` branch was at `330ab498b4b2cd780fcaaab91bf70fbdc5a07e95`; it was unprotected with no required approvals or status checks. The local checkout was at `99859b4e895f212a3675f3b564fc259195e41b47` during that observation; the local readiness candidate for this snapshot is `5df3a6457a7121f56e7d0db6feb4c5ab9f32c126` and remains unpushed. The release must choose one exact commit and carry it through CI, image digest, SBOM/provenance, deployment, browser evidence, and publication evidence. Token metadata currently shows non-expiring broad-scope ids 20 and 21; separate package-read identities exist and the replacement/revocation plan is in the owner checklist.

The staging Coolify app is bound to `git@forgejo-ssh:callum/paperandslate-web.git`, branch `release/v1-closure`, Dockerfile `/infrastructure/docker/Dockerfile`, port 3000, and `/health`. The manifest requires production approval. Public registrar/DNS/TLS and production deployment authority remain owner-controlled.

## Stop conditions

Do not call v1 RC closure complete while any of these are true:

- runner heartbeat is absent or a real workflow remains pre-run;
- required workflow artifacts cannot be retrieved and tied to the exact commit;
- `GLITCHTIP_DSN` is not deployment-backed or the failed binding remains unexplained;
- the current digest/SBOM/provenance/scan identity is missing or critical/high risk is undisposed;
- release-specific SLO, rollback, publication, legal/factual/media, privacy, visual, DNS/TLS, or deployment approvals are missing.
