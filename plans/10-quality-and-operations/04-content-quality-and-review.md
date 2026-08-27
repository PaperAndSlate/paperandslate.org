# Content Quality and Review

## Quality dimensions

- factual accuracy;
- scope clarity;
- version accuracy;
- normative consistency;
- technical implementability;
- educational realism;
- accessibility;
- security/privacy completeness;
- link integrity;
- editorial readability.

## Review metadata

Important docs include:

```yaml
lastReviewed: 2026-08-26
reviewBy: 2027-02-26
owner: file-system-maintainers
```

Review dates do not imply the content changed. Keep publication/update dates separate.

## Automated checks

- frontmatter schema;
- spelling with domain dictionary;
- duplicate headings;
- invalid requirement keywords;
- unresolved TODO/FIXME in published content;
- broken links and anchors;
- missing alt text;
- missing source metadata;
- stale review dates;
- inconsistent project names/status;
- code examples compiled or validated where practical.

## Domain dictionary

Include:

- Paper & Slate project names;
- education terms;
- standards terminology;
- technology names;
- geographic spelling variants intentionally supported.

Do not automatically “correct” `.well-known`, namespaced fields, or identifiers.

## Editorial review by content type

### News

Founder/editor review and fact check.

### Guides

Technical reviewer plus task completion test.

### Specification

Maintainer review, implementation evidence, security/privacy review, and RFC process where material.

### Governance policy

Founder/governance review and legal review where appropriate.

### Education scenarios

Educator/domain review before Candidate status.

## Staleness

Generate monthly reports for:

- passed `reviewBy`;
- source changed since last review;
- project status/version mismatch;
- unsupported version still prominent;
- high traffic with stale review;
- zero-result searches indicating missing content.

## Style enforcement

Automated style tools may flag:

- very long sentences;
- passive voice concentration;
- undefined acronyms;
- heading jumps;
- vague link text;
- sales language;
- casual normative “should.”

These should inform human review rather than blindly rewrite technical text.

## Correction policy

- editorial corrections visible when material;
- specification releases immutable;
- draft specs can change through Git but maintain changelog after public review begins;
- withdrawn content retains a public record.
