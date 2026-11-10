# Speaking script — Bhavana Malladi

**Identifier:** BL.EN.U4EAC24014 · **Suggested slot:** 75–90 seconds · **Viva allocation:** major shared Oracle schema, SQL and workflow constraints for companies, opportunities, applications, outcomes, hackathons, eligibility, reports and transactions

## Script

“I’ll focus on the placement and engagement relations. A company can have opportunities, and students apply through the `APPLICATIONS` relation. That relation connects a student to an opportunity and records workflow state. Eligibility is represented with related department and skill rows. This avoids making a comma-separated text field the source of relational matching.

The database protects those links with primary and foreign keys and uses uniqueness or check rules for participation and valid status values. Reports are built by joining the relevant rows and grouping them—for example, applications grouped by stage. The result should be explained from the query and the records it reads, not treated as an independent placement outcome statistic.

The API also groups related writes into transactions. For a profile update, the user, student and phone records are handled as one unit: if a step fails, the transaction can roll back instead of leaving a partial update. Multi-row workflow operations follow the same principle where needed.

Hackathons and registrations use their own relations, so registration is a database relationship that can be queried and constrained. I’ll show one application query and point out which keys protect the connection.”

## Demo cue

Use the safe example query from `docs/SQL-WORKSHOP.md`; describe the join path and a constraint visible in the DDL. Keep report values contextualized as synthetic/demo data.
