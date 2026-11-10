# Sol independent initial review — public release

This review began from the current source and reachable local Git history, without an initial author draft. It is a read-only independent design/security/publication review, not a model-runtime or upstream EGM plugin invocation. The Goldfish review of the sanitized patch draft remains a separate later gate.

## Decision

Do not publish the existing full history yet. Public-source blockers PR-01 and PR-02 and artifact gate PR-03 are recorded with evidence and fix expectations in [public-readiness-findings.md](../../../docs/showcase/public-readiness-findings.md). The separate documentation/presentation worker is already editing the release artifacts; this report does not pre-approve those edits.

## Landing overlap: source-linked diagnosis for the UI owner

`client/src/pages/Landing.tsx:22-25` places the hero copy, animated `hero-motion`, and campus sketch in one hero. `client/src/styles.css:2187-2195` gives the hero a fixed minimum height and hidden overflow; `:2243-2251` anchors the sketch absolutely to the bottom at 275px high. Copy and animation are at `z-index:2` (`:2929-2932`, `:2197-2205`), above the sketch at `z-index:1`. At the tablet breakpoint `:3184-3191`, hero height drops to 620px and sketch height to 260px, while a later `:3417-3422` rule expands the aside grid track from 160px to 220px. This leaves less width for copy and no intrinsic height contribution from the sketch. At mobile `:3240-3274`, the aside is hidden but the hero/sketch still use fixed minima and absolute art, so wrapped copy/actions can occupy the artwork's area. These are concrete CSS conditions for the reported overlap, not a new browser observation.

Suggested UI acceptance: measure element rectangles and capture 320, 390, 650, 651, 768, and 900px widths after the fix; verify hero copy and interactive controls do not overlap the animated/art region, image bounds do not clip unexpectedly, reduced-motion poster/control behavior remains correct, and the campus art remains visible. Avoid relying on the old showcase screenshots as proof of the new code.

## Security and privacy observations

Source guards for JSON mail mode, edge forwarding, role-scoped upload reads, owner validation, and Oracle bind parameters were present in the paths reviewed. The public-ready statement must still be conditional: source review cannot prove live secrets, remote worker behavior, browser security on physical devices, or all authorization paths. Student self-registration accepts any mailbox after OTP and auto-activates, so public copy must not describe it as verifying enrollment. See PR-04 in the findings report.

## PowerPoint and EGM follow-up

The current exported PPTX contains member identifiers/ownership wording in slide 5 XML and names in slide 5 notes XML. Inspect the regenerated PPTX/PDF and source after the documentation worker finishes; separate speaker scripts may describe team-agreed speaking assignments. For the final Goldfish pass, review the *sanitized patch draft*, current captures, QA measurements, and release references with no initial author rationale. Report unresolved issues by source line and artifact, and preserve the measured/not-measured boundary.

## Evidence and limitations

What ran: read-only `git` inventory, source reads, `.env` value comparison held in memory, byte-pattern scan across reachable blobs, tracked-path inventory, and PPTX XML search. Raw evidence: terminal output from this review session and path/line references in the companion findings report. Result: committed privacy data and current PPT ownership are confirmed **[MEASURED]**; no high-confidence credential match was found by the bounded scan **[MEASURED]**. Confounds: scanner pattern coverage, binary visual content, and concurrent edits. Not measured: live exploitability, new browser geometry, final presentation export, fresh role QA, or public GitHub state.
