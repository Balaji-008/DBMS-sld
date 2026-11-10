# Portal Runtime Recovery and E2E Verification — Retrospective Design

> Record type: retrospective execution record, written after the 2026-11-09 recovery, fixes, tests, and deployment. It does not claim to have been an approved pre-implementation spec.

## Goal

Restore and verify the Oracle-backed CampusBridge placements portal after the user reported that the public UI was broken. Keep Oracle available, fix backend and browser regressions found by E2E, make the local API and tunnel persistent across user sessions/reboots, and publish the verified client build.

## Initial symptom and evidence

At the start of the session, Oracle Free was healthy and had been up for four days; the local CampusBridge API on port 3000 was active and `/api/health` returned HTTP 200 with Oracle connected and SMTP configured. The named tunnel unit was inactive, so the public login/static route returned 200 while the public API route returned 503. The retained tunnel journal did not contain an exit reason for the previous stop; no root cause is claimed.

## Success criteria

- Local and public `/api/health` return HTTP 200 and report Oracle connected and SMTP configured.
- Public login returns HTTP 200 and serves the tested client bundle.
- Numeric business path IDs reject malformed, non-positive, and unsafe integer values with HTTP 400; valid missing IDs remain HTTP 404.
- Authenticated navigation reads and logout do not consume the IP throttle budget reserved for auth mutation/OTP endpoints; OTP verification remains throttled.
- Oracle integration suite passes all 87 checks; UI functional, navigation, and branding browser suites pass 16, 21, and 22 checks respectively; `npm run build` passes.
- API and tunnel are active, enabled persistent user services with the existing API 512 MiB and tunnel 384 MiB memory caps and 128 MiB swap caps.
- The verified client is deployed and the public login references `index-DkwLod41.js`; final Worker version is recorded.
- Oracle remains healthy and is not restarted or reconfigured. No external email is sent during tests.

## Non-goals

- Change Oracle schema, seed data, container configuration, resource policy, or shared database grants.
- Send OTP or other email to a real recipient as part of verification.
- Claim that the cause of the earlier transient tunnel stop is known.
- Claim end-to-end Gmail inbox delivery from an SMTP-configured health check or JSON-capture test transport.

## Constraints

- Root coordinates and reviews; lane owners edit only their assigned files.
- Runtime/backend changes are limited to `server/**`, `scripts/**`, `systemd/**`, `cloudflare/**`, required root package scripts, and runtime/backend reports.
- Oracle QA owns `tests/integration.ts` and its report; UI QA owns client/browser-test files and its report; documentation QA owns team-viva documents and their authorized README links.
- Do not expose `.env`, app passwords, private keys, Cloudflare tokens, or OTP values in logs or reports.
- Preserve API/tunnel resource caps. Never stop or restart Oracle.
- Use a controlled test mail capture transport; do not send real email.

## Design and actual outcome

The public static app was available while its private API tunnel was down. The named tunnel was restored first through the existing `npm run tunnel:start` command so public API validation could resume. QA then exercised the Oracle-backed API and browser workflows. Two backend defects were corrected: numeric business `:id` path values were validated centrally before Oracle binding, and auth rate limiting was scoped to POST requests other than logout so normal config/me reads and logout do not spend the auth mutation budget. UI QA found and fixed hackathon selection state after registration so the registration modal closes and the registrations list opens only on explicit selection.

To prevent another login/session-related outage, persistent per-user systemd definitions and an idempotent installer were added. After all QA ports were closed and the root authorized the transition, only the CampusBridge API and tunnel units were stopped and restarted under persistent definitions. Oracle remained healthy. The verified `client/dist` build was deployed through the existing Wrangler script without changing Worker proxy configuration.

## Assumptions

- The existing Oracle API configuration and Cloudflare VPC binding remain valid; both were verified by local and public health checks.
- User lingering is enabled, allowing enabled user units to start with the user manager after reboot.
- Wrangler's existing user credential context remains available to the tunnel service.
- The build artifact produced by QA is the client version intended for deployment.

## Risks and limits

- The retained journal lacks a tunnel exit/failure cause, so this recovery proves service availability but not why the earlier transient unit stopped.
- Public health returned one Worker 503 immediately after the persistent tunnel started while its Cloudflare connections were still registering; it returned 200 after four connections registered and stayed healthy in final checks.
- SMTP configuration is present and reported by the health endpoint, but test runs used a JSON capture transport and did not test real Gmail delivery or inbox receipt. A future end-to-end Gmail inbox check remains open.
- This worktree was not committed; integration and independent review remain pending.
