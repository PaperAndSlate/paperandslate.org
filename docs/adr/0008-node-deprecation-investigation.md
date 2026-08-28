# ADR 0008: Keep pnpm child-process invocation shell-free

Status: accepted for v1 release-candidate implementation
Date: 2026-08-28

## Context

Node 24.17.0 emits `DEP0190` when a child process is launched with an argument
array and `shell: true`. The Lighthouse, staging Lighthouse, verification, and
vulnerability-scan wrappers used that pattern on Windows. Node also reports
`DEP0169` for the legacy `url.parse()` API, so the RC3 package and dependency
smoke paths were checked with deprecation tracing.

## Decision

All first-party pnpm child processes use `scripts/pnpm-command.ts`. POSIX hosts
execute `pnpm` with an explicit argv array. Windows hosts invoke `pnpm.cmd`
through `cmd.exe /d /s /c` with separate argv entries and `shell: false`. This
preserves pnpm shim compatibility without concatenating task input into a shell
command and removes the first-party `DEP0190` trigger.

No dependency upgrade is justified by the investigation. If a hosted run
reproduces `DEP0169`, retain the complete deprecation stack and dependency chain
before changing a dependency.

## Verification

- Repository and installed dependency text scans found no first-party or
  installed literal `url.parse(` call in the exercised source.
- Direct `require("url").parse(...)` reproduction confirms that Node itself
  still emits `DEP0169`; it is not evidence of a repository call site.
- Node 24.17.0 `pnpm test`, frozen install, package pack/clean-install smoke,
  and npm pack tracing did not emit `DEP0169`.
- Lighthouse tracing reproduced first-party `DEP0190` at the old shell-array
  launch site; the launchers now use the shared shell-free adapter and have
  platform-specific regression coverage.

## Consequences

The wrappers retain their existing exit-code, timeout, and failure behavior.
CI must still provide an unprivileged browser and responsive runner; this ADR
does not suppress warnings or turn unavailable hosted execution into a pass.
