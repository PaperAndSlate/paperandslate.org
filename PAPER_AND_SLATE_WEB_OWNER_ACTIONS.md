# Paper & Slate Web v1 Owner / Platform Actions

This file is the exact action list for work that requires provider, host, account, production, editorial, or legal authority. Codex can prepare evidence and perform the bounded Tower actions listed below, but it cannot assume these approvals or access. Never place secret values, runner enrollment tokens, DSNs, passwords, or private keys in chat, commits, or issue comments.

## 1. Repair Forgejo Actions scheduling

### Owner/platform operator

1. Open the Forgejo instance and confirm Actions are enabled globally and for `callum/paperandslate-web`.
2. Inspect the global Actions scheduler/queue and the stale task records associated with runs 143, 144, and 145. Confirm whether they were rejected before assignment, abandoned, or left in a stale state.
3. On the `tower-docker-runner` host, verify that the runner service/process is running and configured for this repository. Confirm the host clock is synchronized.
4. Verify host DNS and network access to the Forgejo endpoint, `code.forgejo.org`, the Tower registry, and the package registry.
5. Verify TLS trust includes the normal system/public roots plus the current Tower CA. Do not disable certificate verification.
6. Verify the Tower CI Docker-in-Docker path, including the runner’s ability to start the `playwright` and `ubuntu-latest` job environments.
7. Keep the labels `ubuntu-latest`, `node22`, `docker`, and `playwright`, or document any change before changing workflow labels.

### Codex/Tower follow-up

1. Ask Codex to issue a new repository-scoped enrollment using `tower_ci_runner_enroll` after the host is ready. The enrollment is one-time and expires after 15 minutes.
2. The operator exchanges the token on the target host exactly once using the approved host procedure. Do not send the token to Codex or store it in a file committed to the repository.
3. Ask Codex to list the runner and verify an online/recent `lastOnline` heartbeat.
4. Ask Codex to dispatch `container.yml` first, then `quality.yml`, `lighthouse.yml`, and `supply-chain.yml` as appropriate. The expected evidence is a task with a start time, runner assignment, steps, logs, and artifacts.
5. When reading the result, use the internal `id` returned by `tower_ci_runs_list` with `tower_ci_run_get`; the displayed Forgejo run number is not currently a safe lookup key. The known mapping is Forgejo 143→Tower 152, 144→153, and 145→154.
6. If assignment still fails, return the new run ids and scheduler/runner-host evidence to the platform operator. Do not create more release runs until the admission problem is understood.
7. Once a job actually starts, Codex can retrieve bounded Tower CI metadata, provider-backed logs, artifacts, and (if the workflow is explicitly wired for it) a Tower structured reporter result. Reporter `67f03584-babf-4b4e-b09c-b6570e0a637a` is active and injects the write-only `TOWER_CI_REPORT_TOKEN`; the web workflow still needs a reviewed concise-summary step. The current workflows have no executed-step evidence or reporter result, so do not claim Tower-visible log acceptance until a real run proves it.

The existing Tower-owned control workflow `callum/tower-staging-validation/.forgejo/workflows/ci.yml` was dispatched as Tower run 155 (Forgejo display run 9) and reproduced the same one-second, unassigned failure. Use this as the first post-repair control test; its prior successful run 8 is useful historical comparison evidence.

## 2. Repair Forgejo credentials and permissions

1. Identify the owner of Forgejo token ids 20 and 21 (`tower-agent-paperandslate-staging-rc` and `tower-agent-paperandslate-staging-rc-2`). Both are currently non-expiring and broad-scoped.
2. Create a replacement short-lived repository identity with only the minimum Git read/write scope. Do not include package write unless it is separately and explicitly required.
3. Keep package installation on a separate `read:package` identity. The existing package-read metadata is separate from token 21; verify the CI secret points to the intended identity.
4. Update local credential storage and CI secrets through the approved secret manager. Do not print or paste token material.
5. Verify read-only repository access and package metadata access. Perform a push test only if the owner explicitly authorizes it and the test targets a safe non-release branch.
6. Revoke or expire token 21 only after the replacement is confirmed and record the audit result.
7. If Tower permission rotation is preferred, provide the original token only through the controller’s approved secret-bearing flow and ensure the required Forgejo admin authority is available. Codex must not receive the token in chat.

The Tower observability snapshot also needs a platform-side correction: it queries retired host metrics and receives `unknown_metric` while still summarizing overall health as healthy. The current approved metric names are `container_cpu`, `container_memory`, `ci_failures`, `request_rate`, and `request_error_rate`; do not use the legacy host-metric result as release evidence.

## 3. Resolve the GlitchTip secret-name mismatch

Choose one consistent contract; do not do both.

### Preferred: create the managed alias

1. In the approved Infisical/Tower secret store, create `GLITCHTIP_DSN` with the same managed value currently referenced by `SENTRY_DSN`.
2. Keep the value server-side; only report the key name and metadata.
3. Ask Codex to reconcile the staging bindings and verify that the target key is healthy.
4. Remove or disable the failed `GLITCHTIP_DSN` binding record using the controller/admin cleanup path. The current exposed Tower tool can create/reconcile/list but does not expose binding deletion.
5. Ask Codex to validate the contract against a real staging deployment and check the redacted application/deployment health evidence.

### Alternative: make the contract consistently use `SENTRY_DSN`

1. Approve a separate Paper & Slate web-thread change to update the manifest/app contract to `SENTRY_DSN`.
2. Run the repository’s focused checks and review the diff.
3. Ask Codex to revalidate the deployment-backed contract and reconcile the existing healthy binding.

