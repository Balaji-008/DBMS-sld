# Task 1 — Oracle data lane

## Delivered

- `database/SCHEMA.md` documents the authoritative Oracle table and column contract, types, constraints, identity behavior, joins, and API mapping.
- `database/001_schema.sql` adds 17 tables with identity keys for relational entities, `VARCHAR2` random IDs for challenges/sessions/uploads, foreign keys, checks, unique constraints, JSON checks, and bounded upload size. Each table create catches only ORA-00955. Statements are separated by `-- @statement` for the Node runner.
- `database/002_seed.sql` uses lookup-based `MERGE` statements and database-generated IDs. It seeds 4 departments, 5 fictional companies, admin/recruiter/student identities, four students named from the reference ER, nine opportunities, normalized eligibility/skills, application stages, one placement, one internship, two hackathons and registrations, phone contacts, and certificates.

## Requirements covered

- Models the ten ER entities plus departments, normalized student phone numbers, normalized opportunity skills/eligible departments, OTP challenges, sessions, and uploads.
- Includes student/recruiter/admin roles, recruiter approval state (`is_active`), OTP sent flag and timestamp, one-use code/session hash storage, expiry and bounded attempts, pending registration JSON, and remember-me session support.
- Student Aadhaar fields hold only encrypted ciphertext and the last four digits; no raw or sample Aadhaar is seeded. Contact and certificate examples are synthetic. Test `.test` email addresses are labeled as non-deliverable seed identities in the schema documentation.
- Placement rows preserve job and eligibility snapshots and are unique per application. Internships are likewise unique per application. Application and hackathon registration duplicate constraints are enforced in Oracle.

## Checks and remaining integration

- Static inspection confirmed 17 DDL statement blocks and 65 seed statement blocks, each using the requested delimiter. Oracle object creation and seed execution remain for the orchestrator’s dedicated-schema setup; this worker did not mutate the existing Oracle/APEX installation.
- Backend should store only an authenticated encrypted Aadhaar value in `aadhaar_number_enc`, use the random IDs for `OTP_CHALLENGES`/`SESSIONS`/`UPLOADS`, and consume eligibility/skill normalized rows or their documented JSON mirrors consistently.
- No unresolved schema design issue identified. Actual Oracle-version validation is pending the orchestrator applying the scripts to the new application schema.
