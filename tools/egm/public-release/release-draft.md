# Public source release — review draft

Status: review draft only. The public GitHub repository is intended to be `https://github.com/Parswanadh/DBMS-sld`; do not claim it has been created, pushed, or verified reachable until a separate publication gate confirms that state.

## Goal
Publish a useful, privacy-reviewed source snapshot for the Amrita Bengaluru DBMS placement portal. The public project should let a reader understand the Oracle-centered relational design, run the application with its documented local prerequisites, and follow the student, recruiter, and placement-team workflows.

## System context
- The client is React and TypeScript. The Express API checks roles, binds SQL parameters, and coordinates Oracle transactions.
- Oracle Database is the only application database. Gmail SMTP delivers OTP messages; it is not a data store. Cloudflare serves the client and forwards API requests through the configured private route/tunnel. APEX SQL Workshop is a separate read-only inspection path for business tables.
- The relational schema includes business workflow tables and authentication/file-support tables. Repeated student phone numbers and opportunity eligibility/skills have relation rows; selected JSON columns are serialization mirrors. Placement rows preserve a snapshot of requirements. The DBMS walkthrough describes actual constraints and API-managed transactions; do not claim business triggers or stored procedures.
- Student email verification establishes access to the submitted mailbox. It does not establish enrollment or institutional affiliation. Recruiter access requires placement-team approval.

## Release scope and constraints
This release packages current source, documentation, a five-slide presentation, speaker scripts, video, and the measured landing update. The landing hero places the sketch in normal flow and retains reduced-motion behavior. An original abstract campus-contour illustration is a decorative pattern; it is not an official campus depiction or a logo.

The release plan does not include API, role-authorization, database-model, or data-flag changes. Reviewers should check current source and documentation for consistency; the isolated public snapshot has no private Git history from which to prove a historical no-change claim or infer authorship. Do not present current-state source inspection as a diff. The release must not add credentials, environment files, runtime uploads, raw QA logs/screenshots, student or recruiter records, private course materials, or the original private repository history.

The deck explains the product, architecture, relational model, workflows, and DBMS validation. It contains no individual ownership or contribution assignments in slide text, notes, alt text, or document properties. Team presentation allocations belong in the separate scripts only. The five scripts provide four individual speaker slots plus a timed master handoff and describe agreed presentation scope rather than commit authorship.

## Design choices and alternatives
- **Keep Oracle as the application database.** Adding a hosted database or syncing records elsewhere would change the project boundary, add migration and consistency risks, and is outside the DBMS project's demonstrated design.
- **Use a normal-flow responsive hero with reduced-motion support.** Keeping the sketch absolutely positioned against a fixed-height hero risks renewed overlap when copy wraps. A video-only or animation-only hero would remove the existing campus context or motion choice.
- **Link the poster directly to the MP4.** This works as ordinary GitHub Markdown without assuming GitHub renders an inline `<video>` element.
- **Create a sanitized source snapshot without private Git history.** Publishing the existing private repository history would expose unrelated history and could retain private data. A clean snapshot can be reviewed file-by-file before the repo is created.
- **Keep the deck to five slides and use a DBMS validation close.** A speaker ownership slide is unnecessary for explaining the schema and can be confused with verified authorship; the separate speaker scripts give the team an explicit handoff.

## Verification evidence
The following claims must remain tied to the cited release artifacts and their scope:

- The mobile app gate completed five gates: typecheck, production build, brand/landing, shell/navigation, and three-role functional browser coverage. Counts are 29 brand/landing checks, 35 shell/navigation checks, and 43 functional checks [MEASURED] in `.superpowers/sdd/public-release/qa-publish-report.md`.
- The app gate completed four gates: typecheck, production build, 87 Oracle integration checks, and 14 email/MIME preview checks [MEASURED] in the same report. Test mail used in-process JSON capture; no external message was sent.
- The public landing regression passed 19 checks across 12 CSS viewport widths from 320 to 1920 px [MEASURED], includes computed-font-size emulation at 200% across four widths [MEASURED], and confirms reduced-motion uses static posters with no animated GIF requests. The measured rectangles and source hashes are in `docs/showcase/public-device-results.json`.
- These are automated browser and integration checks, not exhaustive validation/authorization coverage, physical-device certification, external inbox delivery, performance benchmarks, or verified placement outcomes. Text-size emulation is not browser chrome zoom.
- No GitHub repository creation or push is part of these QA results. Publication is a separate final action and should be reported only after reachability is checked.

## Success criteria
- README source/demo/video links resolve in the repository, the poster links to the actual MP4, and local setup explains Oracle, Gmail, and private tunnel requirements without revealing secrets.
- All speaking scripts and the five-slide presentation agree with the current schema and workflow sources. Speaker allocations remain outside slide text, notes, alt text, and document properties.
- The public snapshot is scanned and reviewed as an exact allowlist before publication. It contains no environment values, personal contact addresses that are not necessary, private history, PII, runtime records, or course/study materials.
- QA statements cite dated current evidence and disclose the limits above. Any later source change invalidates its source-hash-linked QA claim until rerun.
- GitHub publication status stays explicitly pending until the parent completes repository creation and verifies the public URL.

## Risks and open questions
- The public service depends on the laptop, Oracle, local network, and tunnel. A public hostname alone does not guarantee that the local path is online.
- Student self-registration can establish mailbox access without proving enrollment; public copy must not imply an institutional identity check.
- Browser emulation and a bounded set of automated journeys cannot prove physical-device behavior or every authorization path.
- A snapshot exporter can omit or transform files unexpectedly. Review the actual snapshot and its manifest; a dry run is not publication approval.
- No real email was sent during the recorded release gates. A live OTP demonstration requires a separately confirmed reachable inbox.
