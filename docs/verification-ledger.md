# Implementation review and verification

Target: `feat/oracle-portal`, initial implementation. Before-source snapshot is `.superpowers/sdd/oracle-portal/review-package.patch`, SHA-256 `ff9893ba8e4ad28c4b30d8dccb4c2ea31ab0fbdd6e7bf25cc8ed0c73c69b8546`. Current source is the delivered initial implementation commit. Review was performed by a separate Luna worker and fixes were approved on re-review.

| ID | Owner | Planned invariant | Status | Patch and observed verification |
| --- | --- | --- | --- | --- |
| APP-01 | Backend Luna | Student dashboard must return data using valid Oracle binds | fixed | Separate application/opportunity binds in `server/src/routes.ts`. Before snapshot: HTTP 500, NJS-098. After: HTTP 200; full integration and browser checks pass. |
| APP-02 | Backend Luna | Certificate access follows its student association even when an admin uploaded it | fixed | `server/src/upload-routes.ts` joins certificate, student and applicant company. Before: student 404, recruiter 404. After: student 200, applicant recruiter 200. Aadhaar remains inaccessible to recruiters. |
| APP-03 | Backend Luna / orchestrator | Concurrent OTP dispatch is serialized per email in Oracle | fixed | `OTP_EMAIL_LOCKS` and transactional `SELECT FOR UPDATE`. Controlled overlap against before snapshot: four dispatch responses and four captured codes. After: one dispatch and one captured code; the other five requests are rejected. |
| APP-04 | Frontend Luna | Dialogs move focus inside and close on Escape | fixed | Shared `client/src/hooks/useDialog.ts` behavior. Before snapshot browser: `focus inside=false, closed=false`. After: `focus inside=true, closed=true`. Main browser suite also verifies opportunity drawer Escape behavior and mobile navigation. |
| APP-05 | Orchestrator | Public API uses a matching Worker/origin secret | fixed | `scripts/deploy.mjs` checks Oracle health, synchronizes secret through Wrangler stdin, then deploys. Before: deployment code omitted Worker secret synchronization; isolated Worker invocation with the required secret absent reproduced HTTP 503. After deployment: public `/api/health` returned HTTP 200 and `database: connected`. |
| APP-06 | Orchestrator | New public hostname has working HTTPS | fixed | First curl failed with `sslv3 alert handshake failure` during initial certificate activation. Domain binding was confirmed with a certificate ID. Later public HTTPS `/api/health` and `/login` returned 200 without insecure flags. No TLS verification was disabled. |
| APP-07 | Backend Luna | Empty optional contact emails are accepted; invalid dates return validation errors | fixed | Blank-to-null preprocessing and calendar validation. Before-snapshot HTTP check rejected a blank personal email with HTTP 400. Current source returned HTTP 200 for the same profile payload. Integration also rejects `2026-02-31` with HTTP 400. |

## Commands and results

- `npm run typecheck`: server and client TypeScript succeeded.
- `npm run build`: production interface built successfully. Vite notes a harmless dynamic/static import of the shared API module; no CSS syntax warnings remain.
- `npm run db:setup`: 18 additive table blocks and 65 idempotent seed blocks executed against Oracle. Seed state: 4 departments, 5 companies, 6 users, 4 students, 9 opportunities, 6 applications, 1 placement, 1 internship, 2 hackathons, 3 certificates.
- `npm run test:integration`: **54 checks passed**, exit 0, against Oracle. Cleanup completed without errors. Test email transport only; no external email sent.
- `npm run test:browser`: **20 checks passed**, exit 0. Real browser, desktop and 390 px mobile, controlled OTP capture, all role pages checked. Screenshots in ignored `test-results/`.
- `node --import tsx tests/review-regression.ts --before`: **0 passed, 4 failed**, exit 1, reproducing APP-01, APP-02, APP-03 and APP-07 on the preserved before snapshot.
- `node --import tsx tests/review-regression.ts`: **4 passed, 0 failed**, exit 0.
- `node --import tsx tests/dialog-regression.ts --before`: **failed**, focus outside and Escape did not close the dialog.
- `node --import tsx tests/dialog-regression.ts`: **passed**, focus inside and Escape closed the dialog.
- `npm run deploy:cloudflare`: Worker, assets, VPC binding and custom domain deployed with Wrangler. Public HTTPS health and login checked after certificate activation.

The before-snapshot reproductions are isolated under ignored `test-results/review-before/`; they do not replace the current source or deployed code. The concurrency regression briefly holds a controlled Oracle test transaction to force overlapping requests, then rolls it back. Current-code checks prove the previously failing cases pass; they do not constitute an exhaustive audit of every possible schedule.

## Gmail configuration update — 2026-11-04

The user supplied a local Gmail app-password file. A single authorized test message from `[redacted email]` to `[redacted email]` was accepted by Gmail SMTP with `250 2.0.0 OK`, one accepted recipient and none rejected. The API was restarted with the protected local SMTP settings; public health and authentication configuration both returned HTTP 200 with `smtp_configured:true`. The configured placement-team administrator is active. Inbox arrival and completion of a real user OTP sign-in were not independently confirmed. There is no public development inbox or OTP bypass, and credentials remain outside version control.

The public application depends on this laptop, Oracle and the named tunnel remaining up. Only HTTP application traffic is forwarded; Oracle is not exposed through the Worker or tunnel. No CI pipeline or external production-load test was run.

## Amrita visual refresh — 2026-11-04

Base revision: edc0180. Integrated refresh source is saved in the next feature commit. Luna task reports and final independent checks are under `.superpowers/sdd/amrita-visual-refresh/`.

- `npm run build`: server/client typechecks and Vite production bundle passed. The existing mixed dynamic/static API-import note remains non-blocking.
- Final bounded browser/API/email gate: `npm run test:browser` **21 passed**, `npm run test:brand-browser` **22 passed**, `npm run test:integration` **54 passed**, `npm run test:brand-email` **14 passed**; exit 0.
- Independent asset check: original supplied logo and sketch source hashes unchanged; all seven generated outputs match their manifest hashes; logo crop pixel comparison is exact.
- Both GIFs: 48 frames, 80ms per frame, 3840ms loop. Career orbit 653615 bytes; pathways 396511 bytes. Pathways now uses `0.41 * (1 - cos(2*pi*frame/48))`; its measured loop step matches the initial neighboring step. No runtime Canvas and no GIF requests under reduced-motion browser emulation.
- UI review follow-ups: landing role links now select their respective login tabs (including invalid-role fallback); expanded mobile menu shows the supplied logo; SMTP helper and local sender use the Amrita display name. These behaviors are covered by the current 22/21 browser checks and helper/source inspection; the old UI state was not separately re-executed for these minor changes.
- Email: local MIME includes HTML, plain text and the CID logo. Code/expiry/link escaping, invalid code and unsafe URL rejection passed. No new test mail was sent for this design update; email-client-specific Outlook/Gmail rendering was not independently exercised.
- Public verification: homepage and `/login?role=admin` return 200 with the current Amrita bundle; `/api/health` returns 200, Oracle connected, SMTP configured. Public campus WebP, logo and both GIF downloads hash-match local files.
- Wrangler custom-domain deployment: `328124e6-2396-4212-90ec-91a036524ff0`; API/tunnel active, Oracle container healthy. The host and Oracle still need to remain running.
