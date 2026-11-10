# Public-release review source allowlist

All paths are relative to the root of the public snapshot and portable to any clone. The list is complete for the fresh review. Do not search outside it.

## Target and review contract
- `tools/egm/public-release/release-draft.md`
- `tools/egm/public-release/review-context.md`
- `tools/egm/public-release/source-allowlist.md`
- `tools/egm/public-release/goldfish-review-prompt.md`
- `tools/egm/upstream/docs/codex.md`
- `tools/egm/upstream/agents/design_critic.md`
- `tools/egm/upstream/resources/document_standards/feature-spec-standard.md`

## Product and data boundaries
- `README.md`
- `docs/API-CONTRACT.md`
- `docs/SQL-WORKSHOP.md`
- `docs/team-viva/DBMS-WALKTHROUGH.md`
- `docs/team-viva/DEMO-CHECKLIST.md`
- `database/SCHEMA.md`
- `database/001_schema.sql`
- `server/src/auth-routes.ts`
- `server/src/auth.ts`
- `server/src/routes.ts`
- `server/src/upload-routes.ts`

## Landing and QA evidence
- `client/src/pages/Landing.tsx`
- `client/src/pages/Login.tsx`
- `client/src/pages/Profile.tsx`
- `client/src/styles.css`
- `design/public-patterns/campus-contours.md`
- `docs/showcase/public-device-results.json`
- `.superpowers/sdd/public-release/qa-publish-report.md`
- `tools/egm/public-release/public-qa-followup.md`
- `tools/egm/public-release/sol-goldfish-final.md`

## Presentation and video artifacts
- `deliverables/presentation/content.json`
- `deliverables/presentation/generate.js`
- `deliverables/presentation/amrita-placement-portal-showcase.pptx`
- `deliverables/presentation/amrita-placement-portal-showcase.pdf`
- `docs/presentation-speaking-scripts/01-balcha-venkata-parswanadh.md`
- `docs/presentation-speaking-scripts/02-balaji-rayudu.md`
- `docs/presentation-speaking-scripts/03-bhavana-malladi.md`
- `docs/presentation-speaking-scripts/04-abhiram-support-demo.md`
- `docs/presentation-speaking-scripts/MASTER-HANDOFF.md`
- `deliverables/video/README.md`

## Excluded sources
Do not read `.env` or other environment/config secret files, Git history, `.git`, test-result folders, raw logs, screenshots, runtime databases, user uploads, email addresses or messages, cookies, OTP/session data, network resources, external accounts, course papers/textbooks, or any path not explicitly listed above. In particular, do not open screenshot filenames mentioned by `public-device-results.json`; review its sanitized measurements and limitations only.
