# Master viva handoff — Amrita Placement Portal

**Target duration:** 5–7 minutes · **Format:** four speakers, one connected DBMS story · **Demo data:** synthetic records only

The sequence below uses the team-agreed presentation allocation documented in `docs/team-viva/TEAM-CONTRIBUTIONS.md`. It is a speaking plan, not evidence of historical authorship.

## Run of show

| Time | Speaker | Slides / demo | Focus |
|---|---|---|---|
| 0:00–1:20 | Balcha Venkata Parswanadh | Slide 1 → slide 2 | Product scope, request path, Oracle-only data storage, OTP mail and APEX boundary |
| 1:20–2:40 | Balaji Rayudu S | Slide 3 → student UI | User/student/contact relations, constraints, UI-to-API-to-Oracle path |
| 2:40–4:05 | Bhavana Malladi | Slide 3 → SQL Workshop | Opportunity/application/outcome and hackathon relations, joins, constraints, transactions |
| 4:05–5:15 | Balusu Naga Sri Abhiram | Slide 4 → slide 5 | Synthetic data, demo/QA boundaries, read-only inspection and close |
| 5:15–6:00 | All / moderator | Demo handoff | One application path: student applies → recruiter progresses → read-only query confirms related rows |

## Opening and transitions

**Balcha opens:** “We built a role-based placement portal, and today we’ll trace a placement workflow from the browser through the API to Oracle.”

**Balcha → Balaji:** “Now that the data path is clear, Balaji will show how the student interface maps to identity, profile and contact relations.”

**Balaji → Bhavana:** “The student and opportunity connect through an application. Bhavana will explain the integrity rules and SQL used around that workflow.”

**Bhavana → Abhiram:** “We have seen how the rows relate. Abhiram will show how we use synthetic demo records and inspect those rows safely.”

**Abhiram closes:** “The portal shows the workflow; the read-only SQL query makes the underlying relationships visible. Together, they demonstrate the DBMS design without presenting demo records as real campus outcomes.”

## Shared demo guardrails

- Use synthetic demo records and avoid showing personal fields, OTPs, credentials or private account details.
- Describe APEX as a separate read-only SQL inspection tool; application writes flow through the Express API.
- Explain the 14 business tables separately from the four authentication/file-support tables. APEX has read-only access to business tables only.
- Do not claim stored procedures or business triggers; the demonstrated multi-row transactions are implemented in the API.
- Present QA as exercised automated journeys and viewport coverage, not exhaustive testing or physical-device certification.
- The ER diagram is a conceptual model; the implemented schema contains additional workflow and platform-support relations. Use `database/SCHEMA.md` for exact implementation details.

## Source notes

The sequence is based on `docs/team-viva/TEAM-CONTRIBUTIONS.md`, `docs/team-viva/DBMS-WALKTHROUGH.md`, `docs/team-viva/DEMO-CHECKLIST.md`, `docs/SQL-WORKSHOP.md`, `database/SCHEMA.md`, and `database/001_schema.sql`. The scripts describe current system behavior and agreed presentation scope; they do not prove who historically authored each change.
