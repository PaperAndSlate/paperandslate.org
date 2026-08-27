# Responsive and Layout System

## Breakpoints

Prefer content-driven breakpoints rather than device names. Suggested Tailwind baseline:

```text
sm  640px
md  768px
lg  1024px
xl  1280px
2xl 1536px
```

## Public header

### Under 1024 px

- hide desktop nav;
- show search and menu;
- use a compact logo;
- keep a minimum 44 px target size.

### Desktop

- 80–88 px height;
- wordmark left;
- nav centered/right;
- search and GitHub right.

## Homepage hero

- two columns above approximately 980 px;
- one column below;
- text first in DOM and visual order;
- hero image maintains a stable aspect ratio;
- buttons wrap rather than shrink.

## Project grids

- 3 columns at wide desktop;
- 2 columns at tablet;
- 1 column mobile.

Do not reduce card text below readable sizes to preserve columns.

## Docs layout

### Wide desktop

```text
sidebar 260px | content minmax(0, 1fr) | toc 230px
```

### Medium desktop

- hide right TOC into an in-page disclosure;
- sidebar remains.

### Tablet/mobile

- sidebar becomes sheet/dialog;
- project and version selectors remain near page title;
- prose uses full width with 20–24 px padding;
- wide tables and code scroll inside their own container.

## Article layout

- content 720–780 px;
- right related/share rail only above 1100 px;
- rail moves below article on smaller screens.

## Registry tables

Tables must have a mobile alternative:

- transform rows into cards; or
- retain horizontal scrolling with the identity column sticky.

Choose based on data density. RFC registry benefits from card rows on mobile.

## Touch and zoom

- minimum target 44 × 44 CSS px for primary controls;
- no hover-only disclosure;
- no fixed element covering content at 200% zoom;
- search and navigation remain usable in landscape mobile.

## Container queries

Use container queries for cards and embedded documentation components when they improve reuse, but do not use them simply because they are available.

## Mockups

- Desktop homepage: `assets/mockups/01-home-desktop.png`
- Mobile homepage: `assets/mockups/13-home-mobile.png`
- Documentation desktop: `assets/mockups/08-docs-home.png`
