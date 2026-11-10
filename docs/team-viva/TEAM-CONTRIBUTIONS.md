# Team responsibilities and viva allocation

This is the team's responsibility and presentation split. It does not assert commit history, effort percentages, or exclusive authorship. Each member should explain the assigned area using the current source and verified behavior.

| Member | Responsibility | Current implementation to explain |
|---|---|---|
| **BL.EN.U4EAC24011 — Balaji Rayudu S** | **Major: frontend/UI and shared Oracle schema work** | Lead the React role-based interface in `client/src/`. Share Oracle relation DDL, SQL and constraints focused on users, students, contact phone relations, certificates and authentication relations, plus the frontend/API SQL bindings. Explain how UI actions call API methods and how the related Oracle rows are read or updated. |
| **BL.EN.U4EAC24012 — Balcha Venkata Parswanadh** | **Major: core architecture, backend integration, login and SMTP** | Explain overall React → Express → Oracle architecture, backend integration, login/OTP flow and Gmail SMTP transport. Relevant code includes `server/src/app.ts`, `server/src/db.ts`, `server/src/auth-routes.ts`, and `server/src/mail.ts`. Oracle stores OTP challenge/session state; Gmail carries the email. |
| **BL.EN.U4EAC24013 — Balusu Naga Sri Abhiram** | **Support: sample data, documentation and demo QA** | Support synthetic sample-data preparation, documentation checks, walkthrough rehearsal and demo QA. Explain the prepared-data and verification boundaries without claiming sole ownership of the schema or code. |
| **BL.EN.U4EAC24014 — Bhavana Malladi** | **Major: shared Oracle schema, SQL and workflow constraints** | Share Oracle relation DDL, SQL and constraints focused on companies, opportunities, applications, placement/internship outcomes, hackathons, eligibility, reporting and transactions. Explain joins, aggregates, uniqueness/integrity rules and atomic multi-row operations in the API. |

## Suggested viva order

1. **Balcha:** Introduce the placement workflow and show the data path: React → Express → bound Oracle SQL. Explain the Cloudflare Worker/private tunnel and Gmail SMTP side branch, with Oracle retaining application records and OTP/session state.
2. **Balaji:** Demonstrate a mobile-friendly role workflow and trace a UI action through its API binding to user/student/contact/certificate or authentication relations. Explain PK/FK/unique/check rules in the assigned schema area.
3. **Bhavana:** Show the opportunity/application/outcome and hackathon relationships. Explain eligibility, constraints, one report join/aggregate, and a transaction that prevents partial writes.
4. **Abhiram:** Walk through the synthetic demo data and checklist, then show a read-only APEX SQL Workshop query. State which journeys and evidence were actually available for this demonstration.

Any personal-contribution statement should be framed as this team-agreed responsibility allocation. The repository alone does not establish historical authorship.
