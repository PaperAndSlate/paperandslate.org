# Media and Image Workflow

## Goals

- consistent editorial identity;
- accessible alternatives;
- efficient delivery;
- clear licensing and source provenance;
- no repository bloat from redundant exports.

## Source files

Store master images in a content-specific source directory. Preserve:

- creator/source;
- license;
- permission;
- capture/generation date;
- alt text draft;
- crop notes;
- whether AI generation was used.

## Image metadata

```yaml
id: file-system-still-life
source: Paper & Slate commissioned artwork
license: Paper & Slate site use
alt: Layered cream document sheets arranged over a slate-blue folder.
decorative: false
focalPoint: [0.55, 0.42]
```

## Delivery

Use Next.js Image with:

- explicit dimensions;
- responsive `sizes`;
- AVIF and WebP where supported;
- lazy loading below the fold;
- stable aspect ratios;
- blur or color placeholder when useful.

## Common ratios

- Homepage hero: 4:3 or 16:10
- Project card: 16:9
- News card: 16:9
- Article cover: 2:1 or 16:9
- Person portrait: 1:1
- Social card: 1200 × 630

## Alt text

Alt text describes relevant information, not visual styling alone.

Decorative texture receives empty alt text. A diagram requires an equivalent text explanation in the page body.

## AI-generated visuals

When AI-generated images are used:

- avoid representing fictional people as real contributors or institutions;
- record provenance internally;
- review text and symbols for errors;
- do not use generated seals, certifications, or adoption claims;
- prefer material still lifes and abstract diagrams.

## Media library decision

Do not provision S3 at launch unless the image collection becomes difficult to manage in Git. The current site can keep optimized media in the repository.

If S3 is introduced later, preserve content-addressed immutable URLs and a local metadata registry.
