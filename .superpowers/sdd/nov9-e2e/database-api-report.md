# Oracle and API QA report — 2026-11-09

## Live service and database

- `curl -sS --max-time 5 http://127.0.0.1:3000/api/health` returned `status=ok`, `database=connected`, `smtp_configured=true`, `mail_transport=smtp` on 2026-11-09. The public listener remains configured for SMTP; integration tests launch a separate ephemeral app configured for the test JSON capture transport.
- `npm run tunnel:status` returned `ActiveState=active`, `SubState=running`.
- The app DB connection is `PLACEMENTS_PORTAL` in the configured Oracle service. A live `SELECT table_name FROM user_tables ORDER BY table_name` returned the 18 schema tables listed below. The test run did not alter schema or reset seed data.
- `USER_TAB_PRIVS` confirms exactly 14 `SELECT` grants to APEX schema/user `PARSHU`: `APPLICATIONS`, `CERTIFICATES`, `COMPANIES`, `DEPARTMENTS`, `HACKATHONS`, `HACKATHON_REGISTRATIONS`, `INTERNSHIPS`, `OPPORTUNITIES`, `OPPORTUNITY_ELIGIBLE_DEPARTMENTS`, `OPPORTUNITY_SKILLS`, `PLACEMENTS`, `STUDENTS`, `STUDENT_PHONE_NUMBERS`, and `USERS`. No grant was present for `OTP_CHALLENGES`, `OTP_EMAIL_LOCKS`, `SESSIONS`, or `UPLOADS`. `PARSHUSQLWorkshop` is not the Oracle grantee name visible in this instance; the installed APEX schema/workspace account is `PARSHU`, matching `docs/SQL-WORKSHOP.md`.
- A live `USER_CONSTRAINTS` query showed primary, unique, foreign-key, and check constraints on the expected entities. In particular, unique constraints exist for `(student_id, opportunity_id)` in `APPLICATIONS`, `application_id` in each outcome table, `(hackathon_id, student_id)` in registrations, `(student_id, phone_number)` for phones, and unique challenge/session/upload keys. The API checks verified duplicate application, placement and hackathon registration conflicts through HTTP responses.

## Actual database/DBMS feature map

There are 18 tables in `PLACEMENTS_PORTAL`:

| Area | Tables | Oracle-backed behavior in this schema |
|---|---|---|
| Catalog and identities | `DEPARTMENTS`, `COMPANIES`, `USERS`, `STUDENTS`, `STUDENT_PHONE_NUMBERS` | Identity numeric keys, unique natural keys, role/status/score checks, foreign keys, normalized repeated phone rows, JSON CLOB skills |
| Placement workflow | `OPPORTUNITIES`, `OPPORTUNITY_ELIGIBLE_DEPARTMENTS`, `OPPORTUNITY_SKILLS`, `APPLICATIONS`, `PLACEMENTS`, `INTERNSHIPS` | Snapshot JSON plus normalized requirement relations, unique student/opportunity application, unique application outcome, referential integrity, checked workflow enums and date/score constraints |
| Hackathons and certificates | `HACKATHONS`, `HACKATHON_REGISTRATIONS`, `CERTIFICATES` | Hackathon linked to opportunity, event date/mode/team constraints, unique student registration per event, certificate ownership FK |
| Authentication and files | `OTP_CHALLENGES`, `OTP_EMAIL_LOCKS`, `SESSIONS`, `UPLOADS` | App-generated opaque keys, hashed OTP/session material, `SELECT FOR UPDATE` resend lock, unique token/stored-name constraints, file-size and kind checks, user FKs |

This feature map is derived from `database/001_schema.sql`, `database/SCHEMA.md`, and live metadata. There are no triggers or stored procedures in the current schema interface; transaction boundaries, OTP hashing, Aadhaar encryption, protected-file authorization, and dashboards/reports are implemented in the Node API.

## API integration coverage

Command, run timestamp, and result:

```text
2026-11-09 12:36 Asia/Kolkata
systemd-run --user --scope -p MemoryMax=1G -p MemorySwapMax=0 npm run test:integration
INTEGRATION RESULT: 87 checks passed against Oracle; exit code 0. External email was not sent.
```

The first baseline run before additions passed all 54 original checks; the expanded suite later passed 74 before adding independent aggregate checks. The current run adds independent Oracle comparisons for admin/recruiter reports and admin/recruiter/student dashboard metrics, certificate deletion by owner/admin and denial for another student/recruiter, invalid-FK opportunity rollback, malformed/missing ID behavior, and 35 repeated auth-config GETs. Test identities are run-suffixed; created rows and upload files are cleaned in `finally`; no table is truncated or reseeded and no real email is sent. Browser tests are owned by the UI QA worker.

### Backend defects found and reverified

- Earlier probe: authenticated `GET /api/opportunities/not-a-number` returned HTTP 500 with `{"error":"Internal server error"}` and server log `NJS-105`. Runtime owner added numeric ID validation; current run confirms 400. Control probes still confirm malformed `/companies/not-a-number` PATCH returns 400 and nonexistent numeric company PATCH/opportunity GET return 404. None changed valid rows.
- UI QA separately observed `/api/auth/config` return 429 under repeated browser role switches. Runtime owner excluded non-POST auth routes (and logout) from the IP limiter; current integration run called `/auth/config` 35 times and all succeeded.
- Invalid eligible-department FK in opportunity creation returns 409; a follow-up Oracle count found no parent opportunity left, and transaction rollback prevented child requirement rows from persisting.
- Dashboard metric aggregates for all three roles matched independently queried Oracle values. Admin report total students, placed students, and average offer matched independent Oracle aggregates. Recruiter report student/placed counts, department breakdown, company offer count, and average matched company-scoped independent aggregates.
- Certificate delete matrix passed: owner and admin may delete; unrelated student and recruiter receive 404, and rows remain after denied requests.

Covered API groups include health/auth/OTP/session, public departments, companies, admin student directory and student profile, uploads, opportunities/applications, placement and internship outcomes, certificates, hackathons/registrations, dashboards/reports, pending recruiter approval, and route/error behavior. Role scopes and the listed negative cases were checked over HTTP against Oracle.

## Coverage boundaries

- Independent Oracle comparisons cover dashboard metrics for all roles and the exercised admin/recruiter report summary and scope fields; not every report field or dashboard activity/funnel entry has an independent expected-value assertion.
- The expanded suite checks OTP cooldown, one-use, expiry, five bad attempts, and concurrent locking; it does not separately time an OTP expiry at the exact 300-second edge.
- API handlers intentionally do not expose department mutations; department CRUD is not part of the API contract (only public department listing).
- SQL injection-shaped identifiers and all invalid-payload permutations were not exhaustively fuzzed. The malformed opportunity identifier probe is recorded above. Queries inspected in the routes use bind variables; this run did not claim a general SQL-injection audit.
- Existing suite also checks admin certificate issuance and recruiter access to the student certificate document through an applicant relationship.

No backend source changes or schema changes were made by this QA task. Integration test additions are in `tests/integration.ts`.
