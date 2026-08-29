# Hosted validation contract

This repository keeps hosted execution separate from local evidence. A green
local command or a historical Tower/Forgejo result is not a GitHub result, and
no workflow run is a release, deployment, publication, or external approval.

## GitHub workflow coverage

`.github/workflows/ci.yml` runs the portable quality suite on Ubuntu, Windows,
and macOS. Ubuntu covers Node 20.x, 22.x, 24.17.0, and current Node 24.x for
the advertised engine floor and release baseline. Windows and macOS each cover
both Node 24.17.0 and current Node 24.x. Every matrix entry uses the frozen
lockfile and runs requirements, documentation-bundle, content/feed/release/
route, security/SEO/rollback, format, lint, typecheck, unit/integration tests,
the build boundary, and the production web build.

The quality job also runs the repository-owned license/notice policy check.
That check verifies the Apache code license, CC BY documentation notice,
reserved trademark notice, and private package metadata. It records repository
policy consistency only; legal review and third-party license approval remain
human gates.

The root `pnpm lint` command covers authored application, package, script, and
test sources. The root `pnpm typecheck` command covers the workspace packages,
the Next application, and the repository scripts/tests through
`tsconfig.tools.json`. Each quality-matrix entry uploads its generated failure
and success evidence with a 14-day retention period; the dedicated Linux jobs
upload their broader browser, performance, container, and SBOM outputs.

The Ubuntu Node 24.x jobs additionally run the aggregate `verify:hosted` gate,
which installs and exercises Chromium, Firefox, and WebKit smoke/accessibility
projects on Linux, plus Lighthouse/performance checks, Docker health probing,
and SBOM generation. The fixed Node 24.17.0 matrix entry remains a separate
portable compatibility check. These jobs upload failure and success evidence
with a bounded 14-day retention period. The workflows use explicit job timeouts, cancel
superseded runs on the same ref, and cache only the lockfile-keyed pnpm store.

Lighthouse and Docker jobs are intentionally Linux-only. Linux is the runner
contract for Playwright system dependencies, browser sandboxing, container
availability, and the existing visual/performance baselines. The Linux browser
gate covers Chromium, Firefox, and WebKit; real iOS Safari, Android Chrome,
and Windows high-DPI device behavior remain separate device/hosted acceptance
work because those environments are not provided by this workflow. The
Forgejo browser jobs additionally require the operator-provided `playwright`
runner to identify its unprivileged account as `pwuser`; a different runner
image must update that explicit assertion only after its account is verified.
The Windows/macOS matrix performs the portable build and quality checks but does
not claim browser or Docker coverage on those systems. A platform-specific
runner result must not be copied to another operating system.

Local Playwright commands use the completed production build rather than
`next dev`. The `scripts/playwright-server.ts` wrapper copies the checked
standalone server, static assets, and public assets into a process-scoped
ignored runtime directory, then starts that runtime with shell-free Node
arguments. This avoids sharing `.next/dev` Turbopack state between sequential
test files and makes the local browser contract match the production build.
Playwright-managed Chromium is used by default on every operating system; run
`pnpm exec playwright install chromium` once before local browser commands.
The local default intentionally stays Chromium so a machine without the other
Playwright browser binaries has a deterministic baseline. Set
`PLAYWRIGHT_BROWSER_MATRIX=true` and install `chromium firefox webkit` to run
the Linux hosted browser matrix. An explicit `PLAYWRIGHT_EXECUTABLE_PATH` is
supported for controlled Chromium diagnostics. Run `pnpm build:web` before
invoking a browser script directly; `pnpm verify` already performs that build
immediately before `e2e`, `a11y:rc`, `links`, and `visual:check`.
`PLAYWRIGHT_PORT` may select another validated local TCP port when parallel
local work requires it.
The local and hosted Lighthouse wrappers use LHCI's Puppeteer-managed browser
with a process-scoped, caller-owned profile. This avoids the Windows cleanup
race in the transitive `chrome-launcher` process path; Lighthouse collection
and its configured assertions remain unchanged.

CodeQL runs on push, pull request, schedule, and manual dispatch with only the
permissions needed to read source and upload security results. Dependency
review runs only for pull requests. Neither workflow uses `pull_request_target`
or receives repository secrets from fork pull requests. Dependabot proposes
weekly GitHub Action and npm dependency updates for review.

`pnpm workflow:check` parses all seven GitHub and Forgejo workflow files during
the quality gate. It enforces full action commit SHAs, top-level read-only
permissions, concurrency, job timeouts, disabled checkout credential
persistence, and the absence of unsafe browser/shell settings. The root
`build:web` and `build:verify` wrappers preserve the repository's generated
Next.js type stub so a successful build does not create a source-tree change.

The named aliases `actions:check`, `packages:check`,
`verify:release-reproducibility`, and `verify:hosted` are the executable names
used by the release checklist; they delegate to the same workflow, package,
reproducibility, and browser-backed aggregate checks used by the lower-level
commands.

The package smoke check packs all five private workspace packages, installs the
archives into an external temporary consumer, and typechecks/runtime-imports
them through the repository's TypeScript source-package contract. These
packages are private source packages rather than independently published
compiled distributions; the smoke check therefore does not claim a public
native-Node distribution API.

Generated launch receipts record the source commit, source tree, clean authored
source state, and dirty authored paths at the time of each check. The launch
report accepts a receipt from the current source commit or from the immediately
following evidence-only commit that changes only the generated ledger and
traceability artifacts. A failed package, browser, visual, Lighthouse, SBOM,
container, or verification run overwrites its prior receipt with a failed
record, so an older pass cannot silently survive a later failure.

## Repository protection expectations

The hosting administrator must configure the protected release branch to
require pull requests, at least one maintainer review, CODEOWNERS review for
`.github/`, `.forgejo/`, `scripts/`, `config/`, and `docs/`, dismissal of stale
approvals, conversation resolution, and the complete required status set:

- every `quality / ...` matrix entry;
- `full verify / Ubuntu / Node 24`;
- `Lighthouse / Ubuntu / Node 24`;
- `container and SBOM / Ubuntu / Node 24`;
- CodeQL analysis; and
- dependency review for pull requests.

The administrator should also forbid force-push and branch deletion, require
the branch to be up to date before merge, and restrict workflow-file changes
to reviewed pull requests. These are hosted settings and remain unverified
until the repository administrator records them.

Action references are immutable commit SHAs with release comments. Scheduled
security workflows and dependency updates are advisory inputs until a
maintainer reviews and merges them. No hosted workflow may print secrets,
forward ambient credentials to a fetched URL, disable TLS or browser sandbox
protections, weaken thresholds, or convert an unavailable provider check into a
pass.
