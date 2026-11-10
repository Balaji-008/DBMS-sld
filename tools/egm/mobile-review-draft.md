# Mobile showcase design — review draft

**State:** Current design draft, ready for fresh-context critique. It describes acceptance criteria and source structure. The current browser results are QA-reported in the sanitized evidence summary; this author did not run the build or browser suites.

## Problem

Students, recruiters, and placement staff use the same placement portal for different tasks. The mobile showcase must make those existing role workflows usable on narrow screens while preserving the portal's current behavior and data ownership. A visual refresh alone is insufficient if navigation, forms, dialogs, records, or actions become inaccessible on touch devices. The current sanitized evidence summary identifies the frozen client build and QA-reported gates for that source snapshot.

## Goals

- Provide a responsive, mobile-first interface for the existing student, recruiter, and placement-team roles.
- Preserve current route access, server-side authorization, and business behavior while changing layout and interaction presentation.
- Make navigation, forms, record actions, and dialogs usable with touch and keyboard input.
- Handle the configured viewport set and critical role routes in `tools/egm/mobile-qa-summary.md` without accidental horizontal clipping; preserve reachable actions and readable record fields where tables or dense data appear.
- Respect reduced-motion preferences and make static content usable when decorative images fail to load.
- Keep QA claims tied to current source and fresh test output; distinguish requirements, configured checks, baseline evidence, and verified outcomes.

## Non-goals and boundaries

- Do not change Express routes, API payloads, Oracle schema/data, OTP/authentication, file permissions, Gmail delivery, Cloudflare routing, services, environment files, or application dependencies for this UI work.
- Do not create a native mobile app, a separate student-data store, or an AI feature in the placement product.
- Do not claim production readiness, accessibility conformance, universal device support, or results beyond the specific QA-reported checks.
- Do not capture or publish real personal data, OTPs, credentials, browser traces, or private account material in showcase artifacts.

## Proposed design

Continue using the existing React/TypeScript client and its shared shell, component primitives, dialog hook, page components, and stylesheet. Adapt the shared navigation and interaction patterns at mobile breakpoints, then preserve each role's current page content and authorized actions. Responsive behavior stays in the presentation layer; requests still use the existing API contract and ownership checks. The selected current source contains a responsive shell, compact navigation with `aria-expanded`, `aria-hidden`, and `inert` state, shared dialog focus/Escape handling, `:focus-visible` styles, and data labels for table cells. These are code observations; the QA summary separately records checks of the associated behavior against the frozen client snapshot.

The mobile shell should provide a compact, operable navigation pattern with a clear expanded/collapsed state and visible keyboard focus. A closed compact navigation must be absent from keyboard and accessibility navigation; an open navigation must receive focus, contain keyboard traversal, and return focus appropriately on close. Shared dialogs should fit the viewport, keep their content reachable through internal scrolling when needed, place focus predictably, and support the existing close behavior. Dense opportunity, application, certificate, and operations data should retain both the field label and relevant action when converted for a narrow viewport. Forms should keep controls visible and operable without requiring a desktop pointer. Motion and decorative media should not block the task when reduced motion is requested or an image is unavailable.

These are requirements for review and implementation. The current changed source must be inspected directly before claiming it meets them.

## Alternatives considered

| Option | Decision | Reason |
| --- | --- | --- |
| Keep the existing desktop layout and rely on browser zoom | Reject | Zoom does not by itself make dense navigation, dialogs, tables, and touch actions fit or remain easy to reach on narrow screens. |
| Build a separate native mobile application | Reject for this scope | It duplicates role workflows, routing, and release/verification surfaces without solving the current web portal's mobile usability. A separate app would need its own product decision and maintenance plan. |
| Add mobile-specific API/database behavior | Reject | The stated need is responsive interaction; changing backend/data behavior expands risk and is not required for a presentation-layer solution. |
| Adapt the existing React interface responsively | Proposed | Preserves the current application boundary and shared role workflows while targeting the mobile presentation issue. Confirm against the current source and QA results. |

## Acceptance checks

The sanitized QA summary records final browser-gate results for the frozen client snapshot; it states that those results were reported by QA, not run by this author. The QA result values and the selected source digest are in `tools/egm/mobile-qa-summary.md`. Review the acceptance checks against those measured areas, keep claims scoped to those gates, and rerun QA if any listed client source changes after the recorded snapshot.

- Each role can reach its existing primary navigation and critical workflow actions at every configured viewport in the sanitized QA summary.
- Each role completes the specified minimum workflows and observes the listed postconditions:

