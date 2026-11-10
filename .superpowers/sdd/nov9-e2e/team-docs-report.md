# Documentation and final verification record — 2026-11-09

Counts marked `[MEASURED]` were emitted by commands executed in the documentation turn, sequentially and within a 1 GiB cgroup memory cap [MEASURED] where applicable. Command output was returned in the execution transcript; this record preserves the command, final result, evidence limits, and references to the detailed lane reports.

## Test matrix

| Command | Observed summary |
|---|---|
| `systemd-run --user --scope -p MemoryMax=1G -p MemorySwapMax=0 npm run test:integration` | `INTEGRATION RESULT: 87 checks passed against Oracle. External email was not sent.` **87/87 [MEASURED]** |
| `systemd-run --user --scope -p MemoryMax=1G -p MemorySwapMax=128M env NODE_OPTIONS=--max-old-space-size=384 npx tsx tests/functional-browser.ts` | `FUNCTIONAL BROWSER RESULT: 16 checks passed; external email was not sent.` **16/16 [MEASURED]** |
| Same bounded command with `tests/browser.ts` | `BROWSER RESULT: 21 checks passed. External email was not sent.` **21/21 [MEASURED]** |
| Same bounded command with `tests/brand-browser.ts` | `BRAND BROWSER RESULT: 22 checks passed; no external email sent.` **22/22 [MEASURED]** |
| `systemd-run --user --scope -p MemoryMax=1G -p MemorySwapMax=128M env NODE_OPTIONS=--max-old-space-size=384 npm run build` | Server/client typechecks and Vite build passed, exit 0 **[MEASURED]**. Output bundle: `index-DkwLod41.js`. A non-blocking warning says `api.ts` is both statically and dynamically imported. |
| `npm run services:check` | Rendered API and tunnel units passed `systemd-analyze verify`; no user services changed **[MEASURED]**. |
| `node --import tsx --input-type=module -e '<configured Nodemailer transport.verify()>'` | SMTP verify succeeded; no message sent **[MEASURED]**. The command loaded local config without printing any credential and called `transport.verify()` only. |
| `node --input-type=module -e '<fetch public health, login, and bundle>'` | HTTP 200 for all three **[MEASURED]**; health showed database connected and SMTP configured. |
| `systemctl --user show campusbridge-api.service campusbridge-tunnel.service --property=ActiveState,SubState,UnitFileState,FragmentPath,MemoryMax,MemorySwapMax --no-pager` | Both units were active/running/enabled from `$HOME/systemd/user/`; API caps 536870912 bytes memory and 134217728 bytes swap, tunnel caps 402653184 bytes memory and 134217728 bytes swap **[MEASURED]**. |
| `docker ps --filter name=oracle-free --format '{{.Names}} {{.Status}}'` | `oracle-free Up 5 days (healthy)` **[MEASURED]**; container was not restarted. |
| `npm run tunnel:stop` → `npm run stop` → `npm run start:background` → `npm run tunnel:start` | Post-review lifecycle audit verified the sequence starts the installed persistent units; public health returned HTTP 200 **[MEASURED in runtime lifecycle audit]**, Oracle remained healthy and untouched. Calling either start helper while active was also idempotent. |

## Fixes corroborated by the checks

- Invalid numeric business route IDs previously reached Oracle and returned NJS-105/HTTP 500 [MEASURED]; current Oracle integration checks observe HTTP 400 [MEASURED] for malformed IDs while numeric-but-missing IDs remain HTTP 404 [MEASURED].
- Auth configuration and logout navigation requests no longer consume the OTP mutation limit. The integration suite passed after 35 auth-config GETs [MEASURED]; OTP request/register/verify POST endpoints retain their rate limit.
- The student hackathon registration flow clears the selected hackathon after success. The functional browser flow observed the registration list after an explicit click rather than an empty list reopening automatically.
- The public API was unavailable while the named tunnel was inactive, although local API health returned 200 and Oracle remained connected. After the tunnel was restored and connections registered, public health, login and the current bundle returned 200. Logs do not identify why the tunnel stopped.
- The service lifecycle audit found and corrected a conflict where legacy start helpers could create transient units with the same names as installed persistent units after stop. Start helpers now reload and start installed persistent units, using bounded transient fallback only if no persistent definition is installed. The post-review stop/start sequence and active-start idempotency passed; see [runtime report](runtime-report.md) for exact commands and results.

## Evidence limits

- Browser suites cover the listed user journeys and UI states, not every input boundary or role-authorization combination.
- Independent database comparisons cover dashboard metrics for the exercised roles and selected report fields; they do not assert every report, funnel, or activity field.
- Nodemailer verification confirms SMTP authentication/connectivity only. No message was sent during this verification, so inbox arrival and a real OTP sign-in were not measured.
- This is not exhaustive fuzzing, a general security audit, or a claim that every route combination was tested.
- Public state is time-sensitive and depends on this laptop, network, Oracle, API, and Cloudflare tunnel.

Detailed source reports: [runtime](runtime-report.md), [Oracle/API](database-api-report.md), [UI/browser](ui-browser-report.md), [backend fixes](backend-verification.md), and [independent final gate](final-verification.md).
