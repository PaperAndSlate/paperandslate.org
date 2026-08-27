# Project Lifecycle and Maturity

## Planned

A recognized problem area with intended scope but no implementation-ready specification.

Requirements:

- public problem statement;
- intended relationship to existing projects;
- owner or steward;
- roadmap status.

Must not:

- claim conformance;
- publish a stable version;
- imply implementation readiness.

## Experimental

Active exploration with examples or prototypes. Major changes are expected.

Requirements:

- repository or design source;
- explicit open questions;
- security/privacy notes when applicable;
- clear warning in docs and search.

Version guidance: `0.x` or date-based prototypes are acceptable, but maturity is not inferred from version.

## Draft

A coherent proposal suitable for early implementation feedback.

Requirements:

- defined scope and non-goals;
- draft specification;
- examples;
- versioning approach;
- issue tracker;
- named maintainer;
- license;
- known compatibility risks.

## Candidate

Feature-complete enough for broad review and implementation validation. Breaking changes should be exceptional.

Requirements:

- at least two independent prototype implementations or equivalent evidence where practical;
- conformance or validation tests;
- security and privacy review;
- migration plan;
- complete reference docs;
- public review period;
- no unresolved critical design issues.

## Stable

Suitable for production adoption under a published compatibility policy.

Requirements:

- accepted maturity RFC;
- versioned normative specification;
- archived release artifacts;
- compatibility and deprecation policy;
- complete examples and tests;
- documented security contact;
- at least one proven implementation and preferably more than one independent implementation;
- long-term maintainer commitment.

Stable does not mean perfect or permanent. It means changes follow compatibility rules.

## Deprecated

Still available but no longer recommended.

Requirements:

- reason;
- replacement or migration;
- deprecation date;
- planned support end;
- impact on related projects.

## Archived

No active maintenance.

Requirements:

- immutable last version;
- archive reason;
- replacement if any;
- security/support warning;
- preserved docs and source.

## Lifecycle transitions

| Transition | Decision |
|---|---|
| Planned → Experimental | Project steward approval and public record |
| Experimental → Draft | Maintainer recommendation |
| Draft → Candidate | RFC and review |
| Candidate → Stable | Maturity RFC and implementation evidence |
| Stable → Deprecated | RFC |
| Any → Archived | Public decision record; RFC for stable projects |

## Project health metadata

Display separately from maturity:

- Active
- Maintenance
- Paused
- Seeking maintainer
- Archived

A Stable project may be in Maintenance. An Experimental project may be very active.

## Status colors

Colors are supportive only:

- Planned: neutral stone
- Experimental: violet
- Draft: amber
- Candidate: blue
- Stable: sage
- Deprecated: clay
- Archived: charcoal/neutral

Every status includes visible text and accessible descriptions.
