# Runtime Recovery — 2026-11-09

Status: DONE_WITH_CONCERNS
Owner: Luna runtime/backend lane

## Scope and safety

- Restored the named Cloudflare tunnel with the existing `npm run tunnel:start` path.
- After QA freeze and root authorization, transitioned only `campusbridge-api.service` and `campusbridge-tunnel.service` from transient to persistent user services. No Oracle or unrelated service was stopped, restarted, inspected for credentials, or modified.
- Did not send email or print `.env`, application passwords, private keys, or tunnel tokens.
- Never printed `.env`, application passwords, private keys, or tunnel tokens.

## Commands and observed results

- `git status --short --branch` → clean `feat/oracle-portal` at task start.
- `node -e "fetch('http://127.0.0.1:3000/api/health')..."` → HTTP 200, `database: connected`, `smtp_configured: true`, `mail_transport: smtp`.
- `npm run tunnel:status` before recovery → `MainPID=0`, `ActiveState=inactive`, `SubState=dead`.
- `npm run tunnel:start` → systemd started transient `campusbridge-tunnel.service`, invocation `8932ee69e0194010a97af3f5c17f1a3a`.
- `npm run tunnel:status` after recovery → active/running, PID 1126933, `MemoryCurrent=284495872` bytes. The configured cap remains 384 MiB.
- Public `https://dbms.sld.parswanadh.dev/api/health` → HTTP 200 with Oracle connected and SMTP configured.
- Public `https://dbms.sld.parswanadh.dev/login` → HTTP 200 with the app HTML.
- Initial `systemctl --user show ...` → API and tunnel were transient units; API had 512 MiB cap and tunnel 384 MiB cap. `loginctl show-user parshu -p Linger` → `Linger=yes`.

## Diagnosis limits

The retained tunnel journal shows starts on Nov 4 and the accounting line on Nov 5 17:34:46 IST (5m7s CPU, 324.5 MiB peak, 0B swap), but no failure/exit reason. The latest recovery produced successful Cloudflare connectivity prechecks and four registered tunnel connections. The observed evidence establishes the unit was inactive and now works; it does not establish why it stopped.

## Durability follow-up

Added persistent unit templates under `systemd/user/` and an idempotent installer at `scripts/install-user-services.mjs`; `npm run services:install` writes user units and enable links without starting/stopping services. If either active unit is still transient, the installer defers `daemon-reload`. After QA freeze, stopped only the tunnel and API units, ran `systemctl --user daemon-reload`, then started API followed by tunnel. Both now load from `$HOME/systemd/user/`, are enabled, and are active. The API remains capped at 512 MiB memory / 128 MiB swap; the tunnel remains capped at 384 MiB / 128 MiB swap. No Oracle/daemon resource policy changed.

- `node --check scripts/install-user-services.mjs` → passed.
- `npm run services:check` → both rendered units passed `systemd-analyze verify`; no user service was changed.
- `git diff --check` → passed.
- Post-transition `systemctl --user show ...` → both units active/enabled with persistent `FragmentPath`; memory and swap caps match above.
- Local API and public health → HTTP 200; health JSON has Oracle `connected` and SMTP configured `true`.
- `docker ps --filter name=oracle-free --format '{{.Names}} {{.Status}}'` → `oracle-free Up 4 days (healthy)`.
- Immediately after starting the persistent tunnel, one public health request returned Worker 503 while the tunnel was still registering. After its four Cloudflare connections registered, public health returned 200 and remained healthy through deployment verification.

## Client deployment and public verification

- `npm run deploy:cloudflare` → successful deployment, Worker version `e125b088-7e44-4c38-99ab-9af926a914b9`; uploaded `/index.html` and `/assets/index-DkwLod41.js`. Wrangler listed existing VPC service and Assets bindings; no Worker proxy configuration changed.
- Public `/login` → 200; HTML references `/assets/index-DkwLod41.js`; bundle fetch → 200.
- Final public `/api/health` → 200, Oracle connected, SMTP configured.
- Final public `/api/opportunities/not-a-number` → 400 `Invalid numeric identifier.`
- 35 public `GET /api/auth/config` requests → all 200; no OTP endpoint or external email invoked.

## Post-review service lifecycle verification

The initial persistent-unit conversion left the old `start` helpers unchanged. Source inspection found that after `npm run stop` / `npm run tunnel:stop`, those helpers would try to create a transient unit with the same name rather than starting the installed persistent unit. Updated both helpers to detect the installed user unit, run `systemctl --user daemon-reload` if it exists but is not loaded, and use `systemctl --user start`. They retain the original bounded `systemd-run --user --collect` limits only when no persistent user unit file exists. Active-service start calls remain idempotent.

- `node --check scripts/service.mjs && node --check scripts/tunnel-service.mjs && git diff --check -- scripts/service.mjs scripts/tunnel-service.mjs` → passed.
- With both persistent units active, `npm run start:background` and `npm run tunnel:start` → each reported already running and returned successfully.
- `npm run tunnel:stop` and `npm run stop` → both completed; only CampusBridge units were stopped.
- `npm run start:background` and `npm run tunnel:start` after stop → both started through persistent user units. `systemctl --user show ...` confirmed persistent `FragmentPath`, enabled, and active; caps remained API 512 MiB / tunnel 384 MiB with 128 MiB swap limits.
- `npm run status` → local health HTTP 200 with Oracle connected and SMTP configured. `npm run tunnel:status` → active/running. Public health on first post-start poll → HTTP 200. `docker ps --filter name=oracle-free --format '{{.Names}} {{.Status}}'` → `oracle-free Up 5 days (healthy)`.
