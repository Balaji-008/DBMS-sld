# Documentation and presentation lane — checkpoint

Status: DONE_WITH_CONCERNS — the editable five-slide deck and five-page PDF are generated, structurally validated, and visually inspected. Root owns final integration; no commit was made.

Files changed:
- `docs/superpowers/specs/2026-11-09-mobile-showcase.md`
- `docs/superpowers/plans/2026-11-09-mobile-showcase.md`
- `docs/team-viva/TEAM-CONTRIBUTIONS.md`
- `docs/team-viva/DBMS-WALKTHROUGH.md`
- `docs/team-viva/DEMO-CHECKLIST.md`
- `README.md`
- `docs/showcase/storyboard.md`
- `deliverables/presentation/content.json`
- `deliverables/presentation/generate.js`
- `deliverables/presentation/amrita-placement-portal-showcase.pptx` (342,280 bytes)
- `deliverables/presentation/amrita-placement-portal-showcase.pdf` (214,265 bytes; five pages)
- `deliverables/presentation/preview/contact-sheet.png` and five slide PNG previews

Commands run and observed results:
- `node --check deliverables/presentation/generate.js` → passed after converting the generator to ESM imports for this repository's `type: module` setting.
- `systemd-run --user --scope -p MemoryMax=1G -p MemorySwapMax=0 -p CPUQuota=200% node deliverables/presentation/generate.js` → generated editable PPTX.
- `python $HOME/skills/pptx/scripts/office/validate.py deliverables/presentation/amrita-placement-portal-showcase.pptx` → all validations passed.
- `systemd-run --user --scope -p MemoryMax=1G -p MemorySwapMax=0 -p CPUQuota=200% python $HOME/skills/pptx/scripts/office/soffice.py --headless --convert-to pdf deliverables/presentation/amrita-placement-portal-showcase.pptx` → PDF export passed.
- `systemd-run --user --scope -p MemoryMax=1G -p MemorySwapMax=0 -p CPUQuota=200% pdftoppm -png -r 110 deliverables/presentation/amrita-placement-portal-showcase.pdf deliverables/presentation/preview/slide` → five slide previews rendered; inspected every slide and the contact sheet. One iteration fixed the screenshot-caption collision and made Balcha's Major role explicit.
- `pdfinfo deliverables/presentation/amrita-placement-portal-showcase.pdf` → 5 pages, 960.009 × 540 pt; output size 214,265 bytes.
- `rg -c 'CREATE TABLE' database/001_schema.sql` → `18`; deck labels this `[DERIVED]` and records the count method.
- `node --check deliverables/presentation/generate.js` → passed.
- `python3 -m json.tool deliverables/presentation/content.json` → passed.
- `git diff --check -- README.md docs/team-viva/TEAM-CONTRIBUTIONS.md docs/team-viva/DBMS-WALKTHROUGH.md docs/team-viva/DEMO-CHECKLIST.md deliverables docs/showcase docs/superpowers/specs/2026-11-09-mobile-showcase.md docs/superpowers/plans/2026-11-09-mobile-showcase.md` → passed for tracked changes in those paths.

Evidence and decisions:
- Corrected the team responsibility split as team-stated allocation, without commit attribution or effort percentages.
- Deck content covers the actual React/Express/bound SQL/Oracle path, Cloudflare and Gmail/APEX branches, relational schema/constraints/normalization caveats, SQL aggregation/joins/transactions, mobile role workflows and the corrected team split.
- The table count is derived from the current DDL source. QA machine JSON and raw logs are now available; the draft slide records 29 brand checks, 35 shell/navigation checks, and 43 three-role functional checks as `[MEASURED]`, with each value pointing to its retrieved log. No production-performance, campus-outcome, or external-delivery claim is made.
- Generator uses the canonical fresh QA captures `test-results/showcase/dashboard-mobile.png` and `test-results/showcase/apply-mobile.png`; it renders labeled placeholders if either is unavailable. Historical screenshots are not used as current product evidence.

Pending:
- Root README worker owns final root README polish and should add links to the artifacts listed above.
- Hyperframes video belongs to the separate video lane; the approved brief is 22 seconds at 1080p, without narration, with bundled CC BY music and attribution.

Commit: none; root coordinates final integration.

Brand cleanup: renamed outputs to `amrita-placement-portal-showcase.pptx` and `.pdf`, updated generator metadata/visible labels to “Amrita Placement Portal,” and renamed the storyboard heading. A Python ZIP scan found no former-brand token in PPTX slide XML, speaker notes or document properties; case-insensitive source scans found no stale brand label in the presentation sources or showcase docs. Final visual contact sheet was re-rendered and inspected after these text changes.

Concerns: no presentation defects remain; root owns README linking and final integration.
