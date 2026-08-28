# T005: shell-free pnpm invocation and deprecation record

Task: `T005`
Kind: `pm`
Status: `done`

## Summary

All first-party pnpm child-process wrappers now use the shared
`scripts/pnpm-command.ts` adapter with explicit argv and `shell: false`.
POSIX hosts execute `pnpm` directly; Windows hosts dispatch `pnpm.cmd` through
`cmd.exe /d /s /c` without concatenating task input. Existing exit, timeout,
cleanup, and failure semantics are unchanged. The non-reproduced `DEP0169`
investigation and the first-party `DEP0190` root cause are recorded in
`docs/adr/0008-node-deprecation-investigation.md`.

## Changed files

- `scripts/pnpm-command.ts`
- `scripts/ci-browser.ts`
- `scripts/lighthouse.ts`
- `scripts/lighthouse-staging.ts`
- `scripts/verify.ts`
- `scripts/vulnerability-scan.ts`
- `scripts/wrapper-failure-fixture.ts`
- `tests/pnpm-command.test.ts`
- `docs/adr/0008-node-deprecation-investigation.md`

## Verification

- `pnpm exec prettier --check ...` passed for all changed source, test, and ADR files.
- `pnpm test -- tests/pnpm-command.test.ts tests/lighthouse-chrome.test.ts` passed: 2 files, 5 tests.
- `pnpm test` passed under `NODE_OPTIONS=--trace-deprecation`: 18 files, 50 tests, with no `DEP0169` output.
- `pnpm typecheck` passed for all 6 workspace packages.
- `pnpm wrappers:failure` passed for Lighthouse, container, and CI-browser failure fixtures.
- Static search confirms no remaining first-party pnpm spawn path uses `shell: true`.

## Disposition

The first-party `DEP0190` trigger is remediated. `DEP0169` remains an
environment-dependent diagnostic only: Node's direct legacy API reproduction
still emits it, but repository tests, frozen install, package pack/clean-install
smoke, and npm pack tracing did not. No dependency upgrade is justified without
a future complete hosted stack and dependency-chain reproduction.

## Remaining blockers

- Hosted Linux, Windows, and macOS execution is still required for external
  runner evidence.
- Docker and Playwright installation remain stalled in the current local
  environment; no successful browser/container gate is claimed here.
