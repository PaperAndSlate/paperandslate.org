# Navigation and Wayfinding

## Header

### Desktop

Left:

- horizontal Paper & Slate logo linking to `/`.

Center/right:

- Foundation
- Projects
- Documentation
- Governance
- News & Updates

Utilities:

- search icon and keyboard hint;
- GitHub action;
- optional theme switch visible primarily inside docs.

### Mobile

Use:

- compact horizontal mark or icon plus wordmark;
- search action;
- menu button;
- full-height sheet menu with primary links, project shortcuts, GitHub, theme, and legal links.

The mobile menu must be a proper dialog with focus trapping, close on Escape, and restored trigger focus.

## Active states

- Public navigation uses a restrained underline or bottom border.
- Documentation additionally highlights the current sidebar item and ancestor groups.
- Search results identify content type, project, status, and version.
- Color is not the only active indicator.

## Breadcrumbs

Use breadcrumbs on:

- project detail pages below the hero only when nested;
- documentation pages;
- RFCs;
- decision records;
- annual reports;
- tagged news archives.

Do not use breadcrumbs on the homepage, primary landing pages, or simple news articles unless the route is deeply nested.

Example:

```text
Documentation › Discovery › Specification › Manifest fields
```

## Project switcher

Documentation should have a project selector separate from its version selector.

The project selector shows:

- icon or short mark;
- project name;
- maturity;
- current version;
- optional dependency indicator.

Do not create one global version selector for the entire ecosystem.

## Version selector

The selector is scoped to the current project and includes:

- Latest stable
- Next / Draft
- Supported historical versions
- Archived versions behind a secondary disclosure

When no stable version exists, the default item is “Current draft,” not “Latest stable.”

## In-page table of contents

Desktop:

- sticky right rail;
- generated from `h2` and selected `h3` headings;
- highlights the current section;
- includes page actions after the contents: Edit, View source, Report issue.

Mobile:

- collapsed “On this page” disclosure near the title;
- not a permanently fixed overlay.

## Previous and next navigation

Documentation pages use explicit previous/next links based on the project page tree. They must not cross project boundaries unexpectedly.

RFC and news articles may use related-content cards rather than strict previous/next ordering.

## Footer

Columns:

- brand and mission sentence;
- Foundation;
- Projects;
- Resources;
- Community.

Footer utilities:

- Privacy
- Terms
- Trademark
- Accessibility
- Security
- RSS
- GitHub

## Search as wayfinding

Search is available from every page with `Cmd/Ctrl + K`.

Result groups:

1. Best matches
2. Documentation
3. Projects
4. RFCs and governance
5. News & Updates
6. Schema fields

Each result includes a breadcrumb-like context string. Exact schema properties and RFC numbers receive a ranking boost.

## Cross-link rules

Every project landing page links to:

- documentation;
- source repository;
- changelog or releases;
- current RFCs;
- maintainers;
- license.

Every technical documentation root links back to its public project page.

Every RFC links to affected projects and superseded RFCs.

Every release announcement links to the changelog and versioned docs.
