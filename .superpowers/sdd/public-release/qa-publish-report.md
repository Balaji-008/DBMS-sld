# Public release QA and publication lane

Status: DONE_WITH_CONCERNS

Files owned by this lane:
- `tests/public-device.ts`
- `docs/showcase/public-device-results.json`
- `scripts/public-release/export-public-snapshot.mjs`
- `.superpowers/sdd/public-release/qa-publish-report.md`

## Prepared

- Added a public landing regression for the coordinated browser slot. It measures horizontal overflow and pairwise bounding-box intersections among hero copy, CTA, GIF, campus container and campus sketch at 320, 360, 390, 430, 650, 651, 768, 900, 901, 1024, 1440 and 1920 CSS px. It also checks 200% text-size emulation at 320, 390, 650 and 651 CSS px, plus reduced-motion behavior.
- `docs/showcase/public-device-results.json` contains the measured rectangles, all 12 viewport widths, source hashes, screenshot paths, 19 passing checks and a passing reduced-motion result.
- Existing role-workflow coverage was run through the fixed review-loop gates; logs confirm 43 functional, 35 shell/browser, 29 brand/browser, 87 Oracle integration and 14 email/MIME checks passed.
- Added a snapshot exporter that copies Git-tracked and non-ignored project files without `.git` history, omits environment files, runtime uploads, test results, raw logs, cookies, node modules, runtime caches, render frames and course-paper/textbook directories, rejects symlinks, and redacts home paths and unnecessary emails in human-facing docs. It refuses an existing target and must only be used to create the isolated sibling snapshot after the parent GO.
- Exporter dry-run scanned 513 candidate files. It found home paths only in 10 report/doc files and two unnecessary email occurrences in `docs/verification-ledger.md`; it reported filenames/counts without printing any matched values. Dry-run created no directory.
- Created an isolated sibling snapshot at `../DBMS-sld-public` from the frozen docs/PPT outputs. The snapshot starts without the private checkout's `.git` history.
- Removed two obsolete internal Oracle review-package patch files from the snapshot; they contain private source snapshots and credential/contact examples and are not needed to reproduce or understand the public product.
- The public export replaces 48 embedded project-root prefixes with `$PROJECT_ROOT`, 9 other home paths with `$HOME`, and five unnecessary email occurrences in Markdown with `[redacted email]`. The export manifest records per-file source/export SHA-256 values and counts, and explains that preserved EGM hashes identify original review bytes rather than the sanitized export.
- Confirmed the original Oracle provisioning default is a JavaScript template expression that executes `randomBytes(24)` to generate a fresh password; it is not a static credential. The public snapshot now matches that dynamic source and preserves its original format/entropy. Replaced one human-facing login email placeholder with a reserved example address. The private checkout was not modified by the public-snapshot lane.
- Corrected four PPTX image-description attributes to semantic alt text and updated the public generator source to emit the same descriptions. Slide appearance and the matching PDF are unchanged; the PPTX Office validator passed after repackaging.
- A memory-only byte comparison of five configured auth/SMTP fields against the public snapshot returned zero matches. No configured values were printed.

## Commands and outcomes

- `node --check scripts/public-release/export-public-snapshot.mjs` — passed (exit 0).
- `node scripts/public-release/export-public-snapshot.mjs $HOME/dbms/.DBMS-sld-public-dryrun --dry-run` — passed (exit 0), 513 candidate files; 54 home-path replacements and 2 email replacements would be applied. No export was created.
- `node scripts/public-release/export-public-snapshot.mjs ../DBMS-sld-public` — exported the initial frozen project source snapshot; 515 files copied before two internal patches were excluded and release-only hardening scripts were added.
- `node scripts/public-release/sanitize-public-presentation.mjs ../DBMS-sld-public` — sanitized four image descriptions and updated the manifest.
- `node scripts/public-release/sanitize-public-source.mjs ../DBMS-sld-public` — replaced one user-facing email placeholder in the public copy only; dynamic Oracle password generation is preserved as-is.
- `node scripts/public-release/scan-public-snapshot.mjs ../DBMS-sld-public` — final precommit scan passed with no findings across 520 files (519 manifest-tracked project files plus the manifest), 224 text files, 38 Office XML/rels entries, PDF text/metadata and MP4 metadata. It reviewed 24 synthetic organization-seed email values in company-contact rows. The four public-release EGM bundle documents were included in that scan and manifest.
- Memory-only comparison against the configured `.env` values — five auth/SMTP fields checked; zero byte matches in the public snapshot; values not emitted.
- `python3 $HOME/skills/pptx/scripts/office/validate.py .../amrita-placement-portal-showcase.pptx` — passed (exit 0).
- `PUBLIC_QA_BASE_URL=http://127.0.0.1:3000 systemd-run --user --scope -p MemoryMax=1G -p MemorySwapMax=0 npx tsx tests/public-device.ts` — passed, 19 checks. Port 3000 was used for anonymous GETs only; no authentication or writes were attempted.
- `node scripts/review-loop.mjs --task mobile` — passed all 5 gates (typecheck, build, 29 brand/browser, 35 shell/browser, 43 three-role functional/browser). Current state: `test-results/review-loop/mobile/2026-11-10T16-18-48-266Z-07e79e72/state.json`.
- `node scripts/review-loop.mjs --task app` — passed all 4 gates (typecheck, build, 87 Oracle integration checks, 14 brand email/MIME checks). Current state: `test-results/review-loop/app/2026-11-10T16-20-11-091Z-3021f1ad/state.json`.
- Both runners used the repo's per-gate cgroup, heap, CPU and timeout limits. They ran sequentially, without overlapping browser instances. The integration and browser scripts use JSON email capture; logs confirm no external email was sent. Integration cleanup is scoped to the run's synthetic rows; the browser workflow cleanup completed in `finally`.
- The initial public-device harness attempt stopped before any layout measurement because the transpiler inserted an unavailable `__name` helper into an evaluated nested function. I replaced that helper with direct DOM rectangle collection, then reran the full device suite successfully. It was a test-harness issue, not an application finding.
- Configured Oracle password source adjudication — the default is a template literal with an executing `randomBytes(24)` interpolation, not a static value. The public file matches the private source; no secret value was printed.
- This report describes the prepublication state. Root authorized one initial public-snapshot commit and push after these final checks.

## Coverage and limitations

- The text-zoom regression doubles computed font sizes for visible text-bearing page elements. Browser chrome zoom cannot be controlled from page automation; this is a documented content-level emulation.
- Browser emulation is not physical-device certification.
- 200% text size is an in-page computed-font-size emulation, not operating-system or browser-chrome text zoom.
- Existing tests use JSON mail transport and synthetic `campus.test` identities. They establish workflow behavior against the configured local Oracle test schema, not production data or external inbox delivery.
- Four public-release EGM author/reviewer-input documents are included, but no fresh EGM review was run against this release snapshot. No public-release review result is claimed.
- Browser QA screenshot/log outputs under `test-results` remain excluded from export. The current anonymous landing screenshots are `test-results/public-release/landing-desktop.png` and `test-results/public-release/landing-mobile.png`; they contain only public landing content.

## Open

- The device-results JSON now contains measured rectangles, viewport widths, source hashes and screenshots, but a later UI source change requires rerunning it before freezing QA.
- Root-authorized publication follows this prepublication report; this report does not claim that the remote existed when it was written.
