# Independent final verification — 2026-11-09

Reviewer: independent Luna gate
Reviewed at: 2026-11-09 13:01 IST
Decision: **Approve with evidence limits recorded below.**

## Review scope

Reviewed the four lane reports, current worktree diff, runtime unit templates/installer, integration and browser harnesses, and the three `docs/team-viva/` documents. I made no source, configuration, service, or business-data changes. The only authored file in this review is this report.

At the first gate time, no date-matched spec or plan was present under `docs/` or `.superpowers/`, so acceptance criteria were reconstructed from the lane reports and requested outcomes. The files now present at `docs/superpowers/specs/2026-11-09-e2e-recovery.md` and `docs/superpowers/plans/2026-11-09-e2e-recovery.md` explicitly identify themselves as retrospective records written after execution; I reviewed them in this follow-up and they do not present themselves as pre-implementation authorization. Runtime report records a clean `feat/oracle-portal` tree at task start. That historical state cannot be independently reconstructed from the current worktree, so I treat it as a lane observation rather than an independently established fact.

## Fresh checks

All checks below ran on 2026-11-09 around 13:00 IST from `$PROJECT_ROOT`.

| Check | Result |
|---|---|
| `systemd-run --user --scope -p MemoryMax=1G -p MemorySwapMax=0 npm run test:integration` | **87 checks passed** against Oracle; exit 0; test harness reports no external email sent. |
| `npm run services:check` | API and tunnel unit templates passed `systemd-analyze verify`; check mode made no service changes. |
| Local/public health | Local and public `/api/health` returned HTTP 200 with Oracle connected and SMTP configured. Public hostname resolved to `104.21.86.25` in this check; public health request completed in 0.40 s. |
| Public UI | `/login` and `/assets/index-DkwLod41.js` returned HTTP 200. Public health reports `mail_transport=smtp`. |
| Actual SMTP authentication | Fresh Nodemailer `verify()` succeeded using the configured credentials held in memory. Connection, greeting, and socket timeouts were 15 s, 15 s, and 30 s. No message was sent. |
| Active services and database | API and tunnel user units were active/running and enabled, loaded from `$HOME/systemd/user/`; API caps were 512 MiB memory / 128 MiB swap, tunnel caps 384 MiB / 128 MiB. `loginctl` reported linger enabled; Oracle container reported `Up 4 days (healthy)`. |
| Secret hygiene | `.env` is ignored, mode `0600`, and not tracked. A value-only scan found no configured SMTP password, Oracle password, session secret, Aadhaar key, or origin token in tracked/unignored working files; output contained no secret values. |
| Diff hygiene | `git diff --check` passed. |

The fresh integration run exercised the patched malformed numeric IDs (400 while a missing numeric ID remains 404) and 35 auth-config GETs, along with Oracle-backed role, ownership, transaction, OTP, upload, dashboard and report cases. No Oracle restart, API/tunnel restart, deploy, schema setup, or real inbox delivery was initiated by this verifier.

## Follow-up review of service start helpers

The runtime lane subsequently changed `scripts/service.mjs` and `scripts/tunnel-service.mjs` after finding that their previous `start` actions always used `systemd-run`, which conflicted with the newly installed persistent units after a stop. Both helpers now check for the corresponding unit file and loaded `FragmentPath`, reload the user manager when needed, and call `systemctl start` when the persistent definition is loaded. They retain the bounded transient `systemd-run` path only when no persistent unit is available. This is consistent with the retrospective plan's reported exact lifecycle sequence; I did not repeat its stop/start sequence.

Fresh read-only follow-up checks on 2026-11-09:

- `node --check scripts/service.mjs && node --check scripts/tunnel-service.mjs` passed.
- `npm run services:check` passed without changing services.
- `npm run status` reported the API active/running and local health HTTP 200 with Oracle connected.
- `npm run tunnel:status` reported active/running; direct local health returned HTTP 200. A public health request returned HTTP 200 (remote IP `172.67.214.59`).
- The inspected helper diff does not read or print `.env` values. No service lifecycle command was invoked in this follow-up.

## Diff and report review

