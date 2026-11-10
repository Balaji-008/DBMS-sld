# README and release-documentation lane

Status: **READY FOR ROOT REVIEW.** The README was updated after the final app/mobile/release gates, deployment check, EGM review and media production reports were available. It links to confirmed source-tree deliverables. Generated browser images and logs under the ignored `test-results/` directory are listed only as local output paths, not as README download/image links.

## Files changed

- `README.md`
- `docs/showcase/README-FACTS.md`
- `.superpowers/sdd/mobile-showcase/readme-report.md`

## Documentation changes

- Added Amrita Bengaluru identity and the existing campus sketch, the public app URL, a practical local setup/stop/status path, Gmail OTP/bootstrap setup, and persistent service commands.
- Replaced the architecture prose with a Mermaid map of the browser, Cloudflare Worker/private VPC binding/named tunnel, local Express API and Oracle. Gmail OTP delivery and read-only APEX inspection are separate branches.
- Documented the 10 ER entities, 14 business relations, auth/upload tables, keys and constraints, normalized repeated relations, JSON compatibility mirrors, immutable placement snapshot, API-managed transactions, and APEX `PARSHU` SELECT boundary.
- Added concise role workflows, synthetic-data boundaries, mobile animation behavior, the fixed review-loop gates/cache semantics, and the bounded EGM/Hyperframes claims.
- Used the agreed viva responsibilities and explicitly avoided authorship/effort claims.
- Added final PPTX, PDF, slide contact sheet, MP4, poster, render contact sheet, share copy, QA report and verification-artifact links.
- Replaced the intermediate pending mobile/video and runner-failed status with the latest final gates and deployment evidence. The early `--wait`/`--scope` failure remains described only as preserved run history; the final resumed run passed through the corrected runner.
- Updated the historical 320px overflow note: old diagnostic screenshots predate the frozen release bundle and are not linked or presented as final captures.
- Described the completed adapted EGM reviewer rounds without claiming the upstream plugin was installed or invoked.

## Source review and checks

Read source files include `package.json`, `.env.example`, `scripts/provision.mjs`, `scripts/database.ts`, `scripts/configure-smtp.mjs`, `scripts/service.mjs`, `scripts/install-user-services.mjs`, `scripts/tunnel-service.mjs`, `scripts/deploy.mjs`, `scripts/review-loop.mjs`, `cloudflare/wrangler.jsonc`, `cloudflare/worker.ts`, `cloudflare/deployment.json`, `database/SCHEMA.md`, `database/001_schema.sql`, `docs/SQL-WORKSHOP.md`, the team viva documents, `docs/showcase/review-loop.md`, `docs/showcase/mobile-audit.md`, `docs/showcase/storyboard.md`, `docs/showcase/verification-results.json`, `docs/research/elephant-goldfish-analysis.md`, `tools/egm/README.md`, `tools/egm/review-record.md`, `deliverables/video/README.md`, `.agents/skills/brag/SKILL.md`, `brag-output/.runtime/package.json`, `brag-output/composition/AGENTS.md`, the final-gate/deployment/EGM handoff reports, and mobile showcase diagnostics.

- `git diff --check -- README.md docs/showcase/README-FACTS.md` — passed.
- Local Markdown links in `README.md` and `docs/showcase/README-FACTS.md` — resolved.
- Source-path existence checks for Cloudflare worker/deployment config, asset manifest, and Hyperframes local package/skill — passed.
- A read-only Python extraction from `docs/showcase/verification-results.json` retrieved gate counts, viewport arrays, capture inventory and review-loop attempts; no test was launched by this README update.
- A Python ZIP/PDF object scan found 5 PPTX slide entries and 5 PDF page objects [MEASURED]; files measured 342,280 and 214,265 bytes [MEASURED]. Structural validation and visual inspection are recorded separately in `plan-deck-report.md`.
- Inspected `automated-final-gate.md`, `release-ops-report.md`, `egm-report.md`, `tools/egm/review-record.md`, the video README/share copy, and final artifact paths. The underlying gates, deployment, EGM reviews and media render were performed by their respective lanes; none were rerun by the README lane.
- Confirmed the screenshot/log folder is gitignored; README references these by local output path in text, not as downloadable links. Final deliverables reside under `deliverables/` and are not ignored.
- No app build, browser run, database query, SMTP send, rendering, deployment or API health request was performed by this documentation lane.

## Remaining handoff

Root may now perform final integration and commit review. README claims remain scoped to the dated gate, deployment, media, and EGM reports; repeat release verification after future source changes or redeployment. No screenshots of live student data or claims about campus placement outcomes are added.
