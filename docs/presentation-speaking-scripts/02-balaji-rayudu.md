# Speaking script — Balaji Rayudu S

**Identifier:** BL.EN.U4EAC24011 · **Suggested slot:** 75–90 seconds · **Viva allocation:** frontend/UI and shared user, student, contact, certificate and authentication relation SQL

## Script

“I’ll demonstrate the student side and connect one interface action to its database model. A student profile is split between identity data in `USERS` and academic data in `STUDENTS`. Phone numbers are stored as child relation rows in `STUDENT_PHONE_NUMBERS`, so a student can have multiple contacts without packing a repeating list into one column.

The client calls an API endpoint for each action. The server checks the session and role, then runs parameterized SQL. In the schema, primary keys identify rows, foreign keys link the student to its user, and uniqueness and check constraints protect values such as email and role. Certificates are related records rather than fields copied into the student row. Authentication challenges and sessions are also stored in Oracle, but the APEX read-only grant covers the fourteen business tables, not these private support tables.

In the demo, I’ll open a student profile, show the contact section, then move to an eligible opportunity. The application row connects the student and opportunity. This gives us a direct path from a UI workflow to relational integrity: the application cannot refer to a nonexistent student or opportunity.

The frontend and database stay separated by the API, so validation and authorization happen before a write reaches Oracle.”

## Demo cue

Show the profile/contact UI and an application workflow using a synthetic demo account. If using SQL Workshop, use only the approved read-only business-table queries from `docs/SQL-WORKSHOP.md` and avoid private student values.
