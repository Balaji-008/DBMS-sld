> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

# Portal Runtime Recovery and E2E Verification — Retrospective Execution Plan

> Record type: completed plan reconstructed after the work on 2026-11-09. The checks below record actual outcomes; this plan was not written or used to authorize work before execution. Root coordinated the four lanes. The worktree remains uncommitted pending independent review.

## Lanes and results

- [x] **Task 1 — Runtime recovery, backend fixes, persistent services, and deployment**
  - Owner: Luna runtime/backend.
  - Files: `server/src/app.ts`, `server/src/routes.ts`, `scripts/install-user-services.mjs`, `scripts/service.mjs`, `scripts/tunnel-service.mjs`, `systemd/user/campusbridge-api.service.in`, `systemd/user/campusbridge-tunnel.service.in`, `package.json`, `.superpowers/sdd/nov9-e2e/runtime-report.md`, `.superpowers/sdd/nov9-e2e/backend-verification.md`.
  - Do: Restore the named Cloudflare tunnel; validate numeric business path IDs before Oracle binding; apply the auth IP throttle to auth POST requests except logout; prepare persistent user unit files/installer; after QA freeze, switch only the API and tunnel to enabled persistent units; deploy the tested client build.
  - Verify: `npm run tunnel:start` → started named tunnel; public health and login returned 200. `node --check scripts/install-user-services.mjs && npm run services:check && git diff --check` → passed, rendered units valid. After QA freeze, `npm run services:install`, stop only `campusbridge-tunnel.service` and `campusbridge-api.service`, `systemctl --user daemon-reload`, then start API and tunnel → both loaded from `$HOME/systemd/user/`, enabled, active; caps stayed 512 MiB API / 384 MiB tunnel, each with 128 MiB swap cap. Subsequent lifecycle verification: active calls to `npm run start:background` and `npm run tunnel:start` were idempotent; `npm run tunnel:stop`, `npm run stop`, then both start commands succeeded with persistent definitions. `node --check scripts/service.mjs && node --check scripts/tunnel-service.mjs && git diff --check -- scripts/service.mjs scripts/tunnel-service.mjs` → passed; `npm run status` → local health 200; `npm run tunnel:status` → active. `npm run typecheck:server` → passed. `npm run deploy:cloudflare` → successful Worker version `e125b088-7e44-4c38-99ab-9af926a914b9`. Final public checks → health 200 with Oracle connected/SMTP configured, login and `/assets/index-DkwLod41.js` 200, malformed opportunity ID 400, and 35 `/api/auth/config` GETs 200. Oracle container remained healthy and was not touched.
  - Commit: none; commit intentionally deferred until independent review.

- [x] **Task 2 — Oracle/API integration QA**
  - Owner: Oracle/API QA.
  - Files: `tests/integration.ts`, `.superpowers/sdd/nov9-e2e/database-api-report.md`.
  - Do: Check expected-value aggregates against Oracle, authorization and transaction rollback cases, malformed/missing IDs, and auth config read budget using a controlled test-only mail transport.
  - Verify: `systemd-run --user --scope -p MemoryMax=1G -p MemorySwapMax=0 npm run test:integration` → 87 checks passed against Oracle, exit 0; no real email sent; generated records cleaned without truncating or reseeding tables.
  - Commit: none; commit intentionally deferred until independent review.

- [x] **Task 3 — UI and browser functional QA**
  - Owner: UI functional QA.
  - Files: `client/src/pages/Operations.tsx`, `tests/functional-browser.ts`, `.superpowers/sdd/nov9-e2e/ui-browser-report.md` and listed `test-results/` screenshots.
  - Do: Fix the hackathon registration selection state and verify role-based workflows, navigation, branding, and production client build in sequence using test-only OTP capture.
  - Verify: `npx tsc --noEmit --target ES2022 --module NodeNext --moduleResolution NodeNext --types node tests/functional-browser.ts` → passed. Bounded `tests/functional-browser.ts` → 16/16 passed; `tests/browser.ts` → 21/21 passed; `tests/brand-browser.ts` → 22/22 passed; `npm run build` → typechecks and Vite build passed with one non-failing import warning. No external email sent; test Oracle records cleaned.
  - Commit: none; commit intentionally deferred until independent review.

- [x] **Task 4 — DBMS team walkthrough and contribution documentation**
  - Owner: docs QA.
  - Files: `docs/team-viva/**`, authorized links in `README.md` and `docs/SQL-WORKSHOP.md`.
  - Do: Document team contribution allocations and provide a DBMS walkthrough/demo checklist based on verified schema/API behavior.
  - Verify: `git diff --check` → passed. No authorship claims or effort percentages were added.
  - Commit: none; commit intentionally deferred until independent review.

## Open follow-up

- [ ] **Verify real Gmail inbox delivery** only in a separately approved test with a designated recipient and explicit email-send authorization. For this session, health reported SMTP configured, but all OTP test flows used JSON capture; no external email was sent. Gmail inbox receipt is not verified.
- [x] **Independent gate**: runtime and QA evidence reviewed and accepted; requested retrospective spec/plan artifacts were added afterward. Final documentation/review and commit remain with root.
