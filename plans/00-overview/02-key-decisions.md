# Key Decisions

This document records the decisions that should remain stable during implementation. Changes should use an architecture decision record rather than being made implicitly in code.

## D-001 — Organization name

Use **Paper & Slate** as the primary name. Use “Paper & Slate Foundation” descriptively only where grammar requires it. The logo descriptor remains “Educational Foundation.”

Always use an ampersand, not “Paper and Slate,” except in machine identifiers where `paper-and-slate` is appropriate.

## D-002 — Positioning

Position Paper & Slate as **an open educational infrastructure foundation**.

Primary statement:

> Paper & Slate is an open foundation building the common infrastructure education software and schools have been missing.

Do not reduce the organization to a file format, data provider, API business, or educational nonprofit.

## D-003 — Audience priority

1. Developers and implementers
2. Educators
3. Schools and districts
4. Education software companies
5. Government data organizations
6. Researchers
7. Standards contributors
8. General public and donors

The homepage should be legible to all audiences but technically credible to the first audience.

## D-004 — Public site and docs deployment

Use one Next.js deployment on `paperandslate.org` at launch. Documentation lives under `/docs` with an independent route group and layout.

Prepare, but do not activate, support for `docs.paperandslate.org`.

## D-005 — Content source of truth

- Foundation, governance, project registry, news, and foundation-wide docs are owned by the website repository.
- Project-specific technical docs are owned by the standards monorepo or another registered project repository.
- Generated aggregate docs are never edited directly.
- Every imported page retains source repository, path, ref, and commit SHA.

## D-006 — Standards repository model

Use a standards monorepo initially. Projects remain independently versioned within that monorepo.

Recommended repository:

```text
PaperAndSlate/standards
```

## D-007 — Documentation framework

Use Fumadocs Core, Fumadocs UI, and Fumadocs MDX inside the Next.js application. Re-skin the UI; do not accept its default visual identity unchanged.

## D-008 — UI framework

Use Tailwind CSS and shadcn/ui as source-owned primitives. Paper & Slate owns all design tokens, variants, and component composition.

Do not adopt a rigid pre-themed component suite that fights the editorial brand.

## D-009 — Search

Expose one global search interface covering:

- public pages;
- projects;
- documentation pages and headings;
- schema properties;
- RFCs and decisions;
- news and releases.

Implement a provider interface. Use Typesense when provisioned through Tower, with a build-generated static fallback for local development and degraded operation.

## D-010 — Publishing

Use Git-backed MDX and structured registries. The founder publishes through branches and pull requests. Do not introduce a CMS in phase one.

## D-011 — Project maturity

Use the following statuses:

- Planned
- Experimental
- Draft
- Candidate
- Stable
- Deprecated
- Archived

The public registry and docs must never infer status from a branch or semantic version alone.

## D-012 — Versioning

Each project versions independently. Default routes show the latest stable version when one exists; otherwise they show the current draft with a conspicuous maturity label.

Historical versions are immutable.

## D-013 — Governance

Use founder stewardship and named maintainers initially. Significant changes use public RFCs. Publish a path toward a technical steering committee, but do not create ceremonial roles before real contributors exist.

## D-014 — Licensing

Recommended license matrix:

| Material | License |
|---|---|
| Source code and reference implementations | Apache License 2.0 |
| Specification prose and general documentation | Creative Commons Attribution 4.0 |
| Schemas, examples, identifiers, and registry data | CC0 1.0 public-domain dedication |
| Logos, name, and brand assets | Reserved under a public trademark usage policy |

This combination maximizes implementation freedom, includes an explicit patent grant for code, and keeps machine-readable standards frictionless.

## D-015 — Legal representation

Present Paper & Slate as established through design quality, clear policies, versioned work, and transparent governance. Do not claim incorporated nonprofit, charity, tax exemption, or a formal board until true.

## D-016 — Git hosting

GitHub is the canonical public origin. Local repositories are normal. Tower Forgejo may be a read-only mirror or operational backup, not a second writable source of truth.

## D-017 — Newsletter

Prepare a functional Kit integration behind environment configuration. The form must gracefully display “updates are not yet open” or remain hidden until credentials and form ID are supplied.

## D-018 — No authentication or API console

Do not add login, user models, API keys, organization claims, or an authenticated console in this phase. Reserve documentation taxonomy and route boundaries for a future Developer Platform section.

## D-019 — Non-production Developer Control Plane successor

This is a successor decision, not a revision of D-018. After RC3, Paper & Slate may plan a separately authorized Developer Control Plane. Its preferred human identity is Better Auth in a separate logical Web-owned identity/control database; it owns users, sessions, accounts, organizations, and memberships. Tower Keycloak is explicitly not the application identity.

Machine credentials belong to organization → project → key, never directly to a user. Web owns human authorization, lifecycle UI/control plane, audit, and the transactional outbox. The Data Platform receives only a machine-verifier projection and performs usage enforcement. API-key provider selection stays conditional behind an abstraction until project binding, portable verification, auditing, rotation/revocation, runtime, and security fit are demonstrated from primary documentation and project evidence. This decision authorizes no application, provider, or Tower resource implementation.
