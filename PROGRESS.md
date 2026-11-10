# Progress

## 2026-11-04 — Oracle portal implementation started
Did: inspected latest ER model, local Oracle/APEX and machine headroom; froze API contract and assigned disjoint implementation lanes.
Found: Oracle Free container healthy; FREEPDB1 read/write; localhost APEX responds 302. New project has no existing source repository. User selected Gmail SMTP.
Passed / Failed: initial environment checks only. Application implementation/verification pending.
Next: provision dedicated schema, implement frontend/database lanes, then backend and integration.
Safety: at most two Luna workers, sequential builds, dedicated schema, secrets kept out of source.

## Known open
- Historical note from 2026-11-04: Gmail accepted the requested test message, but inbox arrival and real OTP sign-in were not independently confirmed then. On 2026-11-09 Nodemailer SMTP `verify()` also succeeded without sending a message; inbox arrival and human OTP sign-in remain unverified.
- The public API requires the laptop, Oracle and named Cloudflare tunnel to remain running.

## 2026-11-04 — Application built, verified and deployed with Wrangler
Did: coordinated separate Luna database, frontend, backend and review workers; implemented the revised ER model in a new Oracle schema; built CampusBridge React/Express application and Gmail OTP configuration flow; deployed static assets and Worker custom domain with named private HTTP VPC tunnel using Wrangler CLI.
Found: Oracle treats MODE and several bind names as reserved; corrected them. Browser QA found a student dashboard bind mismatch. Independent review found Worker-secret synchronization, admin-issued certificate access, OTP dispatch race and keyboard-dialog issues; all patched, reproduced and approved on re-review. Initial domain TLS handshake failure cleared after certificate activation.
Passed / Failed: npm run build passed; npm run test:integration passed 54 checks; npm run test:browser passed 20 checks; preserved before-snapshot regression produced four failures and current source passed all four; before dialog check failed and current passed. Real Oracle DDL/seed executed: 18 tables, 65 seed MERGEs. Public HTTPS health returned 200 with database connected, login returned 200. Earlier failed commands and fixes are retained in docs/verification-ledger.md.
Next: configure the Gmail sender/app password locally with npm run smtp:configure; run npm run db:setup and restart API, then exercise real email OTP.
Safety: Oracle remains sole database. Existing Oracle/APEX and documents preserved. API bound localhost, capped at 512MB; named tunnel capped 384MB, both managed by user systemd with restart-on-failure. Secrets remain in ignored mode-600 .env and matching Cloudflare Worker secret. Test browser/servers exited. Public API depends on this laptop staying on; no D1 or other database provisioned.

## Delivered entry points
- Public https://dbms.sld.parswanadh.dev
- Local http://127.0.0.1:3000
- Project README.md; API docs/API-CONTRACT.md; schema database/SCHEMA.md; evidence docs/verification-ledger.md.
- Named tunnel campusbridge-dbms; Worker campusbridge-dbms; private VPC service campusbridge-oracle-api.

## 2026-11-04 — Gmail SMTP configured and requested test sent
Did: loaded the app password from the user-provided local file without displaying it; configured [redacted email] as the sender in ignored mode-600 .env; sent the single requested test email to [redacted email]; activated the configured placement-team administrator and restarted only the CampusBridge API.
Found: the earlier service-account key authenticated to Google but delegated Gmail authorization was rejected with unauthorized_client. The supplied Gmail app password successfully authenticated SMTP.
Passed / Failed: Gmail SMTP returned 250 2.0.0 OK, accepted the requested recipient, and rejected none. Public /api/health and /api/auth/config both returned HTTP 200 with smtp_configured:true; Oracle connected. Local .env remained untracked and mode 600. No password, OAuth access token or service-account private key was printed or added to source.
Next: user checks the test inbox/spam folder and can sign in on the public site as Placement team using the configured sender address. A real OTP sign-in email was not additionally sent.
Safety: existing Oracle and the other application were not restarted or stopped. Cloudflare tunnel remains active.

