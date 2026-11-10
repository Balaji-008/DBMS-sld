# Public live deployment follow-up

Deployment time: 2026-11-10 19:11–19:13 UTC

Base commit: `3c4308f5bbfa64aa1f11a640e25e99dd0377dbcf`

Source state: public checkout containing the QA-reviewed Login/Profile privacy-copy edits and generated landing patterns; deployment used the already-built `client/dist`.

## Deployment

- Wrangler `4.114.0` deployed Worker `campusbridge-dbms` to the existing custom domain `dbms.sld.parswanadh.dev`.
- Cloudflare reported Current Version ID `f1b4e716-37f1-44c9-85b8-2a1218b12105`.
- The deployment read 18 files from `client/dist` and uploaded five new or modified assets. The existing `API` VPC service and `ASSETS` binding were present in the deployment output.
- Deployment used the checked-in public Worker configuration. It did not run the `.env`-dependent helper, synchronize or change `ORIGIN_AUTH_TOKEN`, or modify any environment file.

## Live verification

- `GET /` returned HTTP 200 and its bytes matched `client/dist/index.html` exactly.
- Each asset below returned HTTP 200 and its SHA-256 matched the corresponding public build file:

| Asset | SHA-256 |
| --- | --- |
| `/assets/index-D16amH3f.js` | `16f876b950fa8c2161db9585cd41b11799c2f886afd7aa016fdb45f0bcb46890` |
| `/assets/index-ZDdMJ5-q.css` | `f211de8bf64c984e39d9156822205e459d6a03c1af007199abb89277d6b29b63` |
| `/media/campus-contours.png` | `f41341d11d2cb795956bb4bfbed6d8d2e5a5fa94ad567da3611b3b02da9e41a3` |
| `/media/campus-contours.webp` | `0af44a481c07d23b31440f94687d987edcc60b3a9c3b87d5001d68f5a3ec9d8c` |

- `GET /api/health` returned `status: ok`, `database: connected`, and `smtp_configured: true` (`mail_transport: smtp`). No OTP flow was invoked and no email was sent.

The change deployed the frontend asset bundle; API and Oracle services were left running. No source QA, browser checks, or build were run as part of this deployment step; the public QA follow-up records those results separately.
