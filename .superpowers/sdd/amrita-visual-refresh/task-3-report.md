# Task 3: transactional OTP email

## Changes

- Added `server/src/email-template.ts` with `buildOtpEmail({ code, portalUrl })`, returning the subject, plain text, HTML, and Nodemailer attachments.
- Replaced the former minimal CampusBridge OTP message in `server/src/mail.ts` with the branded template, while preserving `sendOtp`, `getCapturedMail`, `clearCapturedMail`, and the captured test-message shape.
- Updated `scripts/configure-smtp.mjs` so newly generated `SMTP_FROM` values use the `Amrita Placement Portal` sender display name.
- Embedded `client/public/brand/amrita-logo-trimmed.png` through a CID attachment. The optional `client/public/brand/email-accent.gif` is included only if it exists; otherwise the header accent is rendered with a small table. The current asset set has no email accent GIF, and the available larger career GIFs are intentionally not attached.
- HTML uses a 600 px nested-table layout, inline critical styles, a narrow-screen media query, a prominent continuous six-digit code, five-minute expiry, ignore-if-unrequested copy, a configured absolute HTTP(S) portal link, and a Bengaluru Campus footer. Code format and URL scheme/credentials are validated; HTML-bound values are escaped.
- SMTP connection, greeting, and socket timeouts are 15 seconds, 15 seconds, and 30 seconds. No delivery errors or credential values are logged.

## Checks

- `npm run typecheck:server` — passed (`tsc -p server/tsconfig.json --noEmit`).

## Template guidance

Preview with `buildOtpEmail({ code: '123456', portalUrl: 'https://example.test/' })`, then substitute its CID image references with the matching attachment files for a local HTML preview. The logo attachment has CID `amrita-placement-portal-logo`. No email was sent.

## Client limits

Email clients may ignore the narrow-screen media query or rounded button corners; the nested table layout, contrast, visible code, and button remain usable without them. The logo is an inline image, so clients that block images will still show the OTP and all instructions as text/HTML.
