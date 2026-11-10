# Elephant author brief — mobile showcase design

**Role:** Context-rich design author. Use only the project sources in `mobile-review-inputs.md` and the EGM references in `upstream/`.

## Task

Produce and refine `mobile-review-draft.md` as a self-contained design specification for a responsive mobile showcase of the existing Amrita Bengaluru placement portal. Explain user problem, goals/non-goals, system boundaries, alternatives, risks, and acceptance checks. Clearly distinguish requirements, source-backed current behavior, and unverified outcomes. The document is a review target; it is not an implementation order.

## Context to retain

- Existing product is a React/TypeScript client over an Express API and Oracle. It has student, recruiter, and placement-team experiences. The task is a mobile presentation/interaction layer; preserve existing product behavior and data boundaries.
- The current mobile showcase SDD defines a responsive three-role goal and explicit non-goals around backend, database, environment, services, and deployment. Read it directly.
- Existing mobile QA artifacts distinguish baseline evidence from work in progress. Do not convert planned checks, historical captures, or narrative summaries into a passing result.
- Source files are currently under coordinated work. The root reviewer should wait until it declares the relevant mobile changes ready; the design does not itself claim source freeze.

## Writing rules

- Follow the upstream feature-spec standard and the local safe source allowlist.
- State the experience and behavior plainly; avoid promotional claims.
- Include concrete alternatives and explain their trade-offs without asserting an unrecorded maintainer decision.
- Make touch, keyboard, dialog, navigation, responsive data, reduced-motion, image failure, and role-workflow expectations reviewable where applicable.
- Do not include student/recruiter PII, OTPs, real email addresses, secrets, logs, or screenshots with real data.
- Do not claim the EGM plugin was installed, any Goldfish review ran, or an application test passed.
- Do not modify application code, tests, project README, environment, deployment, or non-`tools/egm/` files.