## 2026-11-04 — Amrita visual refresh completed with Luna workers
Did: delegated frontend/landing/login styling to Luna, offline GIF/assets to a second Luna, HTML/plain-text OTP email to a third, and independent source/design review to another. After an interruption, two fresh Luna workers independently checked the frontend and email/assets. Parent generated the campus sketch from the supplied photograph and companion abstract sketch, orchestrated integration, verified commands on disk and deployed with Wrangler.
Found: the supplied logo is a white Amrita Bengaluru Campus wordmark; its transparent-padding crop preserves source pixels. The campus sketch retains the supplied scene and uses a smaller WebP for the website. Pathway motion initially jumped at the loop boundary; the asset worker changed it to a periodic cosine path and verified the seam. Review follow-ups corrected sender branding, role-specific landing links and the expanded mobile menu logo. Existing Oracle and application services were stopped after the interruption; the existing Oracle container was started, its eighteen tables confirmed, then only application/tunnel services started.
Passed / Failed: production build passed; parent final gate passed 21 existing workflow browser checks, 22 brand/motion/responsive browser checks, 54 Oracle integration checks and 14 email-template/MIME checks. All checks use controlled local test mail; no extra external email sent during the refresh. Both GIFs are 48 frames at 80ms each, measured 653615 and 396511 bytes; file hashes match the manifest. Public homepage, login and health returned HTTP 200; health confirms Oracle connected and smtp_configured:true. Public campus WebP, both GIFs and trimmed logo hashes match local outputs. Wrangler deployment version 328124e6-2396-4212-90ec-91a036524ff0.
Next: user reviews https://dbms.sld.parswanadh.dev; the public landing appears when signed out, while signed-in users keep their dashboard. Email previews/screenshots are in test-results/.
Safety: credentials remain in ignored mode-600 .env. SMTP sender display name is Amrita Placement Portal. Existing Oracle schema/data/APEX preserved. API and named tunnel are active with their existing memory caps. APEX workspace PARSHU received SELECT-only access to fourteen business tables so the requested SQL Workshop queries work; auth/session tables were not granted.

## 2026-11-09 — Runtime recovery and full functional gate

Did: restored the named Cloudflare tunnel after observing it inactive while the local API and Oracle health remained good; moved only the API and tunnel to persistent enabled user systemd units. Oracle was left running. Fixed malformed business IDs returning NJS-105/500 [MEASURED] (now 400 [MEASURED]), auth navigation/logout consuming the OTP write-abuse budget, and the hackathon registration modal reopening the empty registration list. Completed the responsibility/viva split and DBMS walkthrough in `docs/team-viva/`.

Verification matrix (counts below were emitted by the listed bounded commands in this work session; coverage boundaries and summary evidence are in [the Nov. 9 evidence report](.superpowers/sdd/nov9-e2e/team-docs-report.md)):

| Area | Command | Result |
|---|---|---|
| Oracle API integration | `systemd-run --user --scope -p MemoryMax=1G -p MemorySwapMax=0 npm run test:integration` | **87 checks passed [MEASURED]**, Oracle-backed; external email not sent. |
| Full UI write workflows | `systemd-run --user --scope -p MemoryMax=1G -p MemorySwapMax=128M env NODE_OPTIONS=--max-old-space-size=384 npx tsx tests/functional-browser.ts` | **16 checks passed [MEASURED]**; controlled JSON mail, no external email. |
| Navigation and role screens | Same bounded command with `tests/browser.ts` | **21 checks passed [MEASURED]**. |
| Brand, motion and responsive UI | Same bounded command with `tests/brand-browser.ts` | **22 checks passed [MEASURED]**; no external email. |
| Type checks and production build | `systemd-run --user --scope -p MemoryMax=1G -p MemorySwapMax=128M env NODE_OPTIONS=--max-old-space-size=384 npm run build` | Passed [MEASURED], exit 0; Vite emitted `client/dist/assets/index-DkwLod41.js`. A non-blocking static/dynamic import warning remains. |
| Persistent service templates | `npm run services:check` | Passed [MEASURED]; `systemd-analyze verify` validated both rendered units and check mode changed no user services. |
| SMTP transport | Controlled Nodemailer `transport.verify()` using configured credentials | Passed [MEASURED]; no message sent. |
| Public deployment | Fetch `/api/health`, `/login`, and `/assets/index-DkwLod41.js` from the public hostname | All returned HTTP 200 [MEASURED]; health reported Oracle connected and SMTP configured. Deployment version: `e125b088-7e44-4c38-99ab-9af926a914b9`. |

