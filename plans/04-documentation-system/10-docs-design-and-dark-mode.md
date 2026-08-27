# Documentation Design and Dark Mode

## Relationship to the public brand

Documentation should unmistakably belong to Paper & Slate while reducing decorative material.

Keep:

- wordmark;
- paper, slate, ink, and mist palette;
- Bodoni Moda for major page titles;
- Inter for interface and body;
- subtle paper texture in large empty regions;
- image style on docs landing pages.

Reduce:

- large still-life imagery inside reference pages;
- strong linen texture behind prose;
- decorative shadows;
- oversized editorial typography;
- ornamental separators.

## Desktop shell

- global header;
- 240–280 px left sidebar;
- flexible content column;
- 220–250 px right table of contents;
- maximum prose width 760–820 px;
- code blocks may extend wider when useful.

## Mobile shell

- global header;
- docs navigation drawer;
- compact project/version selectors;
- collapsible on-page contents;
- full-width code with horizontal scrolling;
- sticky utility bar only if it does not consume reading space.

## Dark mode

Dark mode is required for documentation and may be available on the public site.

Recommended tokens:

- page: `#101C28`;
- elevated surface: `#172B3D`;
- secondary surface: `#1E3446`;
- border: `#30485B`;
- primary text: `#F7F2E9`;
- secondary text: `#BAC5CC`;
- link/accent: `#A8C0CE`.

Use warm off-white text rather than pure white. Ensure syntax themes meet contrast requirements.

Theme selection:

- respects `prefers-color-scheme` on first visit;
- user choice stored locally;
- no server account required;
- inline boot script prevents flash;
- accessible control label.

## Specification readability

- Body size 16–17 px desktop, 16 px mobile.
- Line height 1.65–1.75.
- Paragraph line length 65–80 characters.
- Requirement keywords receive typographic emphasis but not excessive color.
- Tables wrap or scroll with pinned first column where useful.
- Anchor links have generous hit targets.

## Print

Provide print styles for specifications, policies, and RFCs:

- remove navigation;
- show full URLs in references where useful;
- preserve requirement IDs;
- repeat table headers;
- avoid splitting callouts and code examples badly;
- print version, source SHA, and date in header/footer.
