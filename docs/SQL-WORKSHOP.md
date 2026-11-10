# Inspect the application in Oracle APEX

The existing APEX workspace is `PARSHU`, using schema `PARSHU`. Application tables belong to `PLACEMENTS_PORTAL` in the same `FREEPDB1` database. Read-only SELECT access was granted to `PARSHU` for the fourteen business tables. Authentication challenges, dispatch locks, sessions and upload metadata were not granted.

Open **SQL Workshop → SQL Commands** and run one statement at a time. Use the fully qualified table names; no change of parsing schema is required.

```sql
SELECT table_name FROM all_tables
WHERE owner = 'PLACEMENTS_PORTAL' ORDER BY table_name;
```

```sql
SELECT s.roll_number, u.full_name, u.email, s.cgpa
FROM placements_portal.students s
JOIN placements_portal.users u ON u.id = s.user_id;
```

```sql
SELECT id, title, type, role, ctc, location, status
FROM placements_portal.opportunities;
```

```sql
SELECT id, student_id, opportunity_id, status, applied_at
FROM placements_portal.applications;
```

```sql
SELECT student_id, certificate_name, issuer, completion_date
FROM placements_portal.certificates;
```

```sql
SELECT p.id, p.role, p.ctc, p.location, p.min_cgpa,
       p.eligible_departments_json, p.required_skills_json
FROM placements_portal.placements p;
```

The application uses Oracle SQL/PLSQL scripts for schema and seed setup and the Node Oracle thin driver for bound SQL queries and transactions. The frontend uses React and is served separately from the existing APEX application.

For the entity relationships, constraints, joins, aggregation, and transaction examples to discuss in a DBMS viva, see [the DBMS walkthrough](team-viva/DBMS-WALKTHROUGH.md). The team's responsibility split is documented in [team contributions](team-viva/TEAM-CONTRIBUTIONS.md).
