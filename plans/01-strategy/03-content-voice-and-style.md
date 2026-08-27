# Content Voice and Style

## Voice

Paper & Slate should sound:

- calm;
- precise;
- technically credible;
- public-minded;
- educationally informed;
- direct without being severe;
- optimistic without hype.

It should not sound:

- sales-led;
- revolutionary for its own sake;
- like a venture-backed SaaS landing page;
- bureaucratic or committee-written;
- patronizing toward educators;
- hostile toward existing vendors;
- certain about work that is still experimental.

## Editorial principles

### Lead with the problem and public value

Prefer:

> School information is published in thousands of incompatible shapes. Discovery defines a predictable public location and common structure.

Avoid:

> Our cutting-edge discovery solution revolutionizes school data.

### Use explicit maturity language

Prefer:

> This draft is open for implementation feedback and may contain breaking changes.

Avoid:

> Ready for the future of education.

### Distinguish normative and explanatory language

- Specifications use MUST, MUST NOT, SHOULD, SHOULD NOT, and MAY deliberately.
- Guides use direct instructions.
- Editorial content uses ordinary prose.
- Never use “should” casually inside a normative specification.

### Respect education-domain expertise

Do not describe educators or schools as resistant to innovation. Describe real constraints: limited time, procurement, privacy obligations, accessibility, legacy systems, staff capacity, and long retention periods.

## Naming conventions

### Brand

- Correct: Paper & Slate
- Incorrect: Paper and Slate
- Machine slug: `paper-and-slate`

### Projects

Use descriptive names:

- Paper & Slate File System
- `.well-known` Education Discovery
- Educational Organization Schema
- Course and Catalog Schema
- Curriculum Standards Schema

After the first full reference on a page, shorter forms are acceptable:

- File System
- Discovery
- Organization Schema
- Course Schema
- Standards Schema

### Status

Capitalize maturity names when they are formal labels:

- Experimental
- Draft
- Candidate
- Stable
- Deprecated
- Archived

## Sentence and formatting guidance

- Prefer sentences under 28 words in guides.
- Use active voice unless the actor is unimportant.
- Define acronyms on first use.
- Use sentence case for interface labels and headings.
- Use title case only for formal project and document names.
- Use Oxford commas.
- Write dates as “August 25, 2026” in editorial pages and ISO 8601 in machine metadata.
- Use backticks for filenames, paths, fields, identifiers, and literal values.
- Use code blocks for complete examples, not decorative fragments.

## Standard page opening pattern

1. One-sentence definition.
2. Maturity and version.
3. Problem addressed.
4. Scope and non-goals.
5. Quick example.
6. Links to specification, schema, examples, and source.

## Calls to action

Preferred:

- Explore projects
- Read the specification
- View examples
- Browse documentation
- Review the RFC
- Contribute on GitHub
- Follow updates

Avoid:

- Get started free
- Unlock access
- Supercharge your school
- Join the revolution
- Book a demo

## Error messages

Error messages should explain:

1. what happened;
2. what the user can do;
3. whether anything was saved;
4. where to report a persistent issue.

Example:

> The documentation source could not be loaded. The last published version is still available. Try again, or report the source repository and page URL if the problem continues.
