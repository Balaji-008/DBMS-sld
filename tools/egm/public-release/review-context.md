# Fresh review context — public release

Use this context for a fresh, adversarial review of the public-release draft and its linked artifacts. The repo is an isolated public-source snapshot; do not consult parent conversation, previous EGM rounds, private Git history, private worktree paths, or author rationale.

## User outcome
Prepare `Parswanadh/DBMS-sld` for a public GitHub source release with a corrected responsive landing hero, clear Oracle/DBMS documentation, a clickable poster-to-MP4 link, a five-slide deck without speaker ownership assignments, and four speaker scripts plus a timed handoff. The requested target is public, but repository creation/push/reachability must not be stated as complete until verified separately.

## Current verified scope
- QA evidence is dated 2026-11-10 and is summarized in `docs/showcase/public-device-results.json` and `.superpowers/sdd/public-release/qa-publish-report.md`.
- The public-device JSON is sanitized and contains viewport rectangles, source hashes, status, screenshot path names, and the emulation method. Do not open paths under `test-results/`.
- The QA report records fresh app and mobile gates; its limitations and no-external-email statement are part of the evidence.
- The landing art includes an original decorative abstract contour asset. It is not an official campus drawing or institutional logo.
- The public snapshot does not include private Git history. Do not infer commit authorship, effort shares, or a changed/unchanged historical API contract from this snapshot alone.

## Review questions
1. Is the release draft accurate about architecture, Oracle-only persistence, Gmail transport, APEX access, enrollment verification, and actual DBMS behavior?
2. Are each QA number and conclusion supported by the sanitized current reports, with emulation and coverage limits clearly stated?
3. Does the README give a new reader safe local setup and realistic public-service expectations without secrets, private contact details, or misleading publication claims?
4. Does the five-slide presentation explain the system and DBMS design while keeping personal assignments out of visible slide content, notes, alt descriptions, and properties?
5. Do the individual scripts match the team-agreed presentation scope, avoid claiming verified historic authorship, and protect synthetic/private data during a demo?
6. Does the snapshot/public-release process distinguish intended destination from an actually created and reachable public repository?
7. Are there missing alternatives, failure modes, security/privacy boundaries, or acceptance checks that could let an unsafe or inaccurate release pass?

## Reading boundary
Read only paths listed in `source-allowlist.md`. The allowlist is the complete project context for this review. If a required file cannot be read, report an incomplete review with the missing project-relative path; do not widen access by searching the repository.
