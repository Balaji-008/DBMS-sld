# Mobile QA evidence summary for Goldfish

**Provenance:** QA-reported values retrieved from the approved verification artifact on 2026-11-09. This summary contains only non-PII status, gate counts, exit codes, viewport configuration, and frozen bundle identifiers. Raw screenshots, logs, run commands, and test contents are intentionally not included in the Goldfish bundle.

## Frozen client identity

- QA artifact timestamp: `2026-11-09T16:25:01Z` [MEASURED].
- Base Git revision: `f2a2e96`; the artifact records the worktree as modified at verification time.
- Frozen JavaScript asset: `index-CvvHfYsk.js`.
- Frozen stylesheet asset: `index-B_WNGRsQ.css`.
- Current selected `client/src` working-tree diff digest for this review input: `b45ed8262eaef52a340468c072740d8335a835944183cad55c9c6477e4aa9eaa` (SHA-256 of `git diff --binary` over the listed client paths; recalculate if any listed file changes before dispatch).

## QA-reported gate results

The QA verification artifact records the following final results. These are **QA-reported**, not tests run by the EGM author or reviewer:

| Gate | Checks passed | Exit code | Additional reported status |
| --- | ---: | ---: | --- |
| Brand/landing | 29 [MEASURED] | 0 [MEASURED] | Configured landing viewport set, image decode/failure checks, role links, and reduced-motion checks were included. |
| Login/shell/student smoke/admin routes | 35 [MEASURED] | 0 [MEASURED] | Configured viewport set: 320, 360, 390, 430, and 768 px [MEASURED]; browser errors: 0 [MEASURED]; failed images: 0 [MEASURED]. |
| Three-role mobile workflows | 43 [MEASURED] | 0 [MEASURED] | Configured viewport set: 320, 360, 390, 430, and 768 px [MEASURED]; browser errors: 0 [MEASURED]; failed images: 0 [MEASURED]. |

The sanitized mobile audit reports zero layout/accessibility, browser-error, and failed-image issues for the final shell and functional runs [MEASURED]. It describes touch-target, focus, dialog, table-label, and synthetic three-role workflow checks. These facts summarize the artifact; they do not certify general accessibility or exhaustive device support.

## Role workflow acceptance map

The QA artifact's sanitized route/workflow projection is the concrete scope for “critical workflows” in the design. It is a record of what the reported functional gate exercised, not a claim that this author reran those scenarios.

| Role | Route coverage recorded by QA | Minimum observable workflow outcomes |
| --- | --- | --- |
| Student | `/`, `/opportunities`, `/applications`, `/profile`, `/certificates`, `/hackathons`, `/outcomes` | Search/filter opportunities, open details, apply, then withdraw an active application; edit profile including blank optional personal email and multiple phone numbers; upload a synthetic resume; add/view/delete a synthetic certificate; register a hackathon team and view its registration. |
| Recruiter | `/`, `/opportunities`, `/applications`, `/companies`, `/outcomes`, `/reports`, `/hackathons` | Register and reach pending approval; after placement-team approval, create an opportunity for the registered company; create a hackathon. The route list is checked separately from these state-changing flows. |
| Placement team | `/`, `/opportunities`, `/applications`, `/students`, `/companies`, `/certificates`, `/hackathons`, `/outcomes`, `/approvals`, `/reports` | Create and edit a company; create an opportunity with eligibility/skill requirements and edit those requirements; progress an application through screening/interview/selection; record placement and internship outcomes; approve the pending recruiter. |

Cross-role ordering recorded by QA: recruiter registration → placement-team approval → approved recruiter opportunity creation. Common mobile checks apply to the configured route sets: viewport fit, visible/reachable targets, table labels/actions, and dialog viewport/focus/scroll behavior. The design's “critical workflows” acceptance criterion means the explicit outcomes in this table; navigation-only coverage is insufficient.

## Backend/API boundary evidence

Static comparison performed by the documentation author on 2026-11-09:

- Public API contract at base `f2a2e96`: SHA-256 `6171daa9a6bec60d741289a2296fb95af82a976a9affdb9233106beac4d53a8d`; current `docs/API-CONTRACT.md` has the same digest.
- Git path/blob fingerprint for `server/src` and `docs/API-CONTRACT.md` at base and `HEAD`: SHA-256 `6ca0482cf2f1375fcd30d6cc2b2d728bc65daa9f59f05b634dd32b5bee10adf0` for both.
- `git diff --quiet f2a2e96 -- server/src docs/API-CONTRACT.md` returned `tracked_backend_api_diff=empty`; no untracked path was reported under those two paths.

These are static source comparisons, not runtime or authorization tests. As of the QA artifact timestamp `2026-11-09T16:25:01Z` [MEASURED], that artifact contains the three browser gates above and no backend integration gate. A fresh backend regression result is **[NOT MEASURED]** for this mobile review; a referenced 87-check backend result is **[NOT MEASURED]** here and must not be presented as current or as a result of the mobile gates. If server/API paths change, require a separately approved backend regression run and report its dated evidence before claiming the invariant.

Reproducible static checks:

```sh
git show f2a2e96:docs/API-CONTRACT.md | sha256sum
sha256sum docs/API-CONTRACT.md
git ls-tree -r f2a2e96 -- server/src docs/API-CONTRACT.md | sha256sum
git ls-tree -r HEAD -- server/src docs/API-CONTRACT.md | sha256sum
git diff --quiet f2a2e96 -- server/src docs/API-CONTRACT.md
```

## Evidence limits

- Raw evidence source: `docs/showcase/verification-results.json`. It is deliberately excluded from the reviewer bundle because it also contains capture data and other fields not cleared for this use. Only the non-PII fields described above were read.
- The role matrix and backend/API comparison above are sanitized projections; the critic receives these facts and the static `docs/API-CONTRACT.md`, not the raw gate artifact, application tests, or server source.
- The reviewer must not open the raw JSON, test logs, test source, captures, or any linked `test-results/` file.
- The numeric QA claims above should remain labeled QA-reported in any review result. The EGM author did not run build/browser suites.
- Passing browser gates do not establish production readiness, general accessibility conformance, or behavior beyond the stated project checks.
