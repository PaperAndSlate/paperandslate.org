# Scope and Non-Goals

## Included in the first complete build

### Public foundation experience

- Homepage
- Foundation overview
- Mission
- Principles
- People and maintainers
- Governance overview
- Governance model
- Charter
- Funding and independence
- Public roadmap
- Annual reports archive and report template
- Contact
- Project registry
- Project detail pages
- News & Updates index
- News article pages
- Release and RFC announcement variants
- RSS, Atom, and JSON feeds
- Newsletter form integration point
- Legal and trust pages
- Search
- Responsive navigation and footer
- 404, error, maintenance, and empty states

### Documentation system

- Documentation home
- Getting-started path
- Ecosystem overview and terminology
- Project-owned documentation ingestion
- Version and maturity selectors
- Learn, Guides, Reference, and Specification modes
- Code blocks and code tabs
- Callouts and normative requirement styling
- Schema/property reference pages
- Edit-on-GitHub and source provenance
- Link validation
- Unified search
- Dark mode
- `llms.txt`, `llms-full.txt`, and per-page Markdown output
- Reserved OpenAPI integration capability

### Governance system

- Project lifecycle
- RFC lifecycle and templates
- Decision records
- Maintainer roles
- Contribution model
- Security policy
- Code of conduct
- Trademark and licensing policy

### Engineering foundation

- Next.js monorepo
- Design tokens and component library
- Validated content schemas
- CI/CD
- Tower development deployment
- Preview environments
- Accessibility and performance tests
- Observability
- SEO and generated social images

## Explicit non-goals

The first build must not expand to include:

- authentication or account creation;
- API keys;
- public education-data APIs;
- organization claiming or verification;
- an admin dashboard;
- paid memberships, billing, donations, or ecommerce;
- a database-backed CMS;
- user comments or public profiles;
- discussion forums embedded in the site;
- production validators requiring persistent storage;
- live school-data browsing;
- a complex microservice architecture;
- localization of all content at launch;
- implementing every planned standard before the site can launch.

## Architecture-only future accommodation

The following should have extension points but no launch implementation:

- OpenAPI-generated API reference;
- API authentication documentation;
- SDK language tabs;
- account and console navigation;
- interactive validators;
- schema visualizers;
- school-domain discovery checks;
- multilingual content routing;
- organization verification;
- external contributor author profiles.

## Content completeness standard

A page may be implemented but hidden from navigation when authoritative content is not ready. Hidden pages must not ship with generic lorem ipsum or invented governance facts.

Use one of three approaches:

1. Publish a complete page.
2. Publish a clearly labeled “planned work” page with useful scope and status.
3. Keep the route disabled until content is ready.

Do not publish empty institutional pages merely to make Paper & Slate appear larger.
