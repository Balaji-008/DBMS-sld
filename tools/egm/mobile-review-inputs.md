# Mobile showcase Goldfish input bundle

Only the following local files are approved reading context for this review. Root should resolve each to an absolute path before dispatch. The Goldfish must not discover additional files, follow external URLs, or inspect logs/secrets.

## Required EGM references

- `tools/egm/upstream/docs/codex.md`
- `tools/egm/upstream/docs/getting_started.md`
- `tools/egm/upstream/skills/egm-review-loop/SKILL.md`
- `tools/egm/upstream/agents/design_critic.md`
- `tools/egm/upstream/resources/document_standards/feature-spec-standard.md`
- `tools/egm/goldfish-review-prompt.md`

## Target

- `tools/egm/mobile-review-draft.md`

## Current design intent and sanitized QA evidence

- `docs/superpowers/specs/2026-11-09-mobile-showcase.md` — mobile showcase goal, constraints, and non-goals.
- `docs/API-CONTRACT.md` — static public API contract for the existing portal; use only to understand the mobile scope boundary.
- `tools/egm/mobile-qa-summary.md` — QA-reported final gate counts, exit codes, configured widths, frozen assets, and selected source digest. This is a safe projection; do not open its excluded raw verification source.

## Mobile source under review

- `client/src/components/Shell.tsx`
- `client/src/components/ui.tsx`
- `client/src/hooks/useDialog.ts`
- `client/src/pages/Landing.tsx`
- `client/src/pages/Opportunities.tsx`
- `client/src/pages/Operations.tsx`
- `client/src/pages/Profile.tsx`
- `client/src/pages/Certificates.tsx`
- `client/src/styles.css`

QA suite source is intentionally excluded from the Goldfish bundle because it contains test authentication/OTP handling and an email-preview fixture. Use only `tools/egm/mobile-qa-summary.md` for QA status. Do not open the raw reports/suites or derive a test result from them.

## Explicit exclusions

- All `.env*` files, credentials, API keys, account settings, and service configuration.
- Any Oracle data, student/recruiter record, resume/Aadhaar document, OTP, or real email address.
- Server implementation source is not included; use the static source/hash comparison recorded in the QA summary, and do not expand into `server/src`.
- `logs/`, `test-results/`, raw transcripts, browser traces, screenshots, generated bundles, or files not named above.
- `docs/showcase/mobile-audit.md` and `docs/showcase/verification-results.json` (the former links to raw results/captures; the latter includes capture data). Their approved non-PII QA facts are summarized at `tools/egm/mobile-qa-summary.md`.
- All other files, directories, remote URLs, and conversation history.

The owner must remove any accidental sensitive content from the target bundle before dispatch. A path allowlist reduces scope; it does not prove filesystem isolation.
