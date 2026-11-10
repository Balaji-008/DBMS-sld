# Amrita visual refresh implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Public Amrita campus landing/UI, pre-rendered visual assets and polished OTP email on the existing Oracle application.
**Architecture:** Frontend assets + React views; explicit offline GIF generator; reusable table-based email renderer integrated with existing Nodemailer. Wrangler publishes the frontend while existing private HTTP tunnel reaches the local Oracle API.

## Global constraints
- Oracle only, preserve sessions/permissions and all existing placement flows.
- No secrets in source, browser payloads or logs; no unsolicited external email.
- Initial execution used one Luna worker at a time with 2.2GiB available. After interruption, available memory recovered above 7GiB, permitting two bounded final Luna reviewers; browser suites still ran one at a time under 768MiB limits.
- Disjoint ownership: UI worker `client/src/**` and `client/index.html`; asset worker `scripts/render-brand-assets.*`, `design/**` (except source), `client/public/media/**` (except parent-generated sketches), `client/public/brand/amrita-logo-trimmed.png`; email worker `server/src/mail.ts`, new email template module. Parent owns image generation, root config/docs/tests and deployment.

## Tasks
- [x] Task 1 — Luna frontend: landing, login, application branding, campus sketch and motion image integration; all roles and accessible dialogs retained. Verify `npm run typecheck:client`.
- [x] Task 2 — Luna assets: explicit deterministic offline GIF generation with fixed dimensions/frames, static posters, trimmed supplied logo and manifest; no runtime drawing. Verify output signatures/frame counts/dimensions/sizes with Pillow or ffprobe.
- [x] Task 3 — Luna email: professional HTML/plain-text OTP template with embedded supplied logo and optional small pre-rendered accent; keep test capture/API interface. Verify server TypeScript and template assertions using a controlled code, not external delivery.
- [x] Task 4 — parent integration: build; verify landing/login, authenticated role pages, reduced motion, GIF/static assets, email preview and no stale visible brand; update protected SMTP sender display name; restart API and deploy with Wrangler. Verify public health remains Oracle-connected and SMTP-configured.
- [x] Task 5 — independent Luna review: bounded read-only review of finished UI/motion/email against this spec. Address concrete findings, verify covering checks and record results in PROGRESS.md.
