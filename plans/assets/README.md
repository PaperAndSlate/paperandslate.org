# Asset Guide

## Logos

`logos/` contains transparent SVG and PNG exports. SVG artwork has text converted to paths so the logo does not depend on installed fonts.

Use `*-dark` on light Paper/White Paper backgrounds and `*-light` on Foundation Ink/dark backgrounds.

## Brand

`brand/paper-and-slate-brand-board.png` is the complete visual overview. The HTML source is included only as a deterministic construction reference.

## Mockups

`mockups/` contains representative page and component mockups. `mockups/source/` contains the static HTML/CSS used to render them. It is not intended as production code.

`mockups/media/` contains visual direction images used inside the mockups.

## Generated concepts

`generated-concepts/` contains AI-generated visual explorations. They are references, not exact UI specifications.

## Production use

Before using any raster mockup media in production:

- confirm the intended license and provenance;
- generate optimized AVIF/WebP variants;
- add alt text metadata;
- verify crop behavior;
- do not use a mockup screenshot as the actual website.
