# Oracle placements portal implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the revised ER diagram as a usable local Oracle web application.
**Architecture:** React/Vite frontend, Express API, node-oracledb thin pool, Gmail SMTP. Frozen interface: docs/API-CONTRACT.md and database/SCHEMA.md.
**Tech stack:** Node 24, TypeScript, React, Express, Oracle Free, Nodemailer.

## Global constraints
- Real Oracle persistence; no SQLite/JSON fallback database or simulated dashboard counts.
- Gmail SMTP credentials only in gitignored `.env`; never print credentials or OTP codes.
- At most two Luna implementation workers concurrently; no parallel dependency installation/builds.
- Disjoint workers: database/**, client/**, server/src/**. Orchestrator owns root/scripts/tests/docs.
- Preserve existing Oracle/APEX and all study documents. New Oracle schema only. Public Worker custom domain and named private HTTP tunnel are deployed using Wrangler as subsequently requested; no other database.
- Student/recruiter/admin authorization, OTP one-use/expiry/attempt limits, transaction-safe duplicate protection.

## Tasks
- [x] Task 1 — Oracle data lane (Luna): database/001_schema.sql, 002_seed.sql, SCHEMA.md and task report. Additive setup with identity/FK/check/unique constraints. Cover all ten ER entities plus normalized composite/repeated attributes and auth/upload infrastructure. Verify SQL via docker exec sqlplus in dedicated schema and count seeded rows. Intended commit: feat(database): model placements and authentication in Oracle.
- [x] Task 2 — frontend lane (Luna): client/** only. Implement responsive professional login/OTP/register + role-aware dashboard and all workflows using frozen API. Type-check via npm run typecheck:client and build via npm run build:client after orchestrator installs. Intended commit: feat(client): build professional placements portal.
- [x] Task 3 — backend lane (Luna): server/src/** only after database interface exists. Implement every API-contract endpoint, Gmail transport, validation, role constraints, protected uploads. Verify npm run typecheck:server and integration via orchestrator tests. Intended commit: feat(api): implement Oracle-backed portal and Gmail OTP.
- [x] Task 4 — orchestration: root package/config, safe provisioning, migration/seed runner, SMTP configurator, durable bounded local server, docs and API/browser checks. Verify real Oracle reads/writes, authentication lifecycle without external mail in an isolated test mode, duplicate and unauthorized actions, production build, health HTTP, responsive browser if available. Intended commit: feat: integrate and verify local application.
- [x] Task 5 — Luna review: read-only review against frozen contract and source; fix critical/important issues, repeat covering verification, record observed evidence/limitations in PROGRESS.md. Intended commit: fix: address integration review findings.

## Verification commands
`npm run typecheck` checks client and server. `npm run build` builds the actual client. `npm run db:setup` additively applies schema and idempotent seed to dedicated Oracle user. `npm run test:integration` exercises authenticated, role-scoped persistence with controlled local mail capture. `npm run test:browser` exercises login rendering and main workflows sequentially with a single browser. Startup `npm run start:background`; health `curl --fail http://localhost:3000/api/health`. No commit until checks actually run; record failures honestly.
