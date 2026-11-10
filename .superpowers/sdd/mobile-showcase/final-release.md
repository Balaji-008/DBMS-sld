# Mobile showcase release closeout

**Status:** Ready for user review. Coordinated release closeout recorded 2026-11-09.

## Verified release state

- The fixed app, mobile and release tasks completed **11/11 gates** in the final runner state. App checks: typecheck, build, Oracle integration (87 checks), and branded OTP email/MIME preview (14 checks). Mobile checks: brand (29), shell (35), and functional (43). Release checks: public API health and the fixed artifact inventory. All final gate exits were zero. The runner state and source hashes are linked in [the automated final gate report](automated-final-gate.md); the earlier systemd wrapper failure remains preserved as history.
- The latest recorded Cloudflare deployment is Worker `campusbridge-dbms`, version `83680f1b-b35b-4fe4-84b0-a5771605485d`. Read-only checks returned HTTP 200 for the public home, login, and API health endpoints; the health response reported Oracle connected and SMTP configured. The deployed JS, CSS, and listed media hashes matched the frozen local build. See [release operations](release-ops-report.md).
- The final mobile browser suites exercised routes at 320, 360, 390, 430, and 768 CSS pixels. The reports record no mobile layout issues, uncaught browser errors, or failed images in the final run. These were browser-emulated checks, not physical-device certification. See [mobile QA](qa-report.md).
- The editable [five-slide PPTX](../../../deliverables/presentation/amrita-placement-portal-showcase.pptx) and matching [five-page PDF](../../../deliverables/presentation/amrita-placement-portal-showcase.pdf) were structurally validated and visually inspected. The [22-second MP4](../../../deliverables/video/amrita-placement-portal-showcase.mp4) is 1920×1080, 30 fps, H.264 High with AAC LC stereo; its poster is 1920×1080. The independent artifact-level review approved the deck and video with no blocking findings. See [media review](media-quality-review.md), [deck report](plan-deck-report.md), and [video provenance](../../../deliverables/video/README.md).
- The document review used a local adaptation of the EGM workflow: round one found two Major document gaps, v3 addressed them, and a fresh round two reported no actionable findings. The upstream EGM plugin was not installed or invoked. See [review record](../../../tools/egm/review-record.md).
- README local artifact links were checked against the source tree, and the current share copy and media attribution are included with the deliverables. The team contribution statements are the agreed viva allocation, not commit-history or effort claims.

## Scope and limits

Final test mail was captured locally; no real email or OTP was sent. SMTP configuration/health does not establish inbox delivery or a human OTP login. Oracle remains the application's only database. The public service depends on this laptop, its network, Oracle, and the named tunnel. Browser journeys cover exercised flows and do not establish exhaustive authorization, security, or accessibility coverage. Aggregate placement data shown in reports is not verified as campus outcome data. The media review checks exported artifacts and local provenance, not physical-device playback or exhaustive source-claim verification.

## User review

Review the [README](../../../README.md), [editable deck](../../../deliverables/presentation/amrita-placement-portal-showcase.pptx), [PDF](../../../deliverables/presentation/amrita-placement-portal-showcase.pdf), [video](../../../deliverables/video/amrita-placement-portal-showcase.mp4), [poster](../../../deliverables/video/amrita-placement-portal-showcase-poster.jpg), and [share copy](../../../deliverables/video/share-copy.txt). Confirm the preferred handoff and, before any live OTP demonstration, confirm that the configured demo inbox is reachable.
