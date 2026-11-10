# Privacy copy review response

The Goldfish review correctly identified that the original Aadhaar document assurance covered external URLs even though the portal cannot control their host's sharing settings. The Privacy & terms dialog now distinguishes portal uploads, accessible to the owner and authorized placement staff, from external links governed by their host. It also says that the one-time email code verifies control of the email address. The profile field repeats the document distinction, and its placeholder no longer calls every URL protected. The Aadhaar number wording remains aligned with encrypted storage and masked display.

This is a copy-only change: document links and uploads, registration, and API behavior are unchanged. `server/src/routes.ts` accepts HTTP(S) document URLs and applies portal upload ownership checks; `server/src/upload-routes.ts` implements access checks for portal uploads. The profile input retains its name and label, but its placeholder changes from `Protected document URL` to `Document URL`; browser selectors relying on the old placeholder need updating.

Source SHA-256 after the copy change:

- `client/src/pages/Login.tsx`: `94fd42d2fbf45ad241f210d83e4728768d134008190549189a92a9d2fa95e1d2`
- `client/src/pages/Profile.tsx`: `59aa88ab277edfad10ac544300894540559a54c6a027497ce9efaa24833d0df7`

The source and diff were inspected. No build, browser check, or runtime test was performed for this copy change; public-tree QA is being handled separately. These hashes identify the changed source, not evidence of a test run.
