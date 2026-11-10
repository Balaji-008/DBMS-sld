# UI and Browser Functional QA

Date: 2026-11-09

## Result

The fresh browser workflows passed against the local Oracle-backed test app. OTP mail used the test-only JSON capture; no external email was sent. All browser runs were sequential, each capped at 1 GiB. No production service or database reset was used.

| Command | Result |
| --- | ---: |
| `npx tsc --noEmit --target ES2022 --module NodeNext --moduleResolution NodeNext --types node tests/functional-browser.ts` | Passed |
| `systemd-run --user --scope -p MemoryMax=1G -p MemorySwapMax=128M env NODE_OPTIONS=--max-old-space-size=384 npx tsx tests/functional-browser.ts` | 16/16 checks passed |
| Same bounded command with `tests/browser.ts` | 21/21 checks passed |
| Same bounded command with `tests/brand-browser.ts` | 22/22 checks passed |
| Same bounded command with `npm run build` | Server/client typechecks and Vite build passed |

The functional run covered admin company create/edit; opportunity create/edit with required skills and eligible departments; student UI registration and controlled OTP; profile edit with blank optional email, resume PDF upload, certificate PDF add/view/delete; opportunity search, type filter, detail and apply; student withdrawal; applied → screening → interview → selected transitions; placement and internship outcome forms; recruiter registration and pending approval; approval through the placement-team screen; recruiter opportunity and hackathon creation; and student hackathon registration plus registration-list view. No uncaught browser errors occurred.

The final hackathon registration-list request returned HTTP 200 and one row for the run’s generated team. The test confirmed that the registration modal closes after signup, then opens only after clicking “Registrations.”

## UI fix

The student registration handler left the selected hackathon set after closing its registration modal. Because the same selection state also opened the registrations modal, signup immediately replaced the registration form with an empty list. The handler now clears the selection after successful registration in [Operations.tsx]($PROJECT_ROOT/client/src/pages/Operations.tsx). The end-to-end workflow reproduced the prior behavior and passed after the fix.

## Build and artifacts

`npm run build` generated `client/dist/assets/index-DkwLod41.js`. Vite emitted a non-failing warning that `api.ts` is both statically and dynamically imported; build exit status was 0. The built client needs deployment before the public site reflects the UI fix; deployment was not performed in this lane.

Screenshots from the final browser runs:

- `test-results/ui-functional-approvals.png`
- `test-results/ui-functional-hackathon.png`
- `test-results/login-desktop.png`
- `test-results/dashboard-student-desktop.png`
- `test-results/opportunity-detail.png`
- `test-results/profile-mobile.png`
- `test-results/reports-admin-desktop.png`
- `test-results/amrita-landing-desktop.png`
- `test-results/amrita-landing-mobile.png`
- `test-results/amrita-email-mobile.png`

## Cleanup and limits

After the run, a read-only Oracle check found zero `ui-e2e` test users, companies, opportunities, or hackathons. The local test ports 3002, 3003, and 3004 were closed. The harness removes only generated test identities and records; it does not delete or withdraw existing rows.

These checks cover the requested end-to-end journeys and the existing navigation/branding browser suites. They are not exhaustive coverage of every validation boundary or every role-to-role authorization rule; the API integration suite owns that coverage. The build warning above remains non-blocking.
