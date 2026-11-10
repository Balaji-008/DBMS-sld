# Bounded review loop

`scripts/review-loop.mjs` runs only the repository's fixed gate lists. It does not dispatch reviewers, edit source, inspect credentials, or accept shell commands from task data. A person or coordinating agent fixes a reported defect and starts the next bounded pass.

## Tasks

| Task | Sequential gates | Resume behavior |
| --- | --- | --- |
| `app` | `typecheck` → `build` → Oracle integration → branded OTP email/MIME | Typecheck and build can be reused by source hash. The Oracle integration and email preview gates always rerun because they use mutable DB state or produce downstream preview artifacts. |
| `mobile` | `typecheck` → `build` → `brand-browser` → `shell-browser` → `functional-browser` | Typecheck and build can be reused by source hash. Browser gates always rerun because their results depend on live services and mutable test data. |
| `release` | public API health → fixed screenshot, QA report, PPTX, PDF, MP4, and JPEG inventory | Both gates always rerun; the health probe is live and the artifact check reads current file headers and sizes. |

The mobile browser gates run one at a time. `functional-browser` exercises all three roles and contains a `finally` cleanup for its browser, generated records, mail capture, server, and DB handle. The browser suites close their own browser/server/DB handles in `finally` on ordinary pass/failure. A hard timeout terminates the process group and is reported as a failure; forced termination cannot guarantee JavaScript `finally` cleanup, so inspect service and test-data state before retrying. Before running `app`, confirm that the local Oracle configuration targets an approved test database: `tests/integration.ts` creates and removes synthetic rows and clears test OTP state. Never run it against production. The separate legacy `tests/review-regression.ts` lock-contention regression is not part of any task.

## Use

From the repository root:

```sh
node scripts/review-loop.mjs --list
node scripts/review-loop.mjs --task mobile --dry-run
node scripts/review-loop.mjs --task mobile
node scripts/review-loop.mjs --task mobile --resume
node scripts/review-loop.mjs --media-preflight --expected-working-gib 4
node scripts/review-loop.mjs --self-check
```

Coordinated final sequence: after confirming the configured Oracle endpoint is an approved test database, run `node scripts/review-loop.mjs --task app`; resume the preserved mobile wrapper failure with `node scripts/review-loop.mjs --task mobile --resume` after the QA slot transfers; after QA/video deliverables are frozen, run `node scripts/review-loop.mjs --task release`. The release task is deliberately last because its health and artifact gates are live and uncached.

The first real run creates an ignored directory at `test-results/review-loop/<task>/<run-id>/`. `state.json` records the ordered gates, input hash and file list, exact allowlisted command, exit/signal/timeout result, applied resource limits, and sanitized output excerpt. Each gate has a sanitized capped log. A failing or timed-out gate stops the task and creates `failure.json` with the smallest available diagnostic excerpt and log path. The runner does not count a failure as a pass and does not retry automatically. If `--resume` is used before a run exists, it creates a fresh run and marks no gates passed.

After a source fix, use `--resume`. The same run records a repair iteration and preserves every attempt in each gate's `history`. A reused pass keeps its original completion timestamp and source hash; reuse is separately timestamped, so it is not presented as a fresh pass. At most three explicit repair iterations are permitted per run; after that, record a maintainer decision and start a fresh run. A changed input hash reruns a prior passing static gate. Browser, public health, and release artifact gates are never cached, even if their source hash did not change.

## Bounds and limits

- Process gates have a fixed wall-clock timeout (180–300 seconds), fixed Node heap ceiling (768–2560 MiB), and two-CPU affinity where Linux `taskset` permits it. Built-in release checks use a 15-second fetch timeout or inspect only fixed file metadata and 16-byte headers.
- If a user systemd manager is available, the child process uses `systemd-run --user --scope --collect` with a matching `MemoryMax`, zero swap allowance, and `CPUQuota=200%`. `--scope` is intentionally run without `--wait` or `--pipe`; systemd forwards the command's output and exit status. On timeout the runner stops the named scope, then signals the process group. The report records when cgroup limits could not be applied; the Node heap limit is not a substitute for a process-tree memory limit.
- Logs are capped at 256 KiB, redact email addresses, six-digit codes, and common credential-like fields, and keep only a short sanitized failure excerpt in JSON. Browser artifacts are left at their established `test-results/` paths.
- Inputs exclude `.env*`, `node_modules` contents, generated build output, and `test-results/` except the explicit email preview fixture used by the brand suite. No environment variable values enter an input hash or report.
- Disk exhaustion, external DB state, missing local services, and test-owned cleanup failures can still cause a gate to fail. The report is evidence of the command outcome, not an automatic product approval.
- The `release` task is read-only: it sends one public health GET and reads only file metadata plus the first 16 bytes for fixed artifact signatures. It performs no render, export, or browser work. Video/deck media rendering remains a separately approved, disk-budgeted phase; this runner does not invoke it.
- The release inventory checks the expected files under `deliverables/presentation/` and `deliverables/video/`. Its MP4/JPEG checks confirm only a non-empty file and a recognizable header; they do not establish video quality, duration, frame rate, audio, or HyperFrames validity. Use the video owner's HyperFrames check and `ffprobe` evidence for those claims.
- Before a separately approved media render, run `--media-preflight` with the renderer's expected temporary working budget in GiB. The check uses `statfs` and requires at least **4 GiB of free space after that budget** (`available >= expected working GiB + 4 GiB`). It is a point-in-time gate; rerun it immediately before rendering, and don't treat a smaller estimate as permission to proceed.
- `--self-check` executes the same guarded process path for a successful no-op, an exit-7 command, and a bounded timeout; these are runner-only probes, not app/browser gates.
