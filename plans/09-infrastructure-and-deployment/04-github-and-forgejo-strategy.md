# GitHub and Forgejo Strategy

## Recommendation

Use GitHub as the canonical public origin. Use ordinary local clones for development. Do not create two writable canonical repositories.

## Why GitHub should be canonical

- The PaperAndSlate organization already exists.
- Public contributors expect issues, discussions, pull requests, releases, and actions there.
- Documentation “Edit this page” and source links can use one consistent host.
- GitHub Actions can coordinate cross-repository rebuilds.
- Search engines and implementers recognize GitHub repository permanence.

## Local repository

A local repository is not an alternative origin. It is the normal working copy.

Recommended remotes:

```text
origin  git@github.com:PaperAndSlate/paperandslate.org.git
```

## Tower Forgejo options

### Option A — Skip at launch

Recommended. Deploy from GitHub and keep operational complexity low.

### Option B — Read-only mirror

Useful for:

- backup;
- internal availability;
- Tower-native build workflows;
- artifact retention.

Mirror rules:

- GitHub remains canonical;
- no issues/PRs accepted on Forgejo;
- mirror is automatically updated;
- UI clearly states read-only mirror;
- no human pushes except recovery procedure.

### Option C — Private operations repository

Use Forgejo for infrastructure details that should not live in the public app repository, while public application source remains on GitHub.

## Avoid

- bidirectional mirroring;
- contributors choosing either host for pull requests;
- releases created independently on both hosts;
- “primary” changing based on which CI system is convenient;
- deploy credentials capable of writing to source repositories unnecessarily.

## Initial repository creation

When ready, create:

```text
PaperAndSlate/paperandslate.org
```

Suggested first commit:

- `README.md`;
- Apache-2.0 `LICENSE` for code;
- docs/content license notice;
- `TRADEMARKS.md` placeholder reviewed before launch;
- `CODE_OF_CONDUCT.md`;
- `SECURITY.md`;
- minimal workspace scaffold.

The current task should not create or commit the repository automatically without explicit approval.
