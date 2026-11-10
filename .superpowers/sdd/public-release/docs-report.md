# Public release documentation and presentation lane

Status: DONE_WITH_CONCERNS

## Files changed

- `README.md`
- `docs/superpowers/specs/2026-11-10-public-release.md`
- `docs/superpowers/plans/2026-11-10-public-release.md`
- `docs/presentation-speaking-scripts/01-balcha-venkata-parswanadh.md`
- `docs/presentation-speaking-scripts/02-balaji-rayudu.md`
- `docs/presentation-speaking-scripts/03-bhavana-malladi.md`
- `docs/presentation-speaking-scripts/04-abhiram-support-demo.md`
- `docs/presentation-speaking-scripts/MASTER-HANDOFF.md`
- `deliverables/presentation/content.json`
- `deliverables/presentation/generate.js`
- `deliverables/presentation/amrita-placement-portal-showcase.pptx`
- `deliverables/presentation/amrita-placement-portal-showcase.pdf`
- `deliverables/presentation/preview/slide-1.png` through `slide-5.png`
- `deliverables/presentation/preview/contact-sheet.png`
- `.superpowers/sdd/public-release/docs-report.md`

## What changed

- README now links the intended public GitHub repo and live demo, uses a compatible clickable poster-to-MP4 link, links each speaker script, explains the local quickstart and Oracle/Gmail/Cloudflare/APEX boundaries, and records current QA with limits. It clarifies that email verification proves mailbox access, not enrollment or institutional affiliation.
- README documents the Nov 9 EGM reviews as historical and links the current independent Sol report/findings. The upstream EGM plugin is not claimed as installed or invoked.
- PPT slide 5 is a DBMS validation close about integrity, joins and atomic transactions. Team names/responsibilities were removed from content and notes. The author metadata is a generic project label. Slide 4 now cites the Nov 10 QA evidence.
- Four timed individual speaking scripts and one 5–7 minute handoff follow the team-agreed presentation allocation. Scripts explain current source behavior and explicitly avoid authorship claims, real data, secret values and unsupported institutional outcomes.
- A human-doc scan found only the synthetic `campus.test` domain in the README and two team viva docs; no real sender or test-recipient email addresses or home paths occur in the touched human-facing docs.

## Verification run

- `rg -c 'CREATE TABLE' database/001_schema.sql` → `18`; slide's table count is tagged `[DERIVED]` from this command.
- `node --check deliverables/presentation/generate.js` → passed.
- `systemd-run --user --scope -p MemoryMax=1G -p MemorySwapMax=0 -p CPUQuota=200% node generate.js` (from `deliverables/presentation/`) → exit 0.
- `systemd-run --user --scope -p MemoryMax=1G -p MemorySwapMax=0 -p CPUQuota=200% python $HOME/skills/pptx/scripts/office/validate.py amrita-placement-portal-showcase.pptx` → all validations passed.
- `systemd-run --user --scope -p MemoryMax=1G -p MemorySwapMax=0 -p CPUQuota=200% python $HOME/skills/pptx/scripts/office/soffice.py --headless --convert-to pdf amrita-placement-portal-showcase.pptx` → PDF exported successfully.
- `systemd-run --user --scope -p MemoryMax=1G -p MemorySwapMax=0 -p CPUQuota=200% pdftoppm -png -r 110 amrita-placement-portal-showcase.pdf preview/slide` → five current slide previews rendered.
- `pdfinfo amrita-placement-portal-showcase.pdf` → 5 pages; 960.009 × 540 pt pages.
- Manual visual inspection: all five rendered pages reviewed through the contact sheet and individual full-resolution previews; no text clipping, overlap or cut-off seen. Slide 4 was re-inspected after its QA count labels changed.
- Package-wide PPTX XML scan covered 5 slide parts, 5 notes parts, and 22 XML parts; no team names/IDs, ownership/contribution wording, or personal names in core properties were found. Extracted PDF text scan was also clean.
- README relative-link scan → 36 local links checked, none missing. `git diff --check` passed for the touched text/source paths.

## Evidence boundaries and outstanding release gate

- Fresh QA results are in `.superpowers/sdd/public-release/qa-publish-report.md` and `docs/showcase/public-device-results.json`. Automated counts describe exercised app/mobile journeys and the public landing layout regression only; they do not establish exhaustive coverage or physical-device certification. Email used JSON capture and no external mail was sent.
- This report does not claim a fresh EGM review of the final README/deck bundle. The linked EGM rounds are the earlier Nov 9 mobile-showcase review; the independent Sol source/security/publication review is current. Root should attach/link a new EGM review result before claiming the requested fresh EGM gate complete.
- No commit, GitHub creation, remote configuration, push, Oracle/API change, deployment or external email was performed by this lane. Parent owns snapshot approval and publication.

Commit: none (parent controls integration and public push).
