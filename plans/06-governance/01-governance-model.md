# Governance Model

## Current model

Paper & Slate begins with founder stewardship and named project maintainers.

### Founder and Steward

The founder currently has final authority over:

- foundation mission and scope;
- appointment and removal of maintainers;
- acceptance or rejection of material RFCs;
- legal, trademark, and security decisions;
- creation or archive of projects;
- governance amendments.

This authority should be stated plainly rather than hidden behind informal consensus language.

### Project Maintainers

Maintainers have delegated authority over a defined project or area:

- triage issues;
- review changes;
- merge routine contributions;
- prepare releases;
- enforce project quality;
- sponsor RFCs;
- maintain documentation;
- escalate material or cross-project decisions.

Maintainers do not own project intellectual property personally and cannot grant private exceptions to public specifications.

### Contributors

Contributors may propose changes through issues, discussions, pull requests, examples, implementations, research, testing, education review, accessibility review, or documentation.

Contribution does not automatically grant governance authority, but sustained contribution can lead to maintainer nomination.

## Decision classes

### Routine project decision

Examples:

- wording clarification;
- non-normative example correction;
- internal tooling update;
- patch release;
- documentation navigation improvement.

Decision: project maintainer review under normal pull-request process.

### Material project decision

Examples:

- new normative behavior;
- breaking schema change;
- extension model change;
- maturity transition to Candidate or Stable;
- deprecation;
- conformance requirement.

Decision: public RFC, maintainer recommendation, founder decision during current governance phase.

### Foundation-wide decision

Examples:

- governance amendment;
- new project creation;
- licensing change;
- trademark policy;
- cross-project identifier rules;
- nonprofit incorporation;
- technical steering committee creation.

Decision: public proposal and founder decision, with documented rationale.

### Emergency decision

Examples:

- critical security issue;
- malicious package or compromised credential;
- illegal content;
- urgent rollback.

Temporary confidential action may occur. Publish a post-incident record when safe.

## Consensus

Consensus is desirable but not a fiction. A decision record should identify:

- evidence considered;
- material objections;
- whether objections were resolved;
- the actual decision maker;
- consequences and review date.

## Future committee transition

Create a Technical Steering Committee only after:

- at least three active maintainers beyond the founder;
- multiple projects have sustained implementation activity;
- contribution and conflict processes have been exercised;
- there is a realistic pool of independent representatives;
- legal and operational responsibilities are understood.

### Proposed future committee responsibilities

- technical strategy;
- cross-project consistency;
- RFC acceptance;
- maintainer appointment;
- project lifecycle transitions;
- annual governance review.

The founder may retain narrowly defined reserve powers during an initial transition, but they must be public and time-bounded.

## Governance amendment

Material governance changes require:

1. a governance RFC;
2. at least 30 days of public review unless urgent;
3. a decision record;
4. versioned governance documents;
5. a News & Updates notice.

## Conflicts of interest

Decision participants disclose:

- employment or ownership related to affected implementations;
- financial sponsorship;
- personal projects that gain special advantage;
- close relationships creating material bias.

Disclosure does not always require recusal. The decision record should state how the conflict was handled.
