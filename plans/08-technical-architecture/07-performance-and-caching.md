# Performance and Caching

## Performance posture

The public site should feel nearly static. Editorial texture and imagery must not compromise speed.

## Rendering

- statically generate public content;
- import docs before build;
- avoid request-time GitHub access;
- use Server Components;
- minimize client islands;
- do not hydrate article content unnecessarily.

## Images

- responsive Next Image;
- AVIF/WebP;
- explicit aspect ratio;
- priority only for the hero/LCP image;
- lazy load below fold;
- crop and resize at build or image pipeline;
- avoid giant transparent PNG logos where SVG is appropriate.

## Fonts

Use `next/font` to self-host and subset.

Load:

- Bodoni Moda only weights needed;
- Inter variable or selected weights;
- IBM Plex Mono only on pages containing code, if architecture permits.

Prevent layout shift with generated font metrics.

## JavaScript budgets

Public editorial page:

- navigation/search trigger/theme as small islands;
- no client-side content fetching;
- no animation runtime;
- no slider/carousel.

Docs pages:

- search, copy, tabs, selectors, and navigation only;
- lazy-load heavy schema explorer or validator.

## CSS

- Tailwind compilation removes unused utilities;
- design tokens central;
- paper texture through small CSS gradients or one tiny tile;
- avoid per-page duplicated CSS-in-JS runtime.

## Cache layers

### Browser/CDN

- immutable hashed assets: one year;
- HTML: provider-appropriate cache with revalidation/purge on deploy;
- feeds and sitemap: short public cache;
- historical docs: long cache because immutable;
- search static index: content hash.

### Server

Minimal server data exists at launch. Do not add Valkey solely for caching static content.

## Search

- debounce only enough to avoid excess requests;
- request cancellation;
- cache repeated query results briefly in client memory;
- limit body field returned;
- lazy-load static fallback index.

## Measurement

- Lighthouse CI on representative routes;
- Web Vitals in production;
- bundle analysis on pull requests when budgets regress;
- image size report;
- route render-mode report.

## Budget enforcement

Fail CI on large regressions, not tiny noise. Establish a baseline after the first production-like build.
