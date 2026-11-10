# Mobile QA and capture report

Verified: 2026-11-09 16:24 UTC. Git base revision: `f2a2e96` with uncommitted coordinated worktree changes. Frozen production bundle: `index-CvvHfYsk.js` and `index-B_WNGRsQ.css`.

## Final gates

The allowlisted review-loop runner was attempted first. `--resume` had no prior state; a fresh run then stopped before typecheck because its `systemd-run --wait --scope` wrapper is rejected by this systemd version. The runner was not modified. Its fixed browser commands were run sequentially in resource-capped scopes instead.

| Gate | Result | Evidence |
|---|---:|---|
| Brand / landing | 29 checks, exit 0 | `test-results/showcase/brand-final.log` |
| Login, shell, student smoke and admin routes | 35 checks, exit 0 | `test-results/showcase/browser-final.log` |
| Three-role touch workflows and responsive matrix | 43 checks, exit 0 | `test-results/showcase/functional-final.log` |

The functional gate used a 2560 MiB memory cap, zero swap, and 200% CPU quota. A prior 1 GiB attempt was OOM-killed while Chrome retained three role contexts across the full route matrix; no unrelated service or Oracle process was affected. The bounded rerun completed.

## Coverage

Landing, login, student, recruiter, and placement-team routes were exercised at 320, 360, 390, 430, and 768 CSS pixels. Student width coverage included overview, opportunities, applications, profile, certificates, hackathons, and outcomes. Recruiter coverage included overview, opportunities, applications, companies, outcomes, reports, and hackathons. Placement-team coverage included overview, opportunities, applications, students, companies, certificates, hackathons, outcomes, approvals, and reports.

The 390px touch workflows created and edited companies and opportunities; created a hackathon; registered a recruiter and approved the account; edited a student profile with blank optional personal email and multiple phone numbers; uploaded a synthetic PDF resume and certificate; applied, withdrew, advanced an application through stages, recorded placement and internship outcomes, registered a hackathon team, and viewed registrations. Generated users and records used unique QA identifiers and were removed by the suite's `finally` cleanup.

The suites checked 44px interactive targets, route overflow, navigation open/closed state and keyboard reachability, dialog focus and scrolling, table headers/data labels, reduced-motion behavior, decoded/failed images, and JavaScript errors. Final results: `MOBILE_LAYOUT_ISSUES []`, `BROWSER_ERRORS []`, `FAILED_IMAGES []` in the functional run; the shell run also reported empty error and image-failure lists. The student opportunity filter's hidden checkbox has a visible focus indicator on its adjacent label control.

Email transport was JSON-captured for fake `@campus.test` identities; no external email or real OTP was sent. No Aadhaar value was entered or displayed.

## Captures

All nine current-bundle screenshots were checked as PNGs with the requested dimensions:

- Desktop, 1440×900: `landing-desktop.png`, `student-dashboard-desktop.png`, `job-detail-desktop.png`, `reports-desktop.png`.
- Mobile, 390×844: `landing-mobile.png`, `login-mobile.png`, `dashboard-mobile.png`, `apply-mobile.png`, `profile-mobile.png`.

They are stored under `test-results/showcase/`. Dashboard, job, apply, and profile views use synthetic demo records created by the functional suite. The reports screenshot is a live aggregate view of the current Oracle QA database; its data provenance is not independently verified, so its figures must not be presented as confirmed campus placement statistics. The final set is suitable as a product demonstration when this distinction is preserved.
