# Backend remediation ledger — 2026-11-09

## Findings

| ID | Target revision | Owner | Planned invariant | Status | Patch + verification |
|---|---|---|---|---|---|
| API-001 | `cdb2ba9` + current worktree | Luna runtime/backend | Every numeric business `:id` path parameter is a positive safe integer before it can reach Oracle; malformed IDs return 400 and valid missing IDs remain 404. Upload content hashes and body-carried auth challenge IDs are unaffected. | fixed | `server/src/routes.ts`: central `router.param('id')` validation, normalizes safe IDs, retains bound SQL. Red: 2026-11-09 Oracle integration run returned HTTP 500/NJS-105 for authenticated `GET /api/opportunities/not-a-number`; the same run confirmed nonexistent numeric opportunity ID returns 404. Green: rerun `npm run test:integration` (2026-11-09 12:36 IST) → 87 checks, exit 0; malformed opportunity ID 400, missing numeric opportunity 404; company malformed/missing PATCH 400/404. Residual: only numeric business routes in this router are covered; upload hashes remain route-specific. |
| API-002 | `cdb2ba9` + current worktree | Luna runtime/backend | Ordinary auth navigation and logout do not consume the IP auth mutation/OTP request budget; request/register/verify POSTs remain throttled. | fixed | `server/src/app.ts`: retained 30 requests / 15 minutes limiter, skipping non-POST and `/logout`. Red: root reported UI functional testing received HTTP 429 from repeated `GET /api/auth/config` before this patch. Green: controlled post-patch server check: 35 GET `/api/auth/config` all 200; 35 POST `/api/auth/logout` all 200; 31 POST `/api/auth/verify-otp` with invalid empty payload yielded 30×400 then 1×429. The UI QA worker confirmed its final current-source browser runs passed after the patch; the Oracle integration rerun also exercised 35 `/auth/config` GETs successfully. Residual: request/register/verify share one 30-per-15-minute in-memory limiter, while Oracle still enforces resend cooldown and five-attempt challenge lock. |

## Verification

- `npm run test:integration` in `systemd-run --user --scope -p MemoryMax=1G -p MemorySwapMax=0` → 87 checks passed against Oracle, exit 0; controlled JSON transport, no email sent.
- `npm run typecheck:server` → passed, exit 0.
- `node --import tsx --input-type=module` one-off controlled test server with `NODE_ENV=test` and `MAIL_TRANSPORT=json` → config/logout/verify/malformed-ID results above; no real email delivery path was invoked.
- The test server listened on an OS-assigned loopback port and was closed in `finally`.
- After QA freeze, the API was restarted once under the persistent unit. Public health remained 200 with Oracle connected and SMTP configured. Oracle container was not restarted or changed.
