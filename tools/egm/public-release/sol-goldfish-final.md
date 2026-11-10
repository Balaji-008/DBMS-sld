# Fresh public-source Goldfish review

status: completed

reviewedCommit: `3c4308f5bbfa64aa1f11a640e25e99dd0377dbcf`

verdict: focused follow-up required; this is a post-publication review, not prepublication approval or a security certification.

## Findings

### design_critic-round-1 — Major — QA source hash does not match the public login source

- **Source:** `tools/egm/public-release/release-draft.md:41`; related `README.md:134` and `docs/showcase/public-device-results.json` (`sourceHashes`).
- **Claim:** Source-hash-linked QA applies to the frozen release source, and a later source change requires a rerun.
- **Evidence:** Read-only SHA-256 comparison found `client/src/pages/Landing.tsx` and `client/src/styles.css` match the JSON, but public `client/src/pages/Login.tsx` is `fc61f894398c1e8b0c64339e5666e167379a0245d4ff9d0a633fe48e2a201622`; the recorded hash is `1cccf867646880698f397191a4f36198db7aa32da1d195b8d074acddd8d5a00e`.
- **Impact:** The report cannot establish that its login-adjacent/browser QA used the exact public login source. This does not refute the measured landing rectangles, whose page and stylesheet hashes match.
- **Recommendation:** Record the public-source transformation and its scope in the QA report, then run a targeted login smoke check on the public tree or revise the wording so the historical QA is explicitly attributed to the pre-export source. Update the source hash only after a real check.
- **Confidence:** high.

### design_critic-round-2 — Major — Aadhaar document privacy copy exceeds the enforced URL boundary

- **Source:** `client/src/pages/Login.tsx:21`; related `server/src/routes.ts:48`, `server/src/routes.ts:53`, `docs/API-CONTRACT.md:22`.
- **Claim:** The Privacy & terms dialog says Aadhaar documents are private to the student and placement staff.
- **Evidence:** The profile endpoint accepts `aadhaar_document_url` values starting with `http://` or `https://`. The ownership check applies only to `/api/uploads/` URLs. The API contract correctly limits its claim to *uploaded* Aadhaar documents.
- **Impact:** An externally hosted document may have access rules outside this portal, so the user-facing assurance is broader than the implementation guarantees.
- **Recommendation:** Qualify the dialog to say that Aadhaar documents uploaded to the portal are restricted to the student and placement staff; separately consider requiring portal-hosted URLs for this sensitive field if the product intends an unconditional privacy guarantee.
- **Confidence:** high.

### design_critic-round-3 — Nit — release draft still describes publication as pending

- **Source:** `tools/egm/public-release/release-draft.md:3`, `tools/egm/public-release/release-draft.md:42`.
- **Claim:** Repository creation/push and public reachability remain pending.
- **Evidence:** The current public checkout is at the reviewed commit and `README.md:7` identifies the source release. The publication step was reported complete in the review task; this review did not independently query the remote URL.
- **Impact:** A reader can mistake a historical publication gate for the current release state.
- **Recommendation:** Date the draft as a prepublication artifact or update it with the actual post-push commit and a separately verified URL state. Keep the prepublication QA report historical.
- **Confidence:** medium.

## Checks and limits

- **Run in this review (read-only):** inspected the 34 allowlisted paths and confirmed each is a regular non-symlink file; compared the three published landing/login source hashes; extracted five PPTX slide texts, notes, image descriptions, and Office properties; extracted PDF text and metadata. The five slides and PDF contained no individual ownership assignments in those checked fields. The speaker allocations reside in the separate script files.
- **Reported by prior QA, not rerun here:** 19 public landing checks at 12 CSS widths, four 200% computed-font-size emulation widths, reduced-motion poster behavior, 29 brand, 35 shell, 43 role-flow, 87 Oracle integration, and 14 email/MIME checks. These are automated checks against the earlier recorded state; no physical-device, external-email, live-service, or exhaustive authorization conclusion follows.
- **Boundary:** The review used only the release allowlist plus the public checkout's current commit identifier. It did not inspect private history, environment values, raw logs, screenshots, excluded files, remote service health, or the complete public tree. The reported whole-snapshot scan and zero credential/path findings remain QA-report claims, not independent full-tree scan results of this review. No build, test, render, browser session, live account, or push was performed.

## Files read

`tools/egm/public-release/release-draft.md`, `tools/egm/public-release/review-context.md`, `tools/egm/public-release/source-allowlist.md`, `tools/egm/public-release/goldfish-review-prompt.md`, `tools/egm/upstream/docs/codex.md`, `tools/egm/upstream/agents/design_critic.md`, `tools/egm/upstream/resources/document_standards/feature-spec-standard.md`, `README.md`, `docs/API-CONTRACT.md`, `docs/SQL-WORKSHOP.md`, `docs/team-viva/DBMS-WALKTHROUGH.md`, `docs/team-viva/DEMO-CHECKLIST.md`, `database/SCHEMA.md`, `database/001_schema.sql`, `server/src/auth-routes.ts`, `server/src/auth.ts`, `server/src/routes.ts`, `server/src/upload-routes.ts`, `client/src/pages/Landing.tsx`, `client/src/pages/Login.tsx`, `client/src/styles.css`, `design/public-patterns/campus-contours.md`, `docs/showcase/public-device-results.json`, `.superpowers/sdd/public-release/qa-publish-report.md`, `deliverables/presentation/content.json`, `deliverables/presentation/generate.js`, `deliverables/presentation/amrita-placement-portal-showcase.pptx`, `deliverables/presentation/amrita-placement-portal-showcase.pdf`, `docs/presentation-speaking-scripts/01-balcha-venkata-parswanadh.md`, `docs/presentation-speaking-scripts/02-balaji-rayudu.md`, `docs/presentation-speaking-scripts/03-bhavana-malladi.md`, `docs/presentation-speaking-scripts/04-abhiram-support-demo.md`, `docs/presentation-speaking-scripts/MASTER-HANDOFF.md`, `deliverables/video/README.md`.