## 4. Complete provider/resource evidence

1. Ask Codex to recheck Valkey and S3 health after the staging deployment.
2. Authorize a bounded Typesense write/delete roundtrip if the controller exposes the safe roundtrip mode. Confirm that the test uses a temporary document and leaves the collection in its original state.
3. If indexing is application-owned, ask Codex to run `pnpm search:index --publish-typesense` in the approved staging environment with `TYPESENSE_API_KEY` kept server-side for writes and `TYPESENSE_SEARCH_API_KEY` kept server-side for search. Require the receipt to identify the exact SHA, concrete collection, alias, counts, query results, and temporary-document cleanup.
4. Confirm the Typesense collection is populated by the intended indexing workflow. A healthy empty collection is not publication/search acceptance.
5. Confirm the registry credential remains active and has the intended pull/push scope and expiry.

## 5. Establish repository, DNS, TLS, and deployment authority

1. Decide whether `release/v1-closure` must be protected with required checks and approvals. It is currently unprotected with no required status checks.
2. Select the exact release commit. Do not mix the observed remote commit `330ab...` with the current unpushed local candidate `5df3a6457a7121f56e7d0db6feb4c5ab9f32c126`.
3. Confirm who may create the final RC tag, approve merges, deploy production, and roll back production.
4. Confirm registrar/DNS authority for the public Paper & Slate hostname and the certificate/TLS provider. The `.dev.tower` hostname is staging-only; Cloudflare is not configured in the manifest.
5. Ask Codex to run staging DNS/TLS/HTTP probes and bounded staging deployment actions. Production actions require the owner’s explicit approval and the manifest’s production gate.

## 6. Approve monitoring and rollback evidence

1. Define the production on-call owner and incident escalation path.
2. Select the previous known-good image digest and document the rollback target.
3. Ask Codex to capture a clean staging baseline, candidate window, SLO result, deployment annotation, and controlled staging rollback evidence.
4. Review the current 24-hour SLO degradation: availability is about 99.855%, but p95 is about 2.792–2.901 seconds against a 2-second target. Decide whether the release window can meet the policy.
5. Review and disposition the unresolved GlitchTip error. Do not treat a healthy last probe as a clean historical SLO window.
6. Approve any production rollback or release pause. Codex can perform a bounded rollback only after explicit authorization.

## 7. Complete SBOM, vulnerability, signing, and release identity

1. After the runner is repaired, ask Codex to dispatch the supply-chain workflow for the selected exact commit.
2. Confirm the workflow pushes an immutable image and publishes its digest, CycloneDX SBOM, vulnerability scan, provenance, evidence summary, and release identity.
3. Review the historical image findings as a warning baseline: 5 critical and 49 high findings were reported. Disposition every release-blocking finding before approval.
4. Decide whether image signing is mandatory. Tower currently reports signing as not configured; configure an approved signing authority if required.
5. Ask Codex to verify that the staged deployment uses the exact reported digest and that all artifacts reference the same commit.

## 8. Complete qualified legal, factual, privacy, media, visual, and publication approval

### Visual and Lighthouse evidence

1. Ask Codex to run the `playwright` workflow against the exact image-backed staging deployment after runner admission is repaired. Require the run SHA, URL, browser version, runner user, route/query set, run count, category scores, thresholds, and artifact paths.
2. Ask Codex to rerun the local visual matrix and compare checksums for the 13 expected captures under `.generated/launch/visual/` against their references under `plans/assets/mockups/`.
3. The owner/editor reviews every capture across the approved desktop/mobile/browser matrix, including responsive layout, focus, contrast, reduced motion, dark mode, empty/error/form states, docs rendering, and search overlays.
4. Record capture ID, route/state, intentional deviation and reason, reviewer, approval ID, date, and next review/expiry. A screenshot hash proves capture identity, not visual fidelity or rights.

Codex can run deterministic browser/Lighthouse checks, dispatch the workflow, retrieve verified artifacts, compare them to the exact commit, and fail the evidence packet when a required state or approval is absent. The owner/editor must make the visual/brand decision.

### Qualified factual, legal, privacy, brand, and media approval

The owner/editor, not Codex, must assign and record:

- factual/source review for claims, dates, names, and citations;
- legal/privacy review for personal data, disclosures, terms, and jurisdictional requirements;
- media/brand rights for images, fonts, logos, screenshots, audio, and third-party materials, including license/source records;
- publication timing, canonical URL, feed contents, redirects, and takedown/rollback contact.

For each claim or asset, record the exact wording or asset ID, source/license reference, reviewer name, role or qualification, approval ID, scope, date, next review/expiry, findings, and explicit disposition. Codex can reconcile approved values against content models, metadata, JSON-LD, search records, feeds, sitemap, robots, and AI outputs; it cannot act as counsel, factual approver, rights holder, or substitute for consent.

## 9. Validate publication and feeds

1. Ask Codex to validate the selected staging build’s homepage, canonical metadata, robots/sitemap behavior, RSS/XML syntax, item GUIDs, dates, links, content types, and cache headers.
2. Compare feed entries with the approved publication inventory and `PUBLICATION_AS_OF` value.
3. Confirm the production hostname, redirects, TLS, and feed URL after the owner controls the DNS/deployment change.
4. Record the final feed URL, validation timestamp, tested commit/image digest, and publication approver.

## Definition of done

The owner may request a final release review only after the handoff report shows a real runner heartbeat, successful current-commit workflow runs with retrievable artifacts, deployment-backed secrets, immutable image/SBOM/provenance identity, acceptable SLO/rollback evidence, and all qualified approvals. Until then, leave the release open.
