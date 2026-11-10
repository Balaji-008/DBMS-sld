> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

# Mobile Showcase — Execution Plan

## Coordinated lanes (disjoint ownership)

- [ ] **Lane 1 — Premium mobile UI**
  - Owner: UI lead; read-only audit until root's handoff signal.
  - Files: `client/**` only.
  - Do: implement the approved premium responsive UI while preserving the supplied Amrita identity and established app behavior.
  - Verify: root/UI lead's approved typecheck/build and mobile-browser QA commands; record raw results and fresh screenshots under the QA lane's owned paths.
  - Commit: deferred to root.

- [ ] **Lane 2 — Mobile QA and evidence**
  - Owner: QA.
  - Files: `tests/mobile-*.ts`, existing browser/functional test files, `test-results/**` screenshots, and `.superpowers/sdd/mobile-showcase/qa-report.md` only.
  - Do: audit current tests, add a mobile E2E matrix across student, recruiter and placement-team roles, capture the UI only after UI freeze, and report commands, raw artifact paths, measured outcomes, and coverage limits.
  - Verify: exact bounded test commands are recorded in QA report with exit codes and retrieved logs; no stale screenshot is presented as a new capture.
  - Commit: deferred to root.

- [ ] **Lane 3 — Documentation and presentation**
  - Owner: Luna (this lane).
  - Files: `docs/superpowers/specs/2026-11-09-mobile-showcase.md`, this plan, `docs/team-viva/**`, `README.md`, `deliverables/presentation/**`, `docs/showcase/**` except QA reports, `.superpowers/sdd/mobile-showcase/plan-deck-report.md`.
  - Do: correct responsibility docs; add showcase/storyboard and editable PPTX generator/content; create the five-slide deck from source-verified DBMS facts and QA-frozen captures; produce PDF if existing tooling permits.
  - Verify: `git diff --check`; `node --check deliverables/presentation/generate.js`; PPTX structural validator and visual inspection after parent releases the render slot. Record exact outcomes in plan-deck report.
  - Commit: deferred to root.

- [ ] **Lane 4 — Video**
  - Owner: Luna video lane; Hyperframes brag skill/capability already resolved by coordinator.
  - Files: `brag-output/**`, `deliverables/video/**`, `.agents/skills/brag/**`, and video-only isolated local dependency/config files required by that skill. Do not add root/global dependencies or overwrite the video skill globally.
  - Do: use the located Hyperframes brag workflow to produce the short professional video from frozen UI QA captures; record the parent-approved 22s / 1080p / no narration / bundled licensed CC BY music brief and actual output parameters.
  - Verify: document tool/capability provenance, source assets, render parameters, and inspect output after parent releases the render slot.
  - Commit: deferred to root.

## Sequencing and handoffs

1. Root coordinates roles and resource slots. UI lead performs read-only audit until root signals implementation may start. No browser/build/render/video work starts without an assigned slot.
2. Documentation lane extracts current schema and QA evidence; builds deck source and content data without rendering. Avoids edits to QA-owned reports and screenshots.
3. QA captures fresh mobile screenshots and reports exact test evidence after UI freeze. Video and final deck composition consume only those frozen artifacts.
4. Root reviews lane reports, approves a rendering slot, and coordinates final integration/review.

## Open constraints

- Lane ownership is strict: UI `client/**`; QA tests/captures/reports; docs lane listed above; video `deliverables/video/**` plus video-specific local skills. Backend, Oracle, services, credentials and dependencies are preserved.
- Historical counts in Markdown are not deck evidence. Retrieve current-session JSON/logs or report the measurement as unavailable.
- UI success requires premium treatment across all app surfaces, responsive support for phones, and mobile E2E coverage across student, recruiter and placement-team flows.
- JSON mirrors/snapshots are described as denormalized representations, not as a fully normalized relational design. Do not invent stored procedures or triggers.