| Role | Covered routes | Required mobile workflow outcomes |
| --- | --- | --- |
| Student | `/`, `/opportunities`, `/applications`, `/profile`, `/certificates`, `/hackathons`, `/outcomes` | Search/filter opportunities, view details, apply, then withdraw an active application; edit profile including blank optional personal email and multiple phone numbers; upload a synthetic resume; add, view, and delete a synthetic certificate; register a hackathon team and view its registration. |
| Recruiter | `/`, `/opportunities`, `/applications`, `/companies`, `/outcomes`, `/reports`, `/hackathons` | Register and reach pending approval; after placement-team approval, create an opportunity for the registered company; create a hackathon. Route checks alone do not satisfy these state-changing outcomes. |
| Placement team | `/`, `/opportunities`, `/applications`, `/students`, `/companies`, `/certificates`, `/hackathons`, `/outcomes`, `/approvals`, `/reports` | Create and edit a company; create an opportunity with skill/department eligibility and edit those requirements; move an application through screening, interview, and selection; record placement and internship outcomes; approve the pending recruiter. |

This matrix names the role actions represented by the current QA-reported three-role gate. The configured viewports apply to the covered route sets; each required state-changing outcome must also be present in the QA scenario record. Source and measured coverage projection: `tools/egm/mobile-qa-summary.md`.
- No page under review has accidental horizontal overflow or an unreachable primary action at a configured viewport.
- Keyboard focus is visible; closed mobile navigation cannot receive focus; opening navigation or a dialog moves focus inside; Tab remains inside; Escape closes; and focus returns to its trigger or a sensible page target.
- Dialogs fit within the visible viewport and allow access to all content and actions, including through internal scrolling when required.
- Dense mobile records retain understandable labels for values and actions; tests check the rendered labels and action reachability.
- Touch controls satisfy the project's configured minimum target checks, including associated labels for checkboxes and radios; the result must come from fresh browser output, not a screenshot estimate.
- Reduced-motion mode avoids the decorative movement identified by QA, and failed decorative image loads do not break core navigation or content.
- Student, recruiter, and placement-team functional checks use synthetic records and do not expose OTPs or registration response bodies in logs or artifacts; QA status is limited to the reported three-role workflow gate.
- Fresh screenshots come only after source freeze and contain synthetic/demo content; historical screenshots are labeled as baseline evidence.
- The mobile UI scope does not change `server/src` or `docs/API-CONTRACT.md`. The source/API baseline comparison against `f2a2e96` is recorded in `tools/egm/mobile-qa-summary.md`; the tracked diff is empty **[MEASURED]**. This is static scope-control evidence only: mobile browser gates do not re-test server authorization or runtime data behavior.
- Backend regression status is separate from the UI gate. No fresh backend integration result is attached to this mobile QA snapshot; the referenced 87-check backend result is **[NOT MEASURED]** as current evidence. If server/API files change, stop claiming the UI-only invariant and require a separately approved, dated backend regression run.

## Risks and mitigations

- **Narrow screens hide actions or values.** Test critical routes for each role at every configured viewport; verify both visible labels and action reachability, not merely the absence of overflow.
- **Dialogs trap or obscure users.** Check focus entry/visibility, viewport fit, keyboard close, and access to long content using the shared dialog behavior.
- **Responsive CSS changes regress desktop layouts.** Include the existing desktop functional checks alongside touch/mobile contexts and inspect the actual final bundle.
- **Reduced-motion or broken media harms usability.** Exercise preference and image-failure behavior in the brand suite and keep core information independent of decorative assets.
- **QA changes expose real student details.** Use synthetic identities and files, avoid logging response bodies, and exclude raw logs/screenshots from review and public materials unless explicitly privacy-reviewed.
- **A later UI edit makes the reported QA snapshot stale.** Compare the current source digest to the reviewed digest and rerun the appropriate gates after a client change.
- **A backend/API edit is hidden inside a UI refresh.** Compare `server/src` and `docs/API-CONTRACT.md` against the recorded base; treat any diff as out of this mobile acceptance and require separate backend verification. A clean static diff does not prove runtime authorization behavior.

## Verification and limits

The allowed project context includes the mobile showcase specification, sanitized QA summary, and selected current React/TypeScript sources. The QA summary attributes results to QA and provides a frozen asset identity plus a selected-source digest; neither proves behavior beyond the named gates. The Goldfish review is a document critique, not a code audit or test run. No performance number, accessibility certification, or production readiness claim is made here.
