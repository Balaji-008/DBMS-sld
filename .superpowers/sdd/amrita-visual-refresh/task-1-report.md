# Task 1 frontend report — Amrita visual refresh

## Work completed

- Added a public, responsive landing experience at `/` for signed-out visitors while preserving the authenticated dashboard at `/` and existing protected routes.
- Added the Bengaluru campus sketch to the landing hero and OTP login art panel with WebP sources and PNG fallbacks.
- Added two purposeful career/pathway illustration sections backed by GIF/poster assets. Animation stays on the poster until the motion preference is known, honors reduced motion, and exposes a pause/resume control.
- Rebranded the login screen, navigation shell, footer, metadata, title, and report export filename as Amrita Placement Portal; preserved OTP, registration, role, remember-me, help, and privacy behavior.
- Applied the maroon, gold, and ivory identity to the authenticated interface and added mobile and keyboard-focus styling.

## Verification

- `npm run typecheck:client` — passed.
- Browser, build, and integration checks were not run as instructed for this worker.

## Files changed

- `client/index.html`
- `client/src/App.tsx`
- `client/src/components/Shell.tsx`
- `client/src/pages/Landing.tsx`
- `client/src/pages/Login.tsx`
- `client/src/pages/Reports.tsx`
- `client/src/styles.css`

## Final asset refinement

- Switched public, login, footer, and sidebar wordmarks to the trimmed supplied campus logo; collapsed and compact navigation hide the wordmark instead of compressing it, with an accessible portal name and labeled navigation links.
- Added the bridge illustration with WebP/PNG fallback to the campus-to-career section.
- Added a small career-orbit illustration beside the desktop hero copy while keeping the campus sketch as the broad hero image.
- Motion images use `IntersectionObserver`: they show the poster before the preference/visibility check, animate only when visible and motion is allowed, and return to the poster when paused or offscreen.
- Re-ran `npm run typecheck:client` — passed. Browser/build checks remain unrun per the worker instructions.

## Review follow-up

- Role cards now open `/login?role=student|recruiter|admin`; login accepts only those three role values and defaults invalid/missing values to student. Existing registration mode still switches safely to student and offers no admin signup tab.
- The trimmed wordmark is visible in the expanded mobile navigation while remaining hidden in compact navigation.
- `npm run typecheck:client` — passed.
