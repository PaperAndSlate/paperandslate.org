# CI/CD and Preview Workflows

## Pull-request workflow

Jobs:

1. `changes` — determine affected packages/content/projects.
2. `install` — pnpm cache and frozen install.
3. `lint` — TypeScript/ESLint/Markdown.
4. `typecheck`.
5. `unit` — Vitest.
6. `content` — frontmatter, MDX safety, governance metadata.
7. `docs-ingest` — fixture/local or branch-aware approved source.
8. `links` — internal anchors and routes.
9. `build`.
10. `e2e` — representative flows.
11. `a11y` — axe and keyboard smoke.
12. `lighthouse` — key routes.
13. `security` — dependency review, secret scan, container/SBOM if built.
14. `preview` — Tower PR preview.
15. `visual` — selected screenshot diffs.

## Preview comments

Post a pull-request summary containing:

- preview URL;
- docs sources and SHAs;
- pages added/removed;
- redirects;
- project/status changes;
- broken-link summary;
- Lighthouse results;
- accessibility findings;
- search index mode;
- generated artifacts link.

## Main branch workflow

1. Full validation.
2. Build signed/pinned image.
3. Deploy staging/candidate.
4. Run smoke checks.
5. Deploy production.
6. Index search.
7. Validate production.
8. Create deployment record.

Use environment protection/approval if desired during early launches.

## Standards repository trigger

In `PaperAndSlate/standards`:

- detect changed project docs/manifests;
- validate locally;
- send `repository_dispatch` to website repository on merge;
- include project IDs, ref, and SHA.

Website workflow:

- resolves allowed source;
- rebuilds docs;
- reports failures back through issue/check integration where possible.

## Nightly jobs

- external link validation;
- source drift/rebuild;
- dependency and vulnerability scan;
- stale content review report;
- roadmap stale item report;
- search smoke queries;
- feed validation;
- license/notice audit.

## Scheduled publishing

Run a lightweight scheduled workflow hourly or at a reasonable cadence. If new scheduled content becomes eligible, trigger a production build.

## Release workflows

Website source releases need not match project releases. Tag major site milestones separately.

Project releases in the standards monorepo should:

- validate project docs;
- freeze a documentation source ref;
- update version manifest;
- create release artifacts;
- trigger site rebuild.

## Branch protections

- required checks;
- no force-push to main;
- signed commits optional, signed releases recommended;
- at least one review when maintainers beyond founder exist;
- CODEOWNERS for governance, design system, content schemas, and security-sensitive files.
