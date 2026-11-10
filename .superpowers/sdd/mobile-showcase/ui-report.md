# Client UI lane — source freeze

Status: **BUILD_READY; final link/action hit-area fixes are in the frozen bundle.** Fresh final browser QA and root's visual review are pending.

## Scope and changes

- Reworked the application shell for a role-aware off-canvas navigation drawer and four-item quick navigation bar at widths up to 900px. Profile/overview navigation and sign-out are separate controls. The drawer traps focus, closes on Escape and breakpoint changes, locks page scrolling while open, and restores focus safely.
- Replaced accumulated compressed CSS with readable rules and a shared Amrita wine, ivory, and gold palette. Consolidated 63 repeated top-level selector rules and removed 86 superseded duplicate declarations. Increased body text and form control type; inputs use 16px text, with primary buttons, icon actions, and form controls at a minimum 44px touch size.
- Added labeled mobile table cards while preserving all columns and actions. Applications, certificates, companies, outcomes, approvals, and directory records retain visible field labels and interactive cells at narrow widths.
- Updated shared dialogs and notices with explicit title associations and alert semantics for errors. Kept existing role routes, landing deep links, API payloads, page content, and form labels. Added duplicate-submit protection to application submission, hackathon registration, approvals, and certificate deletion.
- Preserved the supplied logo, campus illustration, posters, and animated GIF behavior. Existing reduced-motion and off-screen GIF pause behavior remains; static landing images now declare intrinsic dimensions and asynchronous decoding.

## Verification

- `npm run typecheck:client` — passed, exit 0.
- `git diff --check` — passed after removing a trailing blank line.
- `systemd-run --user --scope -p MemoryMax=640M -p MemorySwapMax=128M env NODE_OPTIONS=--max-old-space-size=384 npm run build` — passed twice: first source bundle `index-Bv8G0osv.js` / `index-ChDxlhDq.css`; after the QA-targeted login hit-area fix, frozen bundle `index-DUT_sEIv.js` / `index-JYjXtC7q.css`. Both runs passed server/client typechecks and Vite. The reported login controls `Create account`, `Sign-in help`, and `Privacy & terms` now have a 44px minimum height. The build emits its existing non-blocking warning that `api.ts` is statically and dynamically imported and will not move to another chunk.
- After the second build, read-only review identified two more issues: the closed compact navigation drawer now uses `inert` and `aria-hidden` and tracks the 900px breakpoint; the Eligible for me toggle now shows a visible focus ring through its label. Both were included in the latest bounded build.
- QA then measured four additional narrow-screen controls below target: Open navigation (41px wide), Open profile (32px wide), View credential (20px high), and Collapse navigation (36px high). The first three now have fixed/minimum 44px hit areas; the desktop-only collapse control is hidden in the mobile drawer. The 1×1 upload input is visually hidden behind a full-size upload label and was identified as a measurement false positive. The dismiss button and scrim both use the same accessible name by design; QA scoped its locator to the named dialog instead of reporting a product defect.
- QA's current-artifact run passed login layouts at 320/360/390/430/768px, login 44px controls, keyboard focus, help dialog, and the six student routes at those widths with no document overflow. The run was against bundle `index-DUT_sEIv.js` / `index-JYjXtC7q.css` and stopped on the four measured touch targets above. The next combined build after those fixes and the two a11y fixes produced `index-DgMWqFzF.js` / `index-CEgrPAYR.css`; full retest is pending.
- A fresh diagnostic pass then measured route overflow at 320px: an Upcoming panel with a 341.3px automatic minimum in a 298px dashboard grid, a fixed bottom navigation intrinsically wider than the 320px shell, and a topbar whose breadcrumb could not shrink around the account controls. Source fixes set dashboard children/tracks to shrink, constrain bottom-nav width using border-box sizing with concise visible labels and full accessible names, and allow the breadcrumb to shrink/ellipsis (hiding the campus crumb on very narrow screens). No global overflow mask was added.
- The shared focus trap now excludes hidden or inert controls by rendered-box and visibility checks. `npm run typecheck:client` and `git diff --check` passed after these final changes. The final bounded `npm run build` passed; frozen assets are `client/dist/assets/index-D3_WTT61.js` and `client/dist/assets/index-Deq-3qob.css`. Full browser and visual retest of this final bundle remains pending. The existing Vite warning about static and dynamic imports of `api.ts` remains non-blocking.
- The final functional audit measured text links, icon links, company row actions, and credential links below 44px. Shared styles now give text/completion/table links a 44px minimum height, icon links a non-shrinking 44px square, and text actions 44px minimum dimensions. Client typecheck and diff-check passed; the last bounded build passed. Final frozen assets are `client/dist/assets/index-CvvHfYsk.js` and `client/dist/assets/index-B_WNGRsQ.css`; the final QA target assertion is pending.
- No browser tests or screenshots have been run in this lane. QA owns viewport checks and fresh captures; visual correctness and overflow behavior remain unverified until that review.

## Limits

- Existing Nov. 9 browser evidence (16 functional, 21 navigation, 22 brand checks) describes the previous source, not this rewrite. Do not use those counts to claim this UI passed browser QA.
- No Lighthouse or performance measurement was made. No claim is made about speed improvements.
- API/server/database and test files were not edited by this lane.

Commit: none; root coordinates integration.
