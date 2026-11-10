# Amrita visual refresh: frontend verification

Date: 2026-11-04

## Results

- `npm run build` — passed. Server and client TypeScript checks passed; Vite produced the production client bundle.
- `systemd-run --user --scope -p MemoryMax=768M -p MemorySwapMax=128M env NODE_OPTIONS=--max-old-space-size=256 npm run test:brand-browser` — passed, **22 checks**. The suite started and closed its local app server and Oracle connection. No external email was sent.
- Browser coverage confirmed Amrita/Bengaluru branding, optimized campus image and supplied logo, no runtime canvas, lazy GIF playback, pause/resume posters, the three landing role links selecting the correct login role, invalid-role fallback to Student, preserved three-role login, 390px landing and email widths, reduced-motion posters without GIF requests, and no uncaught landing/login errors.

## Visual review

- Desktop landing: `test-results/amrita-landing-desktop.png` — hierarchy, campus image, motion cards, role links, and footer render cleanly.
- Mobile landing: `test-results/amrita-landing-mobile.png` — content remains within the 390px viewport; sections stack cleanly and the role links remain legible.
- Desktop login: `test-results/amrita-login-desktop.png` — branding and three account tabs are clear in the split layout.
- Mobile email preview: `test-results/amrita-email-mobile.png` — 390px preview is readable, with the code, expiry, and portal link visible and no horizontal overflow.

## Change made during verification

Set the email preview browser viewport explicitly to 390px before its mobile-width assertion and screenshot in `tests/brand-browser.ts`, making the mobile email check self-contained. The adjusted suite passed all 22 checks.

## Build note

Vite emitted a non-blocking warning that `client/src/api.ts` is dynamically imported by `Profile.tsx` and statically imported elsewhere, so it will not be split into a separate chunk. Build completed successfully.
