# DBMS walkthrough

## Responsibility split for the DBMS explanation

Balaji Rayudu S (BL.EN.U4EAC24011) has major frontend/UI responsibility and shares Oracle relation DDL, SQL and constraint responsibility for users, students, contact phone relations, certificates, authentication relations and frontend/API schema bindings. Bhavana Malladi (BL.EN.U4EAC24014) has major shared Oracle relation DDL, SQL and constraint responsibility for companies, opportunities, applications, placement/internship outcomes, hackathons, eligibility, reporting and transactions. Balcha Venkata Parswanadh (BL.EN.U4EAC24012) has the major core architecture/backend integration/login/SMTP responsibility. Balusu Naga Sri Abhiram (BL.EN.U4EAC24013) supports sample data, documentation, demo QA and rehearsal. This is a team-stated responsibility plan, not verified commit attribution.

## 1. Architecture and database boundary

The browser UI is React/TypeScript (`client/src/`). It sends same-origin HTTP requests to the Express API (`server/src/`). The API validates inputs, checks the authenticated role and ownership, and uses the Oracle thin driver through `server/src/db.ts`. SQL uses bind variables. Oracle Database in `FREEPDB1`, schema `PLACEMENTS_PORTAL`, is the application's only database; Cloudflare forwards API traffic and does not store application records. Gmail SMTP sends sign-in codes, while Oracle stores OTP challenge hashes, expiry/attempt state, dispatch locks, and hashed session tokens. Do not describe Gmail as an OTP database.

The schema installer wraps additive DDL blocks in PL/SQL exception handling to tolerate already-existing objects. These are schema-setup wrappers; the application does not define custom business procedures, triggers, views, or indexes in the reviewed DDL. The DDL contains table constraints and Oracle identity columns.

## 2. ER design to relational schema

The ten main ER entities map to `COMPANIES`, `USERS`, `STUDENTS`, `OPPORTUNITIES`, `APPLICATIONS`, `PLACEMENTS`, `INTERNSHIPS`, `HACKATHONS`, `HACKATHON_REGISTRATIONS`, and `CERTIFICATES`. `INTERNSHIPS` represents the ER internship-record entity. `DEPARTMENTS` supports student and opportunity relationships. Auth and file metadata are represented in `OTP_EMAIL_LOCKS`, `OTP_CHALLENGES`, `SESSIONS`, and `UPLOADS`.

One-to-many relationships use foreign keys: a company has opportunities; a student has applications and certificates; an opportunity has applications. `STUDENTS.user_id` is unique, so a student profile maps one-to-one to a user. `PLACEMENTS.application_id` and `INTERNSHIPS.application_id` are each unique, enforcing at most one outcome record of that kind per application. A hackathon is linked one-to-one with its opportunity through unique `HACKATHONS.opportunity_id`.

Composite keys enforce relationship-level uniqueness: `(opportunity_id, department_id)` in `OPPORTUNITY_ELIGIBLE_DEPARTMENTS` and `(opportunity_id, skill_name)` in `OPPORTUNITY_SKILLS`. `STUDENT_PHONE_NUMBERS` separates repeated phone values and uniquely constrains `(student_id, phone_number)`. Applications and hackathon registrations each have a unique pair constraint to prevent duplicate student participation.

The design reduces update anomalies by keeping repeated phones, eligibility departments, and required skills in separate relations. Opportunity JSON columns mirror department/skill arrays for convenient serialization, so the schema is not claimed to be strictly normalized in every representation. Placement rows retain JSON mirrors of eligible departments and skills as an outcome snapshot. This deliberate snapshot preserves the requirements recorded with an offer if the source opportunity later changes. Student skills are stored as a JSON array in a CLOB; this is a pragmatic representation rather than a separate skill catalog.

## 3. Integrity constraints worth showing

- Primary keys use Oracle identity numbers for business entities; authentication challenges, sessions and upload IDs use application-generated random strings.
- Foreign keys preserve entity relationships. Cascades are used where child data is owned by a deletable parent, such as user-to-student, opportunity-to-hackathon and student-to-phone/certificate.
- `CHECK` constraints restrict role/status values, booleans, CGPA range, nonnegative compensation/backlogs, date order, JSON validity and upload size.
- `UNIQUE` constraints protect emails, roll numbers, company codes, duplicate applications, registrations, and one-to-one outcome links.
- `USERS.email` and OTP email values are constrained to lowercase. Oracle validates data integrity even if a request bypasses normal UI controls.

## 4. SQL examples for oral explanation

Student names and departments are joined from their owning relations rather than copied into every application row:

```sql
SELECT d.name AS department, COUNT(*) AS student_count
FROM placements_portal.students s
JOIN placements_portal.departments d ON d.id = s.department_id
GROUP BY d.id, d.name
ORDER BY d.name;
```

Application lists combine the application relationship with student, opportunity and company display data:

```sql
SELECT a.id, u.full_name, o.title, c.name AS company, a.status
FROM placements_portal.applications a
JOIN placements_portal.students s ON s.id = a.student_id
JOIN placements_portal.users u ON u.id = s.user_id
JOIN placements_portal.opportunities o ON o.id = a.opportunity_id
JOIN placements_portal.companies c ON c.id = o.company_id
ORDER BY a.applied_at DESC;
```

Count applications by workflow stage with grouping and aggregation:

```sql
SELECT status, COUNT(*) AS application_count
FROM placements_portal.applications
GROUP BY status
ORDER BY status;
```

The application's `/reports` query similarly joins departments, students, applications, opportunities, companies and placements; it uses `COUNT(DISTINCT ...)`, `AVG`, and role-dependent filters so recruiter reports stay scoped to that recruiter's company.

## 5. Transactions and concurrency

`transaction()` in `server/src/db.ts` commits after the callback succeeds and rolls back when it throws. Multi-row operations use it when partial completion would leave inconsistent state. For example, editing a profile updates the user and student rows and replaces the phone-number set as one unit. Creating an opportunity and its normalized department/skill rows is grouped together. Hackathon creation inserts both the opportunity and hackathon row atomically. Placement creation locks/checks the selected application and inserts its outcome in a transaction. These are application-managed transactions; they are not stored procedures.

OTP resend coordination locks the email row with `SELECT ... FOR UPDATE`, serializing concurrent reservations for a 60-second dispatch window. Application and registration duplicate attempts are additionally guarded by unique constraints; an API check alone would not safely prevent simultaneous duplicate requests.

## 6. Eligibility and history

Eligibility uses the student's CGPA, active backlog count and department against opportunity requirements. The API checks before an application, while schema constraints independently protect data shape and duplicate application uniqueness. Placement records copy job details and requirement values from the source opportunity as a historical snapshot. Student/company/opportunity context for outcomes is otherwise derived through joins to the application and opportunity relations.

## 7. Safe live demonstration

Use synthetic `@campus.test` seed identities only for controlled demonstration; they are not real inboxes. Do not show raw Aadhaar values, OTP values, OTP hashes, session-token hashes, or secret configuration. `docs/SQL-WORKSHOP.md` contains read-only examples for the existing `PARSHU` APEX schema user. It grants visibility to the fourteen business tables only; do not query auth challenge, dispatch-lock, session, or upload metadata tables from that workshop account.
