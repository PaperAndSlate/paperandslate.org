# RFC System

## Purpose

RFCs provide a durable public process for significant technical and governance changes. They are proposals, not specifications by themselves.

## When an RFC is required

- create a new project;
- add or materially change normative behavior;
- make a breaking change;
- introduce a cross-project convention;
- change project maturity to Candidate or Stable;
- deprecate a stable feature or project;
- change governance, licensing, or trademark policy;
- define conformance or certification rules;
- introduce a security-sensitive protocol.

An RFC is usually unnecessary for typo fixes, examples, internal refactors, patch-level clarifications, or editorial navigation.

## Numbering

Use one foundation-wide sequence:

```text
RFC-0001
RFC-0002
```

Numbers are never reused. Slugs may include the title, but the number is the durable identity.

## Status lifecycle

```text
Idea → Draft → Review → Accepted / Rejected / Withdrawn
                             ↓
                         Implemented
                             ↓
                    Superseded if replaced
```

### Idea

An issue or discussion gathering scope before formal authorship.

### Draft

A complete proposal open to refinement, without a formal review clock.

### Review

The proposal is considered complete enough for a defined public review period.

### Accepted

The decision has been made. Acceptance does not mean implementation is complete.

### Rejected

The proposal is closed with rationale and remains archived.

### Withdrawn

The author or sponsor ends the proposal before decision.

### Implemented

The accepted behavior exists in the target project release and documentation.

### Superseded

A later RFC replaces it.

## Required RFC sections

```text
Title
Authors
Sponsor
Status
Summary
Motivation
Goals
Non-goals
User and implementation scenarios
Detailed proposal
Data model or protocol impact
Alternatives considered
Compatibility and migration
Security considerations
Privacy considerations
Accessibility and internationalization
Operational impact
Open questions
Implementation plan
Review and decision history
```

Sections may be marked not applicable with explanation.

## Review periods

Recommended defaults:

- ordinary technical RFC: 21 days;
- breaking or cross-project RFC: 30 days;
- governance or license RFC: 30–45 days;
- emergency security process: shortened confidential review with later public record.

A review period may be extended when new implementation evidence appears.

## Sponsorship

A maintainer sponsor confirms that the proposal is in scope and sufficiently formed. Sponsorship is not endorsement.

## Decision

Current phase:

- maintainers write a recommendation;
- founder makes the final decision;
- decision record includes rationale and dissent.

Future committee phase:

- voting or consensus rules will be defined before transfer.

## Repository structure

```text
governance/rfcs/
├── 0001-project-lifecycle.md
├── 0002-core-document-format.md
└── template.md
```

RFC content is rendered on the site and links to its GitHub discussion.

## Amendment after acceptance

Substantive changes require either:

- a new RFC that amends/supersedes the old one; or
- an explicit reopening process before implementation if the decision is not final.

Never silently rewrite an accepted RFC to describe different behavior.
