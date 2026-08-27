# Documentation Product Strategy

## Recommendation

Documentation should be a distinct product experience inside the same Next.js application and domain.

```text
paperandslate.org/docs
```

The public site and docs share:

- brand tokens;
- project registry;
- search index;
- version metadata;
- governance links;
- analytics and observability;
- deployment and preview infrastructure.

The docs experience has its own:

- route group;
- page shell;
- sidebar and table of contents;
- dark mode;
- content loader;
- source provenance;
- version and project selectors;
- code and reference components.

## Documentation goals

1. Help a new implementer understand the ecosystem.
2. Let users adopt one project without learning every project.
3. Separate conceptual learning, implementation guidance, exact reference, and normative specification.
4. Keep docs synchronized with project source.
5. Preserve historical versions.
6. Make unfinished work visibly unfinished.
7. Make source and editing paths transparent.
8. Support machine consumption through Markdown and `llms.txt` outputs.

## Documentation audiences

### Implementer

Needs quick starts, examples, schemas, compatibility rules, error guidance, and tests.

### Domain reviewer

Needs plain-language concepts, examples, privacy implications, and scope boundaries.

### Standards contributor

Needs normative text, RFC links, requirements, change history, and source editing.

### Researcher or data organization

Needs definitions, provenance, identifiers, version archives, and citations.

## Information modes

Every technical topic should be classified into one of four main modes.

### Learn

Purpose: explain concepts and mental models.

Examples:

- What is organization discovery?
- Why preserve provenance?
- How projects relate.

### Guides

Purpose: complete a task.

Examples:

- Publish a discovery manifest.
- Create a lesson document.
- Add a namespace extension.

### Reference

Purpose: look up exact details.

Examples:

- Schema properties.
- Block types.
- Identifier formats.
- CLI commands.

### Specification

Purpose: define normative behavior and conformance.

Examples:

- Discovery resolution algorithm.
- Required document metadata.
- Version negotiation.

Tutorials may combine Learn and Guides but must be labeled clearly.

## Documentation framework recommendation

Use Fumadocs because it composes with Next.js, supports MDX sources, navigation primitives, search integration, OpenAPI generation, and AI-readable outputs. Customize its UI rather than treating the default theme as the final design.

Use:

- `fumadocs-core` for source, page trees, and search structures;
- `fumadocs-mdx` for local and generated MDX;
- `fumadocs-ui` for accessible documentation primitives;
- the OpenAPI integration later;
- generated `llms.txt`, `llms-full.txt`, and page Markdown from launch.

## Source ownership model

### Website repository owns

- ecosystem introduction;
- shared terminology;
- cross-project architecture;
- common versioning and extension policies;
- governance and contribution docs;
- general platform concepts;
- future API/auth overview docs until a platform repo exists.

### Standards monorepo owns

- project concepts;
- project guides;
- normative specifications;
- schemas and field reference;
- examples;
- migration guidance;
- project changelogs.

### Tool repositories own

- package installation;
- library API reference;
- CLI usage;
- implementation-specific guides.

## Launch documentation minimum

The site should not wait for every standard to be complete. Launch when it has:

- ecosystem overview;
- terminology;
- project lifecycle and versioning;
- at least one project with real docs;
- planned/draft landing pages for remaining projects;
- governance and contribution docs;
- source and editing links;
- search and version structure.

## Documentation quality bar

A stable page must have:

- owner;
- version scope;
- last review date;
- valid links;
- no unresolved TODOs;
- normative/informative classification;
- examples tested where possible;
- source commit provenance.
