# Mobile showcase release operations

## Deployment

- Result: deployed successfully to `https://dbms.sld.parswanadh.dev`.
- Worker: `campusbridge-dbms`.
- Version ID: `83680f1b-b35b-4fe4-84b0-a5771605485d`.
- Deployment observed at: 2026-11-09 17:40 UTC.
- Command: existing `npm run deploy:cloudflare` script. It synchronized the origin secret via Wrangler stdin and deployed the existing `client/dist` build. Wrangler reported 16 assets available, uploaded 3 changed assets, and deployment completed successfully.
- No source rebuild was run. No application source, API, tunnel, Oracle/container, or service state was changed during release operations. No real OTP or email was requested or sent.

## Preflight

- Local `GET /api/health`: HTTP 200, `database=connected`, `smtp_configured=true`, `mail_transport=smtp`.
- `npm run status`: service `ActiveState=active`, `SubState=running`; API health HTTP 200.
- Resource check: 10,052,624,384 bytes available memory; 9,278,144,512 bytes available filesystem space.

## Public read-only verification

Checked after deployment using HTTP fetches; no browser runtime claim is made here.

- `/`: HTTP 200; title `Amrita Placement Portal · Bengaluru`; Amrita metadata present. HTML references `/assets/index-CvvHfYsk.js` and `/assets/index-B_WNGRsQ.css`.
- `/login`: HTTP 200; SPA HTML returned with the same Amrita title/metadata.
- `/api/health`: HTTP 200; `status=ok`, `database=connected`, `smtp_configured=true`, `mail_transport=smtp`.
- Each listed asset returned HTTP 200 and matched its local build bytes by SHA-256:

| Public path | SHA-256 |
| --- | --- |
| `/assets/index-CvvHfYsk.js` | `775688e864d6107f1a0b30d0c6aa64fd5fae0c8699b31fb083557e9527a1ce5a` |
| `/assets/index-B_WNGRsQ.css` | `0092ecb933678457200fbb9c6bde999f0163608819e1d20707a961e48a332099` |
| `/media/career-orbit.gif` | `fff8fed7ce266c7e080a54d4a82851c68c6d7491fcb1391b0f355a68f1353454` |
| `/media/pathways.gif` | `8205f79aa7f8973feb2ca310aff50f064d77ea818ce2df5ce643de4ce77fe6bd` |
| `/media/campus-sketch.webp` | `80baeb6c411320c90cd04f248d6fb323880cd0948e7eb93ddeb0d2b4a5a7cec1` |
| `/media/opportunity-sketch.webp` | `8b2995ecf8f1a831689cfd86c1d5a0e7b60d9bfba253ebae9ed9a84807fe4dd1` |

## Scope

This report is the only file changed by the release-operations task. Existing workspace edits were present before deployment and were left untouched. No additional source cleanup was needed.
