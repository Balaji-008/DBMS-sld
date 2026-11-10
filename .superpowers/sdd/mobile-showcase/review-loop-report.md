# Bounded review-loop runner

Status: **DONE_WITH_CONCERNS** — fixed runner gates and the systemd scope wrapper are implemented and exercised with cheap runner-only probes. No application build, service-backed test, browser suite, or media render was launched; those remain for the root-coordinated slot.

Files changed:
- `scripts/review-loop.mjs`
- `docs/showcase/review-loop.md`
- `.superpowers/sdd/mobile-showcase/review-loop-report.md`

Commands run and observed results:
- `node --check scripts/review-loop.mjs` — passed.
- Old wrapper red: `systemd-run --user --scope --wait --quiet --unit=review-loop-probe-invalid --property=MemoryMax=128M --property=MemorySwapMax=0 --property=CPUQuota=100% -- /usr/bin/true` — exit 1, `--wait may not be combined with --scope`.
- Candidate wrapper no-op: `systemd-run --user --scope --collect --quiet --unit=review-loop-probe-true --property=MemoryMax=128M --property=MemorySwapMax=0 --property=CPUQuota=100% -- /usr/bin/true` — exit 0. Adding `--pipe` was also rejected by this systemd CLI as incompatible with `--scope`; the runner keeps inherited output without it.
- Candidate wrapper exit propagation: the same scope/cgroup command with a Node child calling `process.exit(7)` — exit 7.
- `node scripts/review-loop.mjs --self-check` — `WRAPPER SELF-CHECK PASS`: through the runner's exact guarded command builder, no-op exit 0, requested exit 7 propagated as 7, and a 400 ms deadline stopped the sleeping child in 422 ms; systemd scope memory cap recorded as 256 MiB. Self-check then passed gate definitions, finite timeouts, redaction, secret-path exclusions, cache rules, and media reserve arithmetic.
- `systemctl --user list-units --type=scope --all` filtered for runner probe names — no probe units remained; `pgrep` for self-check children returned no matches.
- `node scripts/review-loop.mjs --list` — listed the fixed task sequences. `app` includes typecheck, build, Oracle integration, and branded email/MIME gates; mobile browser, Oracle, email, public-health, and artifact gates are explicitly `resume=never`.
- `node scripts/review-loop.mjs --task mobile --dry-run` — listed all five gates sequentially with fixed command, timeout, heap, resume policy, and source-file count; no gate command ran.
- `node scripts/review-loop.mjs --task release --dry-run` — listed the live public-health and artifact-inventory checks; no network request or artifact gate ran.
- `node scripts/review-loop.mjs --media-preflight --expected-working-gib 4` — read-only `statfs` result: 8.77 GiB available, 8 GiB required (4 GiB working budget + 4 GiB reserve), `enough: true`. This only proves the chosen example budget; no render ran.
- `node scripts/review-loop.mjs --self-check` also exercises the pure media reserve threshold: expected render budget plus a fixed 4 GiB free-space reserve.

Resource snapshot at start: 8.6 GiB RAM available; 8.1 GiB free disk on a 100% used root filesystem; port 3000 responded, ports 3001–3005 did not respond. A video capture browser and FFmpeg processes were active and left untouched. No job was launched by this lane.

Later read-only status sample: API and tunnel user units were active/running; `127.0.0.1:3000/api/health` returned HTTP 200 and ports 3001–3005 had no response. 8.8 GiB RAM and 8.2 GiB disk were available; root remained reported as 100% used. No health response body or service credentials were inspected.

QA subsequently reported that their first `--resume` invocation had no prior state and exited 2, then the first real mobile run recorded the invalid `--wait` wrapper failure before TypeScript began. The runner now starts a fresh stateful run when `--resume` has no prior run; it preserves any existing failed run and repair history. This lane has not cleared or overwritten QA's recorded failure.

Design notes:
- Tasks contain literal allowlisted commands; there is no dynamic shell string, external task file, AI dispatch, or automatic source repair.
- Static passes can be reused only on a matching SHA-256 of their declared source inputs and Node version. Browser gates always rerun because DB/service state can change.
- Reused pass records preserve the original completion time and source hash and add a separate reuse timestamp; they are not reported as fresh passes.
- The uncached `release` task checks one public API health response and verifies fixed screenshot, QA report, presentation, and video artifact signatures. It reads only 16-byte headers, performs no media work, and stays separate from disk-budgeted rendering.
- `app` includes the existing `npm run test:integration` Oracle suite and `npm run test:brand-email`; both are uncached, and neither was run by this lane. Before running the Oracle suite, confirm the configured connection targets an approved test database; it inserts/deletes synthetic rows and clears test OTP records.
- Release paths now match the deliverables: `deliverables/presentation/amrita-placement-portal-showcase.{pptx,pdf}` and `deliverables/video/amrita-placement-portal-showcase.mp4` plus `amrita-placement-portal-showcase-poster.jpg`. The runner validates only presence, size, and file headers, not media quality.
- `--media-preflight --expected-working-gib N` performs a read-only `statfs` check requiring `N + 4 GiB` available. It is not a media-render command and must be rerun immediately before an approved render.
- The systemd invocation no longer combines `--scope` with `--wait` or `--pipe`. It uses `--scope --collect`, and the self-check verifies actual no-op, nonzero exit, and timeout behavior through the same wrapper used for gates.
- A failed or timed-out gate halts the task, writes `failure.json`, preserves per-attempt output, and requires an explicit `--resume` after a fix. Up to three repair iterations are recorded per run.
- Gate output is capped and sanitized before writing logs or JSON. Timeout handling signals the process group and requests systemd scope termination when systemd limits are available.
- The legacy `tests/review-regression.ts` lock-contention test remains excluded. The main Oracle integration suite is included but was not run by this lane; it requires an approved test database and must not target production.

Open concerns:
- Actual app/build/browser gate commands and browser cleanup paths remain unexecuted by this lane. Systemd cgroup limits depend on the user's manager being available; the report records when they could not be applied, while Node heap and timeout caps remain.
- Existing mobile source findings and QA status are outside this runner lane. The runner provides gate evidence; it does not close the drawer focus-trap finding or existing 320px overflow failures.

Commit: none; root coordinates final integration.