Runtime finding: public API health returned 503 while the tunnel was inactive, despite local API health 200 and Oracle connected; after the tunnel was restored and its connections registered, public health returned 200 [MEASURED]. This establishes the observed service relationship, not the historical reason the tunnel stopped; available logs contain no stop cause. Persistent services are enabled and active. API cap is 512 MiB memory / 128 MiB swap and tunnel cap is 384 MiB memory / 128 MiB swap [MEASURED by `systemctl --user show`]. Docker reported `oracle-free Up 5 days (healthy)` [MEASURED]; Oracle was not restarted during this work.

Post-review audit found that the former start helpers could try to create transient units after a persistent unit had been installed and stopped. The helpers now reload/start installed persistent user units through `systemctl --user`, with bounded transient fallback only when no persistent unit file exists. Active-start calls are idempotent. The exact recovery sequence `npm run tunnel:stop` → `npm run stop` → `npm run start:background` → `npm run tunnel:start` was verified using the persistent units; the services started, public health returned HTTP 200 [MEASURED], and Oracle remained healthy and untouched. The current start-helper lifecycle is documented in [the runtime report](.superpowers/sdd/nov9-e2e/runtime-report.md).

Coverage limits: browser journeys cover exercised end-to-end flows, not every validation or authorization permutation. Independent aggregate assertions cover tested dashboard metrics for all roles and selected report fields; they do not cover every dashboard/report field. SMTP authentication/configuration was verified, but no Nov. 9 email was sent and inbox delivery or a human OTP login was not tested. The project did not perform exhaustive fuzzing or a general security audit. See [database/API QA](.superpowers/sdd/nov9-e2e/database-api-report.md), [UI/browser QA](.superpowers/sdd/nov9-e2e/ui-browser-report.md), [runtime report](.superpowers/sdd/nov9-e2e/runtime-report.md), [backend ledger](.superpowers/sdd/nov9-e2e/backend-verification.md), and [independent final verification](.superpowers/sdd/nov9-e2e/final-verification.md).

Next: user reviews the public portal and the final showcase deck/video; confirm a reachable demo inbox before any live OTP demonstration. The coordinated release checks below later confirmed current public health and deployment state.

Safety: shared Oracle/APEX schema and seed data were preserved; tests used generated records and cleanup. SMTP verification opened no mail flow. No raw OTP, session hash, Aadhaar value, or secret was included in the new documentation. The public site remains dependent on this laptop, its network, Oracle, and the tunnel.

## 2026-11-09 — Mobile showcase release closed for user review

Did: completed the mobile visual refresh, updated the role-based browser coverage, prepared the editable presentation and rendered video, reviewed final media quality, completed two adapted fresh-context EGM document-review rounds, verified README artifact links, and recorded the coordinated closeout in `.superpowers/sdd/mobile-showcase/final-release.md`.
Passed: the fixed app, mobile and release gate sequences passed 11/11 gates: typecheck/build, Oracle integration (87 checks), local branded OTP email/MIME preview (14 checks), mobile brand/shell/functional suites (29/35/43 checks), public API health, and fixed artifact inventory. The earlier wrapper failure remains in the runner's preserved attempt history. The deployed Worker version is `83680f1b-b35b-4fe4-84b0-a5771605485d`; public health and frozen asset hashes passed the recorded read-only checks. The five-slide PPTX/PDF and 22-second 1080p H.264/AAC video were approved by the artifact-level media review.
Next: user reviews the [final closeout and limitations](.superpowers/sdd/mobile-showcase/final-release.md), [editable deck](deliverables/presentation/amrita-placement-portal-showcase.pptx), [PDF](deliverables/presentation/amrita-placement-portal-showcase.pdf), and [showcase video](deliverables/video/amrita-placement-portal-showcase.mp4), then confirms any live demo inbox and preferred presentation handoff.
Limits: no real email was sent during these final gates; browser emulation is not physical-device certification. No general security audit or placement-outcome verification is claimed. Oracle remains the application's only database, and the public service depends on this laptop, Oracle and the named tunnel.
