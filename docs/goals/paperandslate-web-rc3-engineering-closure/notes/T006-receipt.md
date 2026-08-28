# T006: hosted workflow hardening

Task: `T006`
Kind: `pm`
Status: `done`

## Summary

Hosted validation now has a cross-platform GitHub Actions matrix and bounded
specialized jobs. Ubuntu runs Node 20.x, 22.x, and 24.x; Windows and macOS run
Node 22.x. Each portable matrix entry installs with the frozen lockfile and
runs the repository quality, content, documentation, security, release,
build, and test checks. Linux Node 24 additionally runs the aggregate browser
verification, Lighthouse/performance, Docker health, and SBOM jobs. GitHub
actions are pinned to verified immutable commits; CodeQL and pull-request-only
dependency review are present with least-privilege permissions. Forgejo
workflows received the same action pinning, timeouts, concurrency, and bounded
artifact-retention treatment.

## Changed files

- `.github/workflows/ci.yml`
- `.github/workflows/codeql.yml`
- `.github/workflows/dependency-review.yml`
- `.github/dependabot.yml`
- `.github/CODEOWNERS`
- `.forgejo/workflows/container.yml`
- `.forgejo/workflows/lighthouse.yml`
- `.forgejo/workflows/quality.yml`
- `.forgejo/workflows/supply-chain.yml`
- `docs/hosted-validation.md`

## Verification

- All changed YAML files parse with the repository `yaml` parser.
- Prettier checks passed for all changed workflow and documentation files; the
  non-parser CODEOWNERS file was reviewed separately.
- The immutable action refs were reverified against their release tags:
  checkout `11bd719...`, pnpm setup peeled commit `a7487c7...`, setup-node
  `49933ea...`, upload-artifact `ea165f8...`, CodeQL `60168ef...`, and
  dependency review `595b5ae...`.
- `pnpm format:check` passed.
- `pnpm lint` passed for all 6 workspace packages.
- `pnpm typecheck` passed for all 6 workspace packages.
- `pnpm test` passed: 18 files, 50 tests.
- `pnpm requirements:check` passed and generated 1,066 records.
- `pnpm release:check` passed for 2 release records.
- `pnpm build:verify` passed; `pnpm build:web` passed with 74 generated pages.
- Static workflow audit found no mutable action refs, `pull_request_target`,
  `--no-sandbox`, or shell-array invocation in the changed workflows.

## Hosted limitations

No GitHub or Forgejo run was produced in this environment. Browser, Lighthouse,
and Docker jobs intentionally remain Linux-only because their system
dependencies, Chromium sandbox, container daemon, and visual baselines are
platform-specific. Branch protection and CODEOWNERS enforcement remain hosting
administrator settings and are not claimed as configured.

## Remaining blockers

- Exact-SHA hosted execution is still required on Ubuntu, Windows, and macOS.
- CodeQL/dependency-review results require a hosted GitHub run.
- Provider, staging, OCI, signing, observability, rollback, human approval,
  and publication gates remain external and unchanged.
