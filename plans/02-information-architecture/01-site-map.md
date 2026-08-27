# Public Site Map

## Primary navigation

```text
Foundation · Projects · Documentation · Governance · News & Updates
```

Persistent utilities:

```text
Search · GitHub · Theme (docs) · Get involved (when contribution paths are ready)
```

## Full route tree

```text
/
├── foundation
│   ├── mission
│   ├── principles
│   ├── people
│   ├── funding
│   ├── roadmap
│   ├── reports
│   │   └── [year]
│   └── contact
├── projects
│   └── [project-slug]
│       ├── overview                 canonical project landing page
│       ├── releases
│       └── adoption                optional, only with real implementations
├── docs
│   ├── getting-started
│   ├── concepts
│   ├── [project-slug]
│   │   ├── [latest content]
│   │   ├── next
│   │   └── v
│   │       └── [version]
│   ├── guides
│   ├── reference
│   ├── tools
│   ├── governance
│   └── developer-platform          reserved; hidden until ready
├── governance
│   ├── charter
│   ├── model
│   ├── maintainers
│   ├── rfcs
│   │   └── [rfc-number]
│   ├── decisions
│   │   └── [decision-id]
│   ├── contributing
│   ├── code-of-conduct
│   ├── security
│   ├── conflicts
│   ├── trademarks
│   └── licenses
├── news
│   ├── [slug]
│   ├── category
│   │   └── [category]
│   └── tag
│       └── [tag]
├── search
├── accessibility
├── privacy
├── terms
├── status                          external or redirect when service exists
├── feeds
│   ├── rss.xml
│   ├── atom.xml
│   └── feed.json
├── sitemap.xml
├── robots.txt
├── llms.txt
└── llms-full.txt
```

## Homepage information hierarchy

1. Brand and primary navigation
2. Positioning statement
3. Plain-language explanation
4. Primary actions: Explore projects and Read our mission
5. Audience/trust strip
6. Featured projects with image-led cards
7. Mission and principles panel
8. Latest news, RFCs, and releases
9. Newsletter
10. Footer and legal identity

## Foundation information hierarchy

The Foundation landing page acts as an index and narrative overview. It should not duplicate every subpage.

Recommended card order:

1. Mission
2. Principles
3. People
4. Governance
5. Funding
6. Roadmap
7. Reports
8. Contact

## Projects information hierarchy

The Projects index is a public registry, not merely a visual portfolio.

Required controls:

- type filter;
- maturity filter;
- current versus archived;
- text search;
- optional dependency filter later.

Required metadata on cards and list rows:

- project name;
- one-sentence purpose;
- project type;
- maturity;
- current version or “unreleased”;
- last meaningful update;
- direct link to docs.

## Documentation information hierarchy

```text
Documentation
├── Getting started
├── Core concepts
├── Standards
│   ├── File System
│   ├── Discovery
│   ├── Organization Schema
│   ├── Course and Catalog Schema
│   └── Curriculum Standards Schema
├── Tools and libraries
├── Implementation guides
├── Reference
├── Governance and community
└── Developer Platform (future)
```

## Governance information hierarchy

The public Governance landing page should present a structured overview. Normative governance source files remain in Git and are rendered into pages.

Top-level sections:

- Charter and mission
- Principles
- Current decision model
- Founder and maintainer authority
- Future committee transition
- RFC process
- Decision records
- Contribution process
- Funding and conflicts
- Code of conduct
- Security
- Licenses and trademarks

## News content types

All content appears under News & Updates but retains a type:

- Announcement
- Release
- Project update
- RFC notice
- Governance decision
- Community story
- Implementation story
- Research note
- Annual report

## Utility content

Do not hide utility pages until launch week. Accessibility, privacy, security, trademark, license, and contact routes are trust-bearing parts of the product.
