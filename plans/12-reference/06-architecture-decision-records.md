# Architecture Decision Records

## ADR format

```md
# ADR-NNNN: Title

- Status: Proposed | Accepted | Superseded | Rejected
- Date: YYYY-MM-DD
- Decision makers: ...
- Related RFCs/issues: ...

## Context

## Decision

## Alternatives considered

## Consequences

## Follow-up
```

## Initial ADRs to create

### ADR-0001 — One deployable site with docs at `/docs`

Decision: combine at launch, preserve split option.

### ADR-0002 — Git-backed content rather than a CMS

Decision: founder publishes through repository pull requests.

### ADR-0003 — Fumadocs for documentation

Decision: use Fumadocs inside Next.js and customize the UI.

### ADR-0004 — Explicit docs source registry rather than submodules

Decision: build-time import with lock file and source provenance.

### ADR-0005 — Standards monorepo with independent project versions

Decision: one repository initially, project-level manifests/releases.

### ADR-0006 — shadcn/ui and owned design tokens

Decision: source-owned primitives rather than a pre-themed suite.

### ADR-0007 — Typesense with static fallback

Decision: unified exact/full-text search without hard availability dependency.

### ADR-0008 — License matrix

Decision: Apache-2.0 code, CC BY 4.0 prose, CC0 schemas/examples, reserved trademarks.

### ADR-0009 — GitHub canonical; Forgejo mirror optional

Decision: no dual writable origin.

### ADR-0010 — No database in phase one

Decision: static/Git-backed architecture until a real persistent feature requires storage.

### ADR-0011 — Restricted imported MDX

Decision: imported docs cannot run arbitrary code.

### ADR-0012 — Project-scoped documentation versions

Decision: no global Paper & Slate version selector.
