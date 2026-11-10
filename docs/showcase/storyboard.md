# Amrita Placement Portal mobile showcase storyboard

Presentation length: five slides, for a DBMS viva with a live product demonstration. The companion brag video is approved at 22 seconds and 1080p, without narration, using the skill-bundled licensed CC BY music with attribution.

| Slide | Message | Visual | Evidence / source |
|---|---|---|---|
| 1 — Placement work, in one portal | A role-based placement portal ties the student/recruiter/placement-team experience to Oracle-backed workflows. | Amrita Bengaluru supplied white wordmark on wine; current mobile landing/dashboard screenshot once QA freezes a fresh capture. Until then, use a labeled capture placeholder. | `README.md`; fresh UI QA capture pending. |
| 2 — One request path, clear boundaries | React → Express → bound Oracle SQL is the application data path. Cloudflare Worker/tunnel routes traffic; Gmail SMTP carries OTP messages; APEX SQL Workshop supports read-only inspection. | Editable PowerPoint shapes and connectors, with Gmail and APEX branches visibly separate from record storage. | `README.md`, `docs/team-viva/DBMS-WALKTHROUGH.md`, source tree. |
| 3 — ER intent becomes constrained relations | Relationships, identity keys, foreign keys, unique/check rules, multi-valued relations, joins, aggregates and transactions are implemented in Oracle/API. | Small editable relationship map. Caption denormalized JSON mirrors and placement snapshots honestly. | `database/001_schema.sql`, `database/SCHEMA.md`; count of table definitions can be recomputed from DDL. |
| 4 — Workflows hold together on mobile | Show representative student, recruiter and placement-team journeys, plus the current mobile QA capture. | Fresh portrait screenshot after UI freeze plus concise workflow path labels. | `.superpowers/sdd/nov9-e2e/ui-browser-report.md`; new mobile QA report/captures pending. No coverage percentage. |
| 5 — Four responsibilities, one demo | Present corrected shared responsibilities and a short demo sequence; state QA coverage boundaries. | Four role cards and a final demo order. | `docs/team-viva/TEAM-CONTRIBUTIONS.md`, QA reports. |

## Evidence policy

Quantitative slide claims carry an inline evidence tag. Use only values obtained by counting source artifacts or retrieving raw machine output during this task. Do not promote figures copied from old Markdown prose into a results callout. If raw output is unavailable, omit the number or label it `[NOT MEASURED]`. No claim of exhaustive coverage, real inbox delivery, general security audit, or stored business PL/SQL is made.

## Video handoff (not production-ready)

The approved 22-second, 1080p video uses the installed and pinned primary Hyperframes brag workflow after the UI QA lane provides frozen captures. Story: campus sketch and supplied wordmark → fresh student dashboard → evidence-backed opportunity/application progression → Amrita wine-and-ivory brand close. The companion music is bundled with the skill under CC BY and must retain its attribution. Do not record credentials, OTPs, personal data, browser devtools secrets, or stale UI. Video production is owned by the video lane and waits for privacy-reviewed QA capture freeze and parent slot approval.
