# Success Metrics

Metrics should validate comprehension, implementation usefulness, and public trust—not commercial conversion.

## Primary outcomes

### Comprehension

After one homepage visit, a representative user should be able to answer:

- What is Paper & Slate?
- Who is it for?
- What does it build?
- Which work is stable versus experimental?
- Where can they read or contribute?

Target: at least 80% correct in five-user qualitative testing before public launch.

### Documentation effectiveness

Target measures:

- 90% of documentation search sessions produce a click without a refined query.
- Core getting-started guides can be completed without opening GitHub source files.
- Every project page has source, status, version, license, maintainer, and update metadata.
- No stable documentation page has broken internal links.
- Imported docs show a valid source commit SHA.

### Technical quality

Initial budgets:

| Measure | Target |
|---|---|
| Lighthouse Performance, desktop | 95+ |
| Lighthouse Accessibility | 100 where practical; never below 95 |
| Lighthouse Best Practices | 95+ |
| Lighthouse SEO | 100 |
| Largest Contentful Paint, p75 | under 2.5 s |
| Interaction to Next Paint, p75 | under 200 ms |
| Cumulative Layout Shift, p75 | under 0.1 |
| Initial JavaScript on editorial pages | under 110 KB compressed, excluding analytics |
| Search opening latency | under 100 ms perceived |
| Search results, hosted mode | under 300 ms p95 |

### Accessibility

- WCAG 2.2 AA conformance for all public and docs templates.
- Complete keyboard operation.
- No critical axe violations.
- Screen-reader review of header, search, docs navigation, code tabs, accordions, and newsletter form.
- Reduced-motion mode.
- Text remains readable at 200% zoom.

### Reliability

- 99.9% monthly availability target for the public site after launch.
- Synthetic checks for homepage, docs home, project registry, search health, and feeds.
- Deployment rollback documented and tested.
- Content build fails before deployment on invalid stable docs.

## Secondary analytics

Use privacy-conscious analytics. Track:

- homepage-to-project click-through;
- docs entry pages;
- search queries with zero results;
- project and version selector use;
- outbound GitHub and “Edit this page” clicks;
- newsletter submissions;
- RFC page engagement;
- feed subscriptions where observable;
- 404 and broken-link events.

Do not collect invasive user profiles or cross-site advertising identifiers.

## Launch readiness gate

The site is ready for public launch when:

1. The foundation identity and legal wording are accurate.
2. At least three project pages have real status and scope content.
3. The documentation pipeline imports at least one real project source.
4. Governance, RFC, license, security, code of conduct, and contribution policies exist.
5. Search indexes every public content type.
6. Accessibility, link, content, and build checks pass.
7. Preview and production rollback have been tested.