- `server/src/routes.ts` validates positive safe-integer `:id` route parameters before handlers reach SQL; it leaves body-carried auth IDs and upload hash paths outside this parameter hook. Existing SQL remains bind-based.
- `server/src/app.ts` retains the auth mutation limiter and excludes non-POST navigation and logout requests, matching the test that 35 GETs succeed and invalid verify POSTs still hit the limiter.
- The post-gate `scripts/service.mjs` and `scripts/tunnel-service.mjs` fix correctly select persistent `systemctl start` when the user unit file is installed and loaded, and preserve the original resource-bounded transient fallback for installations without that unit. `node --check` plus active status checks passed. This follow-up did not reproduce the stop/start lifecycle because the current services were healthy and the requested check was read-only.
- `client/src/pages/Operations.tsx` clears the selected hackathon after successful registration, consistent with the registration modal no longer falling through into the registration-list modal.
- The added UI harness generates run-specific identities and record labels, uses JSON-captured OTP in test mode, and cleans up rows by generated IDs/emails. Its only fixed challenge cleanup targets the documented shared fake `admin@campus.test` test identity. I reviewed it but did not rerun the browser suites; the reported sequential runs were 16 functional, 21 navigation, and 22 brand checks, plus a successful build.
- The service installer renders from checked-in templates, refuses to replace a mismatched enable link, and `--check` renders/validates temporary units without touching user services. The runtime report attributes the move from transient to persistent units to the authorized runtime lane; current unit state and caps match its claims.
- The DBMS walkthrough accurately distinguishes the React → Express → Oracle path, Gmail SMTP as transport, Oracle OTP/session state, relational constraints and app-managed transactions. The team allocation is phrased as team-stated responsibility rather than proven commit authorship or percentages. The three major roles and one supporting role, IDs, and names agree across the team document and requested allocation; the checklist avoids claiming an inbox or live demo that was not exercised.
- The runtime report attributes the initial public outage to a stopped tunnel based on observed inactive state; its own diagnosis section correctly says the historical stop cause is unknown. Public health, login, bundle and malformed-ID behavior are independently live now. Worker version `e125b088-7e44-4c38-99ab-9af926a914b9` is recorded in the runtime report; this review did not query Cloudflare deployment metadata independently.

## Limits and residuals

- SMTP configuration and authenticated SMTP connectivity are verified, but no real OTP message was sent. Inbox arrival and a human Gmail OTP login remain unverified.
- The browser reports and source claim are credible and internally consistent, but browser suites/build were not rerun in this independent gate. Public bundle and login are live; this gate did not repeat the full browser sequence.
- The repo’s status now contains the described task changes; the initial clean-base statement is supported only by the runtime lane's recorded observation.
- These results establish the requested E2E gate, not exhaustive fuzzing, complete authorization proof, or a general security audit. The API report records concrete coverage boundaries.

At the follow-up review, `git status --short --branch` showed branch `feat/oracle-portal` and these changed/untracked paths: `PROGRESS.md`, `README.md`, `client/src/pages/Operations.tsx`, `docs/SQL-WORKSHOP.md`, `package.json`, `scripts/service.mjs`, `scripts/tunnel-service.mjs`, `server/src/app.ts`, `server/src/routes.ts`, `tests/integration.ts`, `.superpowers/sdd/nov9-e2e/`, `docs/superpowers/plans/2026-11-09-e2e-recovery.md`, `docs/superpowers/specs/2026-11-09-e2e-recovery.md`, `docs/team-viva/`, `scripts/install-user-services.mjs`, `systemd/`, and `tests/functional-browser.ts`. No credential leak concern was found: `.env` remains ignored and mode `0600`; a value-only scan across tracked and unignored working files found no configured secret values, and no value was emitted. No files were staged or committed by this review.

**Follow-up decision: approve.** The service-helper fix addresses the reported persistent/transient unit conflict, and the read-only status/syntax checks show the running installation remains healthy. No blocking discrepancy was found in the reviewed changes or fresh critical integration gate.

## Final Git checkpoint — pre-stage

At the authorized root-only checkpoint, `git status --short --branch` showed only the task's implementation, tests, documentation, and evidence paths on `feat/oracle-portal`; no unrelated user file was present. A value-only scan over all 25 changed/untracked candidate files found zero configured SMTP password, Oracle password, session secret, Aadhaar key, or origin-token matches. The scan emitted no credential values. `.env` remained ignored with mode `0600`; `logs/` and `storage/` remained ignored and were excluded from staging. `git diff --check` passed. Root is staging only the reviewed task-owned paths explicitly and committing without a push.
