# Public source release — review draft

Status: the public repository `https://github.com/Parswanadh/DBMS-sld` was published on `main` at `3c4308f5bbfa64aa1f11a640e25e99dd0377dbcf` [MEASURED] (release-owner confirmation). Follow-up privacy-copy edits were tested in the public checkout based on that commit and were uncommitted during QA; do not claim those edits are on `main` until their later commit and push are recorded. The original private repository history was not published.

## Goal
Document and review a useful, privacy-aware public source release for the Amrita Bengaluru DBMS placement portal. The repository should let a reader understand the Oracle-centered relational design, run the application with its documented local prerequisites, and follow the student, recruiter, and placement-team workflows.

## System context
- The client is React and TypeScript. The Express API checks roles, binds SQL parameters, and coordinates Oracle transactions.
- Oracle Database is the only application database. Gmail SMTP delivers OTP messages; it is not a data store. Cloudflare serves the client and forwards API requests through the configured private route/tunnel. APEX SQL Workshop is a separate read-only inspection path for business tables.
- The relational schema includes business workflow tables and authentication/file-support tables. Repeated student phone numbers and opportunity eligibility/skills have relation rows; selected JSON columns are serialization mirrors. Placement rows preserve a snapshot of requirements. The DBMS walkthrough describes actual constraints and API-managed transactions; do not claim business triggers or stored procedures.
- Student email verification establishes access to the submitted mailbox. It does not establish enrollment or institutional affiliation. Recruiter access requires placement-team approval.

## Release scope and constraints
This release packages current source, documentation, a five-slide presentation, speaker scripts, video, and the measured landing update. The landing hero places the sketch in normal flow and retains reduced-motion behavior. An original abstract campus-contour illustration is a decorative pattern; it is not an official campus depiction or a logo.

The release plan does not include API, role-authorization, database-model, or data-flag changes. Reviewers should check current source and documentation for consistency; the published snapshot has no private Git history from which to prove a historical no-change claim or infer authorship. Do not present current-state source inspection as a diff. The release must not add credentials, environment files, runtime uploads, raw QA logs/screenshots, student or recruiter records, private course materials, or the original private repository history.

The five-slide deck [MEASURED] explains the product, architecture, relational model, workflows, and DBMS validation. It contains no individual ownership or contribution assignments in slide text, notes, alt text, or document properties, as checked in the current published-source review. Team presentation allocations belong in the separate scripts only. The four individual speaker scripts plus timed master handoff [MEASURED] describe agreed presentation scope rather than commit authorship.

## Design choices and alternatives
- **Keep Oracle as the application database.** Adding a hosted database or syncing records elsewhere would change the project boundary, add migration and consistency risks, and is outside the DBMS project's demonstrated design.
- **Use a normal-flow responsive hero with reduced-motion support.** Keeping the sketch absolutely positioned against a fixed-height hero risks renewed overlap when copy wraps. A video-only or animation-only hero would remove the existing campus context or motion choice.
- **Link the poster directly to the MP4.** This works as ordinary GitHub Markdown without assuming GitHub renders an inline `<video>` element.
- **Use a sanitized source snapshot without private Git history.** Publishing the original private repository history could expose unrelated history and private data. Review each public snapshot update and its allowlist before publishing that update.
- **Keep the deck to five slides and use a DBMS validation close.** A speaker ownership slide is unnecessary for explaining the schema and can be confused with verified authorship; the separate speaker scripts give the team an explicit handoff.

## Verification evidence
The current public-source follow-up must be distinguished from the original pre-export result. The pre-export device run had 19 checks [MEASURED] and an outdated Login hash; the 2026-11-11 public-checkout follow-up supersedes it for the Login/Profile copy and reports actual hashes for the tested public source.

- The follow-up source state was a public checkout based on commit `3c4308f5bbfa64aa1f11a640e25e99dd0377dbcf`, with frozen Login/Profile privacy-copy edits that were uncommitted at QA time. Its source hashes [MEASURED] are recorded in `docs/showcase/public-device-results.json` and `tools/egm/public-release/public-qa-followup.md`: Landing `91b67ecc93bbc2d69390c2920e6f5719b47a78a95144a665425d91e5995c4bcc`; Login `94fd42d2fbf45ad241f210d83e4728768d134008190549189a92a9d2fa95e1d2`; Profile `59aa88ab277edfad10ac544300894540559a54c6a027497ce9efaa24833d0df7`; stylesheet `acf9f93e031d6512be7644d8eb16f7e970068108513c0c9b63fe0afea68c3714`.
- The targeted public landing/Login run passed 20 browser checks [MEASURED]. It includes the Login privacy dialog, hero overlap checks at 12 CSS widths [MEASURED], computed-font-size emulation at 200% at four widths [MEASURED], and reduced-motion poster behavior. The earlier 19-check run is historical; the follow-up JSON has status `passed` and the newer hashes.
- The serialized mobile review loop passed typecheck, build, brand-browser (29 checks [MEASURED]), shell-browser (35 checks [MEASURED]), and three-role functional-browser (43 checks [MEASURED]) gates. The local email/MIME prerequisite passed 14 checks [MEASURED]. Test mode used JSON mail capture and no external email was sent.
- The privacy-copy response narrows the assurance to Aadhaar documents uploaded through the portal being accessible to the student and authorized placement staff, while external document links follow their host's sharing settings. The Login dialog was targeted by the follow-up assertion. Profile copy was included in the build and its source hash, but no targeted exact-copy assertion for Profile is claimed.
- The public repo exists at the stated URL; the published `main` base is `3c4308f5bbfa64aa1f11a640e25e99dd0377dbcf` [MEASURED] (release-owner confirmation; the cited Goldfish review records that checkout commit but did not query the remote). The tested Login/Profile follow-up remains distinct from that base until its commit/push is recorded.
- These are automated browser and integration checks, not exhaustive validation/authorization coverage, physical-device certification, external inbox delivery, performance benchmarks, or verified placement outcomes. Text-size emulation is not browser chrome zoom. No fresh EGM approval is claimed by this draft.

## Success criteria
- README source/demo/video links resolve in the repository, the poster links to the actual MP4, and local setup explains Oracle, Gmail, and private tunnel requirements without revealing secrets.
- All speaking scripts and the five-slide presentation agree with the current schema and workflow sources. Speaker allocations remain outside slide text, notes, alt text, and document properties.
- Before a follow-up commit/push, scan the actual candidate tree and review its exact allowlist for environment values, unnecessary personal contact addresses, private history, PII, runtime records, and course/study materials. A dry run or prior publication review is not proof that later edits are clean.
- QA statements cite dated current evidence and disclose the limits above. Any later source change invalidates its source-hash-linked QA claim until rerun.
- Published-repository status and the tested follow-up source state are reported separately; later fixes are not attributed to `main` until commit and push evidence exists.

## Risks and open questions
- The public service depends on the laptop, Oracle, local network, and tunnel. A public hostname alone does not guarantee that the local path is online.
- Student self-registration can establish mailbox access without proving enrollment; public copy must not imply an institutional identity check.
- Browser emulation and a bounded set of automated journeys cannot prove physical-device behavior or every authorization path.
- A snapshot exporter can omit or transform files unexpectedly. Review the actual snapshot and its manifest; a dry run is not publication approval.
- No real email was sent during the recorded release gates. A live OTP demonstration requires a separately confirmed reachable inbox.
