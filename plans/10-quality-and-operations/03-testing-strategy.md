# Testing Strategy

## Test pyramid

### Static and schema checks

Fastest and broadest:

- TypeScript strict;
- ESLint;
- content schema validation;
- MDX safety validation;
- route collision detection;
- link/anchor validation;
- license and notice checks;
- environment schema validation.

### Unit tests

Cover:

- content loaders;
- project/status logic;
- route generation;
- version selection;
- source registry;
- link rewriting;
- search record normalization;
- newsletter validation;
- feed generation;
- date/scheduled publishing;
- redirect rules.

### Component tests

Cover interactive semantics:

- navigation;
- search dialog;
- selectors;
- tabs;
- accordions;
- code copy;
- newsletter states;
- status badges;
- error/empty states.

### End-to-end tests

Representative flows:

1. Homepage → Project → Docs → Source
2. Search exact schema property
3. Search RFC number
4. Filter project registry
5. Change project version
6. Open mobile navigation
7. Toggle docs theme
8. Submit newsletter success/failure using mocked provider
9. Navigate archived docs
10. Open draft page and verify warning

## Accessibility tests

- axe across template set;
- keyboard flows;
- focus order;
- dialog focus return;
- 200% zoom screenshots/manual;
- reduced motion;
- high contrast where practical.

## Visual regression

Test stable components and representative layouts, not every content page.

Baselines:

- homepage desktop/mobile;
- project index/detail;
- governance;
- news article;
- docs home/page;
- search dialog;
- dark mode;
- status badges;
- code block and callout.

Allow intentional image variation only when media assets are not deterministic.

## Content fixtures

Maintain fixture repositories for ingestion tests:

- valid source;
- duplicate route;
- unsafe MDX import;
- missing image;
- broken anchor;
- historical version;
- malicious path traversal;
- oversized file;
- unsupported component;
- cross-project link.

## Performance tests

- Lighthouse CI;
- bundle budget;
- image weight;
- search response benchmark;
- docs ingestion timing;
- build time trend;
- container startup.

## Security tests

- dependency audit;
- secret scan;
- CSP/header tests;
- newsletter abuse tests;
- unsafe content fixtures;
- SVG sanitization;
- preview noindex;
- no server secrets in client build.

## Browser matrix

Minimum:

- latest Chrome;
- latest Firefox;
- latest Safari;
- iOS Safari current and prior major where feasible;
- Android Chrome;
- Windows high-DPI and keyboard use.

## Test ownership

- component author writes component tests;
- content pipeline changes include fixtures;
- page features include e2e update;
- accessibility failures are owned by the feature team/maintainer, not deferred to a separate auditor.
