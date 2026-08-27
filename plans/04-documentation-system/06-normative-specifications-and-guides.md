# Normative Specifications and Guides

## Separation rule

Do not make one document serve simultaneously as a beginner tutorial and a complete normative specification.

The same topic may have:

- a Learn page;
- an implementation Guide;
- Reference pages;
- a normative Specification section.

## Normative language

Adopt RFC 2119/8174-style uppercase requirement words when, and only when, they indicate formal requirements:

- MUST
- MUST NOT
- REQUIRED
- SHALL
- SHALL NOT
- SHOULD
- SHOULD NOT
- RECOMMENDED
- NOT RECOMMENDED
- MAY
- OPTIONAL

Include a boilerplate interpretation section in every normative specification.

## Requirement IDs

Assign stable IDs to important normative requirements:

```text
PNS-DISCOVERY-RESOLUTION-001
PNS-DOCUMENT-METADATA-004
```

Requirements should be searchable and linkable. Do not assign IDs to every sentence.

## Specification structure

1. Status of this document
2. Abstract
3. Conformance and normative language
4. Terminology
5. Scope
6. Non-goals
7. Data model or syntax
8. Processing rules
9. Validation
10. Extension points
11. Versioning and compatibility
12. Security considerations
13. Privacy considerations
14. Accessibility considerations where applicable
15. Internationalization
16. Examples, explicitly informative
17. References
18. Change log

## Informative content

Mark examples, rationale, diagrams, and implementation notes as informative when they are not required for conformance.

## Guide structure

1. Outcome
2. Prerequisites
3. Expected time or complexity when useful
4. Steps
5. Complete example
6. Validation
7. Common problems
8. Next steps
9. Version scope

## Reference structure

Reference pages should be concise and repetitive by design. Use generated tables and exact property paths.

## Specification review

Before Candidate status, require review for:

- internal consistency;
- implementability;
- security;
- privacy;
- internationalization;
- accessibility where relevant;
- examples and conformance tests;
- migration story;
- license and intellectual-property concerns.

## Copy behavior

Normative pages should include:

- copy link to section;
- copy requirement ID;
- raw Markdown link;
- source line link when stable;
- printable styling.
