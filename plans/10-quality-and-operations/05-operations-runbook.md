# Operations Runbook

## Routine operations

### Weekly

- review failed builds;
- inspect error tracking;
- inspect synthetic monitors;
- review newsletter failures if enabled;
- review open security alerts;
- triage broken-link reports.

### Monthly

- stale content report;
- dependency updates;
- search zero-result report;
- performance trend;
- backup/mirror verification if Forgejo is used;
- preview resource cleanup;
- project registry accuracy review.

### Quarterly

- accessibility spot check;
- disaster recovery/rollback test;
- secret access review;
- governance and maintainer list review;
- analytics/privacy review;
- external link full scan.

## Deploy failure

1. Stop promotion.
2. Preserve CI artifacts and source lock.
3. Determine whether failure is code, content, imported source, or search.
4. Keep current production deployment.
5. Fix or pin last-known-good docs source.
6. Re-run validation.

Do not bypass content validation to publish a broken standards update.

## Production incident

1. Confirm impact and affected routes.
2. Roll back app if broad.
3. Disable failing optional integration if isolated.
4. Preserve logs with redaction.
5. Communicate status when outage is material.
6. Publish incident record for significant events.

## Search outage

- activate/static fallback automatically;
- show quiet degraded label;
- monitor Typesense;
- avoid taking page rendering down;
- rebuild/restore prior index if data corruption exists.

## Newsletter outage

- disable form or return provider-unavailable state;
- do not queue emails in application logs or an improvised database;
- link to feeds;
- investigate provider status and credentials.

## Imported docs failure

- retain last successful production artifact;
- block new deployment;
- identify source repository/ref/file;
- open issue or report to affected project;
- do not silently omit stable project docs.

## Security incident

Follow `SECURITY.md` and incident-response policy. Rotate affected secrets, invalidate deployment tokens, inspect source integrity, and coordinate disclosure.

## Rollback verification

After rollback verify:

- homepage;
- project registry;
- docs;
- feeds;
- search result URLs;
- newsletter disabled/working state;
- deployment SHA;
- no stale search index pointing to missing pages.

## Backups

GitHub is the source backup for content and code. Additionally preserve:

- release artifacts;
- immutable docs tags;
- container images;
- search index export or reproducible records;
- Infisical backup/recovery process;
- domain/DNS ownership records.
