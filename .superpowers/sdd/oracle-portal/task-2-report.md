# Task 2 — Frontend implementation report

## Implemented

- Built the React/Vite client shell for CampusBridge with responsive role-aware navigation, session-aware routing, and same-origin `/api` calls.
- Added passwordless email OTP sign-in and registration with role tabs, student department lookup, recruiter company registration, six-digit validation, resend cooldown, change-email flow, remember-me, pending approval feedback, and readable help/privacy dialogs.
- Added real-data dashboard metrics, placement funnel, profile completion, activity, recent applications, and upcoming deadlines.
- Added opportunity search and filters, eligibility detail, application action and clear API errors; recruiters and placement staff can create and update opportunities with eligibility requirements.
- Added scoped application lists, allowed stage transitions, student withdrawal, and selected-application placement/internship outcome forms.
- Added student profile editing, normalized contact numbers, skills, protected resume/Aadhaar document uploads, masked Aadhaar display and replacement, and certificate add/delete workflows.
- Added hackathon browsing, student team registration, registration views, and recruiter/placement-team creation; company editing, student directory, outcome tables, reports with SVG/CSS charts and CSV export, and recruiter approval.
- Added shared typed API models and accessible form/table/dialog primitives. UI styling includes mobile navigation, keyboard focus, reduced-motion handling, loading/error/empty states, and a dedicated campus line illustration on sign-in.

## Verification

- `npm run typecheck:client` — passed after implementation.
- No build or browser test was run in this task; root integration/QA owns those checks.

## Integration follow-up

- Added a Placement team tab for OTP sign-in; registration remains limited to student and recruiter and resets role selection when switching modes.
- Added a dedicated Certificates page. Students see their own records; placement staff can select a student when adding a certificate. The admin route no longer loads `/students/me`.
- Exposed role-scoped placement and internship outcomes to students; outcome creation remains limited to recruiter/placement-team application actions.
- Added validation for required datetime-local values before ISO conversion in opportunity and hackathon forms. Number fields are converted to numeric API values.
- Kept opportunity and placement CTC writes in raw INR; placement figures display in LPA, and internship compensation displays as monthly INR. Reports and compensation dashboard metrics convert raw annual INR to LPA. Company edits now use the contract's PATCH endpoint.
- Added a shared dialog hook for initial focus, Escape close, Tab containment, and focus restoration across shared modals, login help/privacy, the profile certificate modal, and opportunity details. Dialog callbacks use a ref so opening behavior does not restart when inline callbacks change.
- Restricted profile-readiness links to students; recruiters and placement staff see a hiring-workflow panel. The login screen explains when email delivery is unavailable instead of implying SMTP is ready. Confirmed the drawer keyframe declaration has no stray period.
- Excluded hackathons from job listings, routed hackathon deadline links to the dedicated hackathon page, and changed the list count to describe displayed opportunities. Validation/API errors are shown inside the active form dialogs.
- `npm run typecheck:client` — passed after these changes.

## Notes

- Client requests use relative `/api` paths so the application can sit behind the root-managed Cloudflare edge proxy.
- Gmail delivery remains configured and reported by the API. The client does not expose or simulate an OTP.
- The UI relies on the frozen contract in `docs/API-CONTRACT.md`; integration should recheck it against the backend before release.
- The login uses Google Fonts with local sans-serif fallbacks; the rest of the interface remains usable if font delivery is unavailable.
