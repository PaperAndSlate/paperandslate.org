# Mockup Index

The mockups are implementation references, not pixel-perfect contracts. Build components from tokens and page requirements, then compare the rendered product against the visual intent.

## Page layouts

| File | Layout represented |
|---|---|
| `assets/mockups/01-home-desktop.png` | Public homepage, editorial light theme |
| `assets/mockups/02-foundation-mission.png` | Foundation/mission article and principle layout |
| `assets/mockups/03-projects-index.png` | Project registry with filters and status metadata |
| `assets/mockups/04-project-detail.png` | Project hero, tabs, overview, metadata rail, code example |
| `assets/mockups/05-governance.png` | Governance index, process panel, RFC registry |
| `assets/mockups/06-news-index.png` | News categories and article-card system |
| `assets/mockups/07-news-article.png` | Long-form editorial article with context rail |
| `assets/mockups/08-docs-home.png` | Documentation portal with sidebar and contextual rail |
| `assets/mockups/09-docs-reference-page.png` | Documentation reference/specification page |
| `assets/mockups/10-global-search-overlay.png` | Unified command search |
| `assets/mockups/11-component-library.png` | Buttons, status, forms, callouts, cards, code, navigation, states |
| `assets/mockups/12-dark-mode-home.png` | Public dark-theme treatment |
| `assets/mockups/13-home-mobile.png` | Mobile homepage layout |

## Brand material

| File | Purpose |
|---|---|
| `assets/brand/paper-and-slate-brand-board.png` | Complete visual brand overview |
| `assets/generated-concepts/concept-board-01.png` | AI-generated direction board |
| `assets/generated-concepts/concept-board-02.png` | AI-generated layout and brand exploration |

## Mockup source

The static HTML/CSS source used for deterministic mockup rendering is preserved in:

```text
assets/mockups/source/
```

It is not the recommended production application source. It exists to communicate layout, typography, components, and responsive intent with exact readable text.

## Logo assets

See `assets/logos/logo-manifest.json` and `07-design-system/01-brand-guide.md`.

## Implementation review process

For each production template:

1. Review its mockup.
2. Review the corresponding page specification.
3. Build with shared tokens and components.
4. Validate responsive behavior.
5. Compare at 1440, 1024, 768, and 390 px.
6. Check dark mode where applicable.
7. Run accessibility and performance tests.
8. Prefer improved usability over literal mockup replication.
