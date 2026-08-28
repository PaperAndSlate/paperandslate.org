# T004: package review and deprecation diagnosis

Task: `T004`
Kind: `pm`
Status: `current`

## Summary

The T003 slice is bounded and preserves the failed-gate truth: container health is now checked from inside the same detached container, and CI browser wrappers fail closed for root Linux runners while selecting the installed Playwright Chromium. Focused formatting, typecheck, wrapper-failure, and frozen-install checks pass; Docker and browser installation remain environment-stalled and require hosted runner evidence.

The requested `DEP0169` warning was not reproduced by `pnpm install --frozen-lockfile`, `pnpm pack`, clean tarball installation, or the Vitest suite under Node `v24.17.0`. Repository and installed dependency text scans found no `url.parse(` call. A related first-party `DEP0190` warning was reproduced from `scripts/lighthouse.ts:126`, where a child process received argument arrays with `shell: true`; the same pattern exists in the staging Lighthouse, verification, vulnerability, and new CI-browser wrappers. This is repository-controlled and should be modernized with an explicit Windows `cmd.exe` argv adapter and regression coverage. If `DEP0169` reappears in hosted package smoke, capture the full stack and dependency chain before changing dependencies.

## Details

- Current worker diff is limited to the approved workflow/container/browser files plus `scripts/ci-browser.ts` and focused failure coverage. No pre-existing release-closure document was changed by T003.
- The remaining workflow gaps are larger than the T003 fix: `.github/workflows/ci.yml` still has one Ubuntu Node-20 job, unpinned actions, no artifact retention/permissions/concurrency/timeout policy, no Windows/macOS matrix, and no CodeQL/dependency-review workflow. Forgejo workflows still use mutable action tags and do not express hosted-runner capability limitations.
- The current generated evidence remains historical or failed (`repository-identity.json` references RC2-local-final, `verify.json` failed before work, `container-check.json` is failed/running, and `staging-publication.json` is RC2). It must not be relabeled as current RC3 evidence.

## Next safe package

Modernize first-party child-process invocation to remove `DEP0190` without weakening Windows compatibility, add platform-adapter tests, and add a durable investigation ADR recording the non-reproduction and required hosted diagnostic for `DEP0169`. Keep package/dependency versions unchanged unless a captured stack proves a transitive fix is needed.
