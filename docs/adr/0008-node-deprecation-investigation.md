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

## Superseding implementation: trusted pinned pnpm launcher (2026-09-15)

The v1 closure implementation supersedes the Windows `cmd.exe`/`pnpm.cmd` shim
dispatch described above. Every first-party pnpm wrapper now launches the
already running `process.execPath` with `shell: false`, `windowsHide: true`,
and a separate argument vector whose first argument is the canonical absolute
`bin/pnpm.cjs` entry from pnpm `10.6.0`. No shell interpreter, shim, PATH
executable lookup, or environment-selected Node executable supplies launch
authority.

The entrypoint is resolved from a finite set of trusted toolchain roots: the
canonical running Node installation, the OS-account
`setup-pnpm/node_modules/pnpm` installation provisioned by `pnpm/action-setup`,
and the OS-account Corepack v1 cache for `pnpm/10.6.0`. The account home comes
from `os.userInfo().homedir`, not HOME/USERPROFILE/APPDATA/LOCALAPPDATA or
COREPACK_HOME. Each candidate must be a regular, canonically contained package
with the exact pnpm name/version and expected bin entry; arbitrary package
metadata or a profile-selected path is not a trust anchor. An attacker able to
replace the already trusted OS/CI Node or pnpm installation remains outside
this boundary.

The shared child-environment preparation removes case-insensitive launcher and
preload overrides (`ComSpec`, `PNPM_HOME`, npm/Corepack launcher settings,
`NODE_OPTIONS`, `NODE_PATH`, and shell-emulator settings), de-duplicates keys,
and places the canonical Node directory first in a retained absolute PATH. It
still preserves explicit CI, publication/release, locale, browser, and fixture
settings. Repository package scripts may retain deliberate shell syntax; the
first-party pnpm launch itself never constructs or interprets a shell command.

### Configuration-boundary correction (2026-09-15)

Callum accepted this trusted-launcher architecture for the remaining CodeQL
command-injection remediation. The implementation also normalizes environment
key spelling before filtering: hyphen and underscore aliases for
`npm_config_script_shell`, `npm_config_node_options`, and
`npm_config_shell_emulator` are blocked together with user/global config,
prefix, init-module, and on-load selectors. HOME, USERPROFILE, APPDATA,
LOCALAPPDATA, and XDG_CONFIG_HOME are reset to the authenticated OS-account
home and are not inherited from the caller. This closes the configuration
indirection demonstrated by real pinned-pnpm probes while retaining explicit
CI, release, browser, locale, and fixture fields. Regression tests use owned
fixtures, hostile parent variables, and actual child launches; the trust
boundary continues to assume the provisioned OS/CI Node and pnpm package are
trusted.
