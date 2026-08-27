# Homepage Specification

## Purpose

The homepage must establish Paper & Slate as a credible open infrastructure foundation and route technical users quickly to projects and documentation.

It is not a generic nonprofit homepage and must not lead with donations, founder biography, or vague values.

## Primary user questions

1. What is Paper & Slate?
2. What does it build?
3. Is the work open?
4. Which projects exist and how mature are they?
5. Where are the technical docs and source?
6. How can I follow or contribute?

## Recommended hero

Eyebrow:

> Open educational infrastructure

Headline:

> Common infrastructure education has been missing.

Supporting copy:

> Paper & Slate builds open standards, formats, schemas, and tools that help education software and schools work together—for everyone.

Primary action:

> Explore projects

Secondary action:

> Read our mission

Optional tertiary text link:

> Browse documentation

The hero image should be a restrained still life using paper, slate, linen, a notebook, diagrams, or writing tools. It should not show smiling stock-photo students.

## Audience strip

A quiet credibility strip may list who the work is for:

- Developers
- Educators
- Schools
- Districts
- Researchers
- Government

Do not say “trusted by” until actual organizations have endorsed or implemented the work. Use “Built with the education community” or “Designed for.”

## Projects section

Heading:

> Open building blocks for connected education.

At launch, show up to six image-led project cards. Recommended order:

1. File System
2. `.well-known` Discovery
3. Organization Schema
4. Curriculum Standards Schema
5. Course and Catalog Schema
6. Tools and Libraries

Each card includes:

- image;
- project type;
- descriptive project name;
- one-sentence purpose;
- maturity badge;
- link.

Do not number projects as if their sequence is normative.

## Mission and principles panel

Use a dark slate panel to create hierarchy.

Lead:

> Built in the open. Guided by clear principles.

Feature three or four principles only:

- Open by default
- Vendor neutral
- Interoperable
- Education first

Link to the full Principles page.

## News and updates

Display a mixed set of:

- foundation announcement;
- RFC notice;
- release or project update.

Each card shows its content type, date, title, summary, and related project.

## Newsletter

Use a low-pressure subscription block:

> Updates on standards, RFCs, releases, and foundation news.

The form submits to a same-origin server route that forwards to Kit. Until configured, either hide the form or show a non-interactive “subscriptions opening soon” state. Never expose Kit credentials.

## Footer

The footer should reinforce that this is a public institution-like project:

- mission sentence;
- Foundation links;
- Projects links;
- Resources links;
- Community links;
- licensing and legal links.

## Responsive behavior

### Tablet

- Hero stacks if text becomes narrower than 520 px.
- Project grid becomes two columns.
- Mission panel becomes two rows.
- Audience strip becomes horizontally scrollable with visible affordance.

### Mobile

- Headline target: 42–48 px.
- Hero image follows actions.
- Cards become one column.
- Footer groups use accordions or a two-column layout.
- Avoid full-viewport animated hero effects.

## Performance constraints

- Hero image should be AVIF/WebP with an explicit responsive size.
- Do not load project images below the fold eagerly.
- Most of the page should be Server Components.
- Newsletter is the only required interactive island besides navigation and search.
- Do not ship a carousel library.

## Acceptance criteria

- Project statuses are visible without opening a card.
- The first viewport communicates “open educational infrastructure.”
- Documentation is reachable in one interaction.
- No copy implies current adoption, nonprofit registration, or finished standards without evidence.
- The page remains complete with JavaScript disabled, except search and newsletter submission.
