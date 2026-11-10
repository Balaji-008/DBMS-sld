# Task 3 — Oracle backend
Status: DONE_WITH_CONCERNS
Files changed: `server/src/config.ts`, `server/src/db.ts`, `server/src/errors.ts`, `server/src/auth.ts`, `server/src/mail.ts`, `server/src/auth-routes.ts`, `server/src/routes.ts`, `server/src/upload-routes.ts`, `server/src/app.ts`, `server/src/index.ts`
Commands run: `npm run typecheck:server` → passes after the final reviewer fixes. `npm run test:integration` → 49 checks passed against the configured Oracle schema before the final reviewer fixes; external email was not sent. A temporary direct HTTP verification confirmed the seeded student dashboard returns 200 with metrics and upcoming opportunities against Oracle.
Commit: none (orchestrator owns integration and commits).
Concerns: The implementation uses the frozen Oracle schema and API contract, including `HACKATHONS.EVENT_MODE` and `OTP_EMAIL_LOCKS`. OTP lock serialization and certificate access for admin-uploaded files were added after the 49-check integration pass and have only been typechecked so far. Gmail credentials are not configured yet, so mail requests should return 503 until valid settings are supplied; JSON mail capture is only enabled with `NODE_ENV=test`.
