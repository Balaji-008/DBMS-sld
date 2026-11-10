> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

# Public GitHub Release — Plan

## Lanes and frozen boundaries
The parent coordinates execution and the final public push. Keep concurrent work to four light lanes and one heavy browser/build/render lane at a time. Frozen owners: Terra handles `client/**` and design-pattern UI changes; Luna owns QA, publication probes, and public-source/privacy review; Sol performs read-only independent EGM/security review; Luna owns documentation and presentation files listed below. No lane changes Oracle, SMTP, or external service configuration.

## Tasks

- [ ] **Task 1 — Correct landing animation overlap**
  - Files: `client/**` (UI lane only)
  - Do: Fix the identified landing animation overlap and preserve reduced-motion behavior.
  - Verify: Run the project's focused brand/landing browser gate and inspect affected desktop/mobile captures; report the exact command and outputs.
  - Commit: `fix(ui): prevent landing animation overlap`

- [ ] **Task 2 — Fresh release QA and independent reviews**
  - Files: `tests/**`, `.superpowers/sdd/public-release/**` (QA lane); read-only review inputs/reports (Sol lane)
  - Do: Run current multi-device and multi-user journeys after Task 1; run two fresh independent EGM reviews and a read-only security/public-source inventory. Record exact commands, artifact paths, findings, and coverage boundaries.
  - Verify: QA gate commands exit successfully and reports are present; fresh EGM reports are independent and source-linked; public-source inventory contains no secret-bearing files or unnecessary private data.
  - Commit: `docs(release): record fresh QA and review evidence`

- [x] **Task 3 — Public README, speaking scripts, deck source and exports**
  - Files: `README.md`, `docs/presentation-speaking-scripts/**`, `deliverables/presentation/**`, optional `docs/assets/**`, `docs/superpowers/specs/2026-11-10-public-release.md`, `docs/superpowers/plans/2026-11-10-public-release.md`
  - Do: Document the public repo/live demo, architecture and local quickstart, actual test gates, EGM adaptation and limitations; link the real MP4 through a poster; write four individual timed scripts and a 5–7 minute handoff; update PPT content/generator so no ownership allocations remain in slide text, notes, alt text, or package properties.
  - Verify: README links resolve locally; script identities/topics match `TEAM-CONTRIBUTIONS.md`; deck contains five slides and package-wide text scan has no personal ownership allocations; render PDF/previews and inspect when heavy rendering slot is available; run PPTX validation.
  - Commit: `docs(release): prepare public README and viva presentation`

- [x] **Task 4 — Release ledger and handoff**
  - Files: `.superpowers/sdd/public-release/docs-report.md`
  - Do: Record documentation/presentation results and point to the integrated release evidence. State any verification deferred pending fresh QA or render slot.
  - Verify: Inspect listed artifacts on disk and reconcile all claims against current reports and tool outputs.
  - Commit: `docs(release): record public release documentation status`

## Final parent gate
Before creating or pushing the public repository: reconcile all lane reports; inspect staged-file allowlist and secret/privacy scan; confirm README points at the actual MP4/poster and public repo URL; validate five-slide PPTX/PDF; review current QA and two EGM reports; then complete the user-authorized public GitHub creation/push. Do not report a public repository as created until its URL is reachable.
