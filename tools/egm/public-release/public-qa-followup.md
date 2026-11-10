# Public-source QA follow-up

Date: 2026-11-11 (UTC run window: 2026-11-10 18:58–19:02 UTC)

Base commit: `3c4308f5bbfa64aa1f11a640e25e99dd0377dbcf`

Source state: public checkout with the frozen Login/Profile privacy-copy follow-up; these edits were uncommitted during QA.

## Tested source

The landing and login browser report now hashes the source files read by the test at run time. The public Login source is the copy follow-up version, not the earlier pre-export file represented by the historical hash in the previous report.

| Source | SHA-256 |
| --- | --- |
| `client/src/pages/Landing.tsx` | `91b67ecc93bbc2d69390c2920e6f5719b47a78a95144a665425d91e5995c4bcc` |
| `client/src/pages/Login.tsx` | `94fd42d2fbf45ad241f210d83e4728768d134008190549189a92a9d2fa95e1d2` |
| `client/src/pages/Profile.tsx` | `59aa88ab277edfad10ac544300894540559a54c6a027497ce9efaa24833d0df7` |
| `client/src/styles.css` | `acf9f93e031d6512be7644d8eb16f7e970068108513c0c9b63fe0afea68c3714` |

## Results

- `npm run build` passed against the public checkout, including server/client typechecks and the production Vite build. Vite emitted its existing advisory that `client/src/api.ts` is both statically and dynamically imported.
- `tests/public-device.ts` passed 20 browser checks against the public build: the landing and Login privacy dialog loaded; the dialog qualified portal-upload access and external-host sharing and described email-code mailbox verification; the hero passed at 12 viewport widths and four 200% text-size emulation widths; desktop/mobile screenshots were captured; reduced-motion mode used posters without requesting GIFs.
- The serialized `mobile` review loop passed typecheck, build, brand-browser, shell-browser, and functional-browser gates. The functional flow used controlled `MAIL_TRANSPORT=json` and removed its generated fake records during cleanup. The local email/MIME prerequisite passed 14 checks and wrote only the local preview; no external email was sent.
- The functional browser exercised the student profile route. The profile copy was included in the build and source hash; the targeted exact-copy assertion is on the Login privacy dialog.

The device report is `docs/showcase/public-device-results.json`; the mobile gate state and sanitized logs are under the ignored `test-results/review-loop/mobile/` run directory. The device-only smoke used a local `createApp()` server without Oracle initialization. The full mobile gates then loaded the existing ignored local `.env` through `DOTENV_CONFIG_PATH` for their app flows; the file was not copied into the public checkout or staged. Test mode used JSON mail transport.

## Reproduction

From the public checkout, with the approved ignored local environment available as `$LOCAL_ENV_FILE`:

```sh
npm run build
PUBLIC_QA_BASE_URL=http://127.0.0.1:3003 \
PUBLIC_QA_SOURCE_REVISION="$(git rev-parse HEAD)" \
PUBLIC_QA_SOURCE_STATE='public checkout with frozen Login/Profile privacy-copy follow-up' \
npm exec tsx -- tests/public-device.ts

DOTENV_CONFIG_PATH="$LOCAL_ENV_FILE" NODE_ENV=test MAIL_TRANSPORT=json \
COOKIE_SECURE=false PUBLIC_URL=http://127.0.0.1:3003 \
node scripts/review-loop.mjs --task mobile
```

The mobile review loop serializes its browser gates and records source hashes, bounded commands, timestamps, and sanitized diagnostics. If `brand-browser` is rerun, first generate its local email preview with `npm run test:brand-email`; that command uses a stream transport and sends nothing externally.

## Retry notes

The first mobile attempt found the temporary device-smoke server still holding port 3003. After stopping that test-owned server, `brand-browser` exposed its required generated email-preview fixture was absent. The fixture was generated locally, then the review loop resumed and all gates passed. The final device report was regenerated after adding source revision/state metadata; its status is `passed` with 20 checks.
