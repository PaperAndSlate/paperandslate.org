# Accessibility Plan

## Standard

Target WCAG 2.2 AA for every public and documentation template.

Accessibility is a release requirement, not a final audit task.

## Semantic structure

- one primary `main` landmark;
- meaningful header, nav, aside, article, and footer landmarks;
- one page-level `h1`;
- logical heading hierarchy;
- lists for lists;
- tables only for tabular data;
- buttons for actions and links for navigation;
- descriptive document titles.

## Keyboard

Test complete flows without a pointer:

- global navigation;
- mobile menu;
- global search;
- project filters;
- documentation sidebar;
- project/version selector;
- table of contents;
- tabs and accordions;
- code copy;
- newsletter form;
- dialogs and drawers.

Focus indicators must remain visible on paper, white, slate, and dark surfaces.

## Search dialog

- accessible dialog name;
- focus moves into input;
- arrow-key result navigation;
- active descendant or roving focus implemented correctly;
- Escape closes;
- focus returns to trigger;
- result count announced without excessive chatter.

## Documentation navigation

- sidebar has a label;
- current page uses `aria-current="page"`;
- collapsed groups expose state;
- version changes explain navigation consequence;
- mobile drawer traps focus;
- table of contents has a clear heading.

## Code

- code remains selectable;
- copy button has an accessible name and success announcement;
- tabs are real tab semantics only when behavior matches;
- line numbers are not included in copied text by default;
- syntax color is not the only semantic indicator;
- long code scrolls horizontally without moving the whole page.

## Images and diagrams

- informative images have useful alt text;
- decorative linen texture uses empty alt;
- diagrams include a textual equivalent;
- captions identify source/license when relevant;
- no text baked into images when it must be read.

## Color and contrast

- normal text 4.5:1 minimum;
- large text 3:1 minimum;
- UI components and focus indicators meet non-text contrast requirements;
- statuses use text and shape, not color alone;
- texture is included in contrast testing.

## Motion

Honor `prefers-reduced-motion`:

- disable smooth scrolling if problematic;
- remove decorative transitions;
- no parallax;
- no auto-playing animation;
- keep necessary progress feedback.

## Zoom and reflow

Test:

- 200% browser zoom;
- 320 CSS px viewport width;
- mobile landscape;
- increased text spacing;
- long project names and translations.

## Forms

- visible labels;
- clear required state;
- errors connected with `aria-describedby`;
- summary and inline errors;
- no placeholder-only labels;
- consent checkbox for newsletter;
- success announced and focus managed.

## Testing layers

1. ESLint/accessibility linting
2. Component tests
3. axe in Playwright
4. keyboard smoke tests
5. screen-reader manual testing
6. contrast review
7. public accessibility statement and contact

Recommended manual screen readers:

- VoiceOver + Safari on macOS/iOS;
- NVDA + Firefox or Chrome on Windows.

## Release blockers

- critical axe issue;
- inaccessible navigation/search;
- missing form labels;
- keyboard trap;
- unreadable status/contrast;
- major reflow failure;
- missing alternative for a required diagram.
