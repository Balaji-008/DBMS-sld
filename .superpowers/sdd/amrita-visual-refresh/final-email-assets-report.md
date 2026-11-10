# Independent final email and assets check

## Email

- Ran `npm run test:brand-email` in the repository. Result: **14 checks passed**; the test used Nodemailer's local stream transport and reported no external email sent.
- Confirmed the template has the Amrita Placement Portal subject and branding, continuous six-digit OTP in HTML and plain text, explicit five-minute expiry, ignore-if-unrequested copy, and a configured absolute HTTP(S) portal link. It rejects malformed OTPs and unsafe URL schemes/credentials, escapes the rendered URL, and contains no executable browser content.
- Confirmed the rendered `cid:amrita-placement-portal-logo` reference resolves to `client/public/brand/amrita-logo-trimmed.png`; local MIME output contains the inline logo and both plain-text and HTML alternatives.
- Reviewed `server/src/mail.ts`: SMTP delivery uses the branded builder and keeps 15-second connection/greeting and 30-second socket timeouts. No credentials are logged. The current `.env` check inspected only whether `SMTP_FROM` contains the `Amrita Placement Portal` display name; no address or credential was printed.
- Reviewed `scripts/configure-smtp.mjs`: it writes `SMTP_FROM` with the Amrita Placement Portal display name and collects the app password with hidden terminal input. Asset generation is exposed as an explicit script/README command; searches found no application startup or build invocation of the renderer.

## Assets

All three source image SHA-256 values and all seven generated output SHA-256 values in `design/asset-manifest.json` match the files on disk. The supplied logo and campus/opportunity sketch source files are unchanged. The trimmed logo is 1118×224, crop bounds `(10, 183, 1128, 407)`, and its RGBA pixels exactly match that crop of the supplied logo.

| Output | Dimensions | Bytes | Additional check |
| --- | ---: | ---: | --- |
| `career-orbit.gif` | 640×420 | 653,615 | 48 frames; every frame 80 ms; 3,840 ms loop; infinite |
| `career-orbit-poster.png` | 640×420 | 37,403 | Manifest SHA-256 matches |
| `pathways.gif` | 480×260 | 396,511 | 48 frames; every frame 80 ms; 3,840 ms loop; infinite |
| `pathways-poster.png` | 480×260 | 22,900 | Manifest SHA-256 matches |
| `campus-sketch.webp` | 2172×724 | 470,944 | Dimensions preserve source composition; manifest SHA-256 matches |
| `opportunity-sketch.webp` | 1448×1086 | 123,154 | Dimensions preserve source composition; manifest SHA-256 matches |
| `amrita-logo-trimmed.png` | 1118×224 | 37,783 | Exact alpha-bounds pixel crop; manifest SHA-256 matches |

Both GIFs are below the 2 MB target. The offline renderer was not run during this audit; checks used metadata, bytes, hashes, and exact logo pixel comparison.

## Result

No concrete email or asset defect found. Email-template and asset sources are approved for the visual-refresh integration freeze. This report does not cover browser/build/deployment checks or authorize email delivery.
