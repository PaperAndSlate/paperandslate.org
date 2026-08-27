# Paper & Slate visual and Lighthouse evidence plan

Date: 2026-08-27  
Status: current captures are diagnostic only; production visual approval is pending

This plan is the visual subset of [`RELEASE_EVIDENCE_HANDOFF.md`](../RELEASE_EVIDENCE_HANDOFF.md). It separates deterministic work Codex can perform from visual, media, and launch decisions that require owner or qualified-reviewer approval.

## Current references and captures

Supplied visual references:

- `plans/assets/mockups/01-home-desktop.png`
- `plans/assets/mockups/02-foundation-mission.png`
- `plans/assets/mockups/03-projects-index.png`
- `plans/assets/mockups/04-project-detail.png`
- `plans/assets/mockups/05-governance.png`
- `plans/assets/mockups/06-news-index.png`
- `plans/assets/mockups/07-news-article.png`
- `plans/assets/mockups/08-docs-home.png`
- `plans/assets/mockups/09-docs-reference-page.png`
- `plans/assets/mockups/10-global-search-overlay.png`
- `plans/assets/mockups/12-dark-mode-home.png`
- `plans/assets/mockups/13-home-mobile.png`
- matching source markup under `plans/assets/mockups/source/`

Current RC snapshots:

- `tests/browser/snapshots/rc-home-light-desktop.png`
- `tests/browser/snapshots/rc-home-dark-desktop.png`
- `tests/browser/snapshots/rc-home-mobile.png`
- `tests/browser/snapshots/rc-projects-registry.png`
- `tests/browser/snapshots/rc-docs-detail.png`
- `tests/browser/snapshots/rc-search-overlay.png`

The six RC tests pass, but the captures were made against the development server. They include the Next development indicator and a light-mode `1 Issue` overlay. Playwright also logs a screenshot-time hydration mismatch associated with caret hiding on inputs. Existing legacy homepage snapshots remain unchanged and are historical comparison material, not a release pass.

## Route/state matrix

| Surface                    | Required states                                               | Reference/current evidence                               | Approval needed                                   |
| -------------------------- | ------------------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------- |
| Homepage                   | desktop light, desktop dark, 390 px mobile, system theme      | `01`, `12`, `13`; three RC homepage captures             | owner visual signoff; media/rights signoff        |
| Foundation/mission         | desktop and mobile, long-copy reflow                          | `02`; no clean RC capture yet                            | owner and factual approval                        |
| Projects index             | filters, empty state, list/grid, mobile                       | `03`; `rc-projects-registry`                             | owner approval of select-vs-pill and data density |
| Project detail             | metadata, provenance, media, no-adoption-data state           | `04`; no clean RC capture yet                            | factual, media, license approval                  |
| Governance                 | navigation, policy links, long copy                           | `05`; no clean RC capture yet                            | legal/trademark/factual approval                  |
| News index/article         | one/multiple cards, article metadata, correction state        | `06`, `07`; current content has one reviewed news record | editorial/factual/media approval                  |
| Docs home                  | project selector, taxonomy, version/index links               | `08`; no clean RC capture yet                            | documentation owner approval                      |
| Docs detail                | code/table/link/image, source metadata, raw action, prev/next | `09`; `rc-docs-detail`                                   | documentation/source approval                     |
| Search overlay             | open, query results, no results, keyboard/escape, mobile      | `10`; `rc-search-overlay`                                | accessibility and owner approval                  |
| Error/legal surfaces       | 404, error, privacy, terms, security                          | no clean RC capture yet                                  | legal/privacy/security approval                   |
| Newsletter/provider states | disabled, validation error, success, duplicate, failure       | no clean RC capture yet                                  | privacy/consent and provider approval             |

## Observed visual deviations to approve or revise

The current implementation is recognizably aligned with the supplied editorial paper/slate system, but it is not a pixel-equivalent copy of every reference:

- the homepage currently has one reviewed news card while the reference shows three;
- project filters are select controls rather than the reference pill treatment;
- the documentation detail layout/content is a sparse central provenance article with a long taxonomy/sidebar, while the reference emphasizes a fuller file-system/reference page;
- media carries a rights-review-pending treatment and cannot be treated as approved publication artwork yet.

These are review items, not silent baseline-update instructions. The owner must either approve each deviation with a rationale or authorize a later implementation change.

## Codex execution plan after authority

1. Build the reviewed app in standalone production mode and serve the exact artifact on an isolated loopback/staging host.
2. Disable development indicators, overlays, debug panels, extensions, and non-deterministic analytics.
3. Set browser/version, viewport, locale, timezone, color scheme, reduced-motion setting, font readiness, fixture data, and commit SHA.
4. Wait for hydration, web fonts, images, and network-idle/route readiness; fail on console/runtime/CSP errors.
5. Capture every route/state in the matrix at agreed desktop, tablet, 390 px mobile, and landscape-mobile sizes.
6. Produce reference/current/diff images and a machine-readable manifest containing route, state, viewport, browser, artifact SHA, and asset hashes.
7. Run axe and keyboard/focus checks against the same production artifact.
8. Run Lighthouse CI for representative routes with multiple runs; retain HTML/JSON reports and enforce the approved performance, accessibility, best-practice, SEO, LCP, CLS, TBT/INP, request, JS, CSS, image, and font budgets.
9. Have the owner review the deviation register and qualified rights/accessibility reviewers approve their scopes.
10. Freeze baselines only after approval; never update snapshots merely to make CI green.

## Required approval record

For each route/state, retain:

- reference file and current capture checksum;
- route, query, viewport, browser, OS, locale, timezone, color scheme, and reduced-motion setting;
- source commit, build ID, image digest, and test fixture ID;
- diff result and explanation for every intentional difference;
- media/font approval IDs and asset checksums;
- owner visual approval, accessibility review, and legal/factual approval where relevant;
- date, reviewer role, decision, and next-review date.

Codex can generate this matrix, capture the artifacts, calculate hashes, run the automated checks, and prepare the approval packet. The owner must approve the target appearance and deviations; the rights holder must approve media/fonts; and a qualified accessibility reviewer should approve the final public surface where required by the launch policy.
