# DBMS viva demonstration checklist

## Presenter handoffs

- Balcha: architecture, backend integration, login/SMTP boundary.
- Balaji: responsive UI and user/student/contact/certificate/auth relation bindings.
- Bhavana: companies/opportunities/applications/outcomes/hackathons, eligibility, reporting and transaction SQL.
- Abhiram: synthetic sample-data, documentation, rehearsal and demo QA support.

This is the agreed responsibility split, not a commit-history or effort claim.

## Before presenting

- Confirm the local app, Oracle connection, and `GET /api/health` are available; if showing the public hostname, check it separately.
- Use synthetic demonstration records or accounts prepared for the viva. Never assume `@campus.test` can receive email.
- Open SQL Workshop under `PARSHU` and use only the read-only business-table examples in `docs/SQL-WORKSHOP.md`.
- Keep `.env`, OTP email, challenge hashes, session hashes, raw Aadhaar values, and protected document contents off-screen.
- Use current verification results from `PROGRESS.md`; do not quote old counts or infer why an endpoint was unavailable without logs.

## Walkthrough by role

1. **Student:** Sign in only if a reachable demo account is configured. Open Opportunities, explain eligibility from CGPA/backlogs/department, then show Applications, Profile, and Certificates. After an action, query `APPLICATIONS` joined to the opportunity/student for the result; never select Aadhaar columns.
2. **Recruiter:** Show company-scoped opportunities and application stages. After a status change, query the target application row. Explain that recruiter scoping is applied in the API and role checks.
3. **Placement team/admin:** Show pending recruiter approvals or reports if demo data supports it. Explain grouped SQL and company/department scope. Do not mutate real records solely for the viva.
4. **Database:** Run the safe table-list, student/department join, opportunity listing, application listing, certificate listing, or placement snapshot query from `docs/SQL-WORKSHOP.md`.

## After a demonstrated write

Refresh the UI and query the corresponding business relation to show persistence. For a create operation, inspect only identifiers, labels, status and non-sensitive fields needed to support the explanation. If a prepared action is unavailable, explain its schema/API design without claiming that it was executed successfully during the session.
