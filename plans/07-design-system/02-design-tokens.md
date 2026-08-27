# Design Tokens

## Token strategy

Use semantic CSS variables and map them into Tailwind utilities. Components should not hard-code raw palette values except inside the token definition layer.

## Light theme

```css
:root {
  --background: 40 35% 94%;            /* Paper */
  --foreground: 211 38% 15%;           /* Foundation Ink */
  --surface: 40 100% 99%;              /* White Paper */
  --surface-muted: 38 29% 90%;          /* Linen */
  --primary: 211 38% 15%;
  --primary-foreground: 40 100% 99%;
  --secondary: 204 29% 35%;             /* Slate */
  --secondary-foreground: 40 100% 99%;
  --accent: 202 22% 47%;
  --accent-muted: 195 24% 92%;
  --border: 36 16% 81%;
  --muted-foreground: 205 7% 46%;
  --focus-ring: 202 30% 48%;
  --success: 151 12% 51%;
  --warning: 36 59% 60%;
  --danger: 8 34% 59%;
  --experimental: 249 12% 52%;
}
```

Production should use OKLCH if the selected Tailwind/shadcn version is standardized on it. Preserve semantic names regardless of color format.

## Dark theme

```css
.dark {
  --background: 210 43% 11%;
  --foreground: 40 35% 94%;
  --surface: 207 42% 16%;
  --surface-muted: 205 40% 20%;
  --primary: 40 35% 94%;
  --primary-foreground: 211 38% 15%;
  --secondary: 201 24% 70%;
  --border: 203 28% 27%;
  --muted-foreground: 202 11% 75%;
  --focus-ring: 200 37% 72%;
}
```

## Typography scale

Use fluid `clamp()` values for editorial display and fixed/rem-based interface sizes.

| Token | Suggested value |
|---|---|
| Display XL | `clamp(3.5rem, 7vw, 6.5rem)` |
| Display L | `clamp(3rem, 5.5vw, 5rem)` |
| H1 | `clamp(2.7rem, 4.5vw, 4rem)` |
| H2 | `clamp(2.1rem, 3vw, 3rem)` |
| H3 | `clamp(1.55rem, 2vw, 2rem)` |
| Body L | `1.125rem / 1.65` |
| Body | `1rem / 1.65` |
| Body S | `0.875rem / 1.55` |
| Label | `0.75rem / 1.3` |
| Eyebrow | `0.6875rem`, tracked uppercase |
| Code | `0.875rem / 1.65` |

## Spacing

Use a 4 px base scale with editorial additions:

```text
1  = 4px
2  = 8px
3  = 12px
4  = 16px
5  = 20px
6  = 24px
8  = 32px
10 = 40px
12 = 48px
16 = 64px
20 = 80px
24 = 96px
32 = 128px
```

## Radius

- controls: 8–10 px;
- cards: 12–16 px;
- large editorial panels: 20–24 px;
- badges: full pill;
- code blocks: 12–14 px.

Avoid excessive rounded “bubble” UI.

## Shadows

Use shadows rarely:

- card resting: none or very subtle;
- hero still life: medium soft shadow;
- modal/search dialog: strong elevation;
- dark panels: no shadow needed.

## Layout

- editorial max width: 1240 px;
- wide max width: 1360 px;
- docs prose: 760–820 px;
- article prose: 720–780 px;
- header: 80–88 px desktop;
- content side padding: 24 px mobile, 32 px tablet, 48–64 px desktop.

## Motion

- duration: 120–220 ms for interface feedback;
- easing: standard ease-out;
- no large parallax;
- no continuous decorative animation;
- disable nonessential motion under `prefers-reduced-motion`.
