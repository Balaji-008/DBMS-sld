# Mobile UI audit

## Baseline snapshot

- Captured: 2026-11-09 10:22 UTC
- Source revision: `f2a2e96`
- Command: `systemd-run --user --scope -p MemoryMax=1G -p MemorySwapMax=0 env NODE_OPTIONS=--max-old-space-size=384 npx tsx tests/browser.ts`
- Result: exit 0; `BROWSER RESULT: 21 checks passed. External email was not sent.`
- Runtime was capped at 1 GiB. The suite closed Chromium and its local server after the run.
- Browser errors: none observed by the suite.

The existing suite covered the three login role tabs, login help, registration role availability, controlled fake student and placement-team OTP sign-in, student and admin route loading, the opportunity detail drawer and Escape close, and a 390px mobile menu/profile smoke check. It asserted no horizontal overflow at 390px on the profile route. The mobile profile screenshot is [profile-mobile.png](../../test-results/profile-mobile.png); it is a baseline artifact and must not be used as a final showcase capture.

## Coverage gaps before the rewrite

The baseline suite exercised only 390px on mobile. It did not measure 320, 360, 430, or 768px layouts, target dimensions, keyboard focus visibility, reduced-motion behavior, dialog inner scrolling, mobile table actions, mobile create/edit flows, or image request failures. Student route checks and admin route checks ran, but the recruiter role did not. The existing functional suite performed CRUD workflows with desktop-sized contexts. These are unverified baseline areas, not passing results.

The 390px profile screenshot stacks the form and supporting panels without visually apparent horizontal clipping. This is a screenshot observation only; it does not establish that controls meet a 44px target or that every route fits.

## Completed QA coverage

- `tests/brand-browser.ts` checks landing overflow at 320, 360, 390, 430, and 768px; decoded images and image failures; role links; and reduced-motion behavior.
- `tests/browser.ts` checks login and core student routes at those five widths, visible keyboard focus, 44px login/navigation/profile targets, help-dialog focus/Escape/restore, closed-navigation inertness and keyboard exclusion, the eligible toggle focus cue, and admin route loads.
- `tests/functional-browser.ts` uses touch-enabled contexts for the placement team, student, and recruiter. It checks every role's critical routes at all five widths; target sizes/reachability; table headers and `data-label`s; mobile company/opportunity/hackathon forms; profile uploads with blank optional email; apply/withdraw; application stages/outcomes; recruiter approval; and team registration. Dialog checks cover viewport fit, focus entry, 44px controls, and scrollable content. The workflow uses generated identities/rows with reverse-FK cleanup, and does not log response bodies.
- All nine final screenshot paths are under `test-results/showcase/`. Demo workflows use readable `Demo …` names and unique test-domain identities.

## Final post-fix gates

Frozen client assets: `index-CvvHfYsk.js` and `index-B_WNGRsQ.css`.

| Gate | Result |
|---|---:|
| Brand/landing | 29 checks passed, exit 0 |
| Login/shell/student smoke/admin route loads | 35 checks passed, exit 0 |
| Three-role mobile functional workflows | 43 checks passed, exit 0 |

The final shell and functional runs reported empty layout/accessibility, browser-error, and failed-image lists. All functional flows completed and the suite cleanup ran. The functional suite used a 2560 MiB zero-swap scope; a previous 1 GiB scope OOM-killed Chrome during the full three-role route matrix, so the final gate used the repository runner's documented 2560 MiB functional cap.

The production build and full gate command details are in [qa-report.md](../../.superpowers/sdd/mobile-showcase/qa-report.md) and [verification-results.json](verification-results.json).

## Capture provenance

Dashboard, job, apply, and profile captures contain synthetic `Demo Student` / `Demo Systems` records. The reports screenshot shows aggregates from the current Oracle QA database; provenance was not independently verified, so its values must not be presented as confirmed campus placement statistics.
