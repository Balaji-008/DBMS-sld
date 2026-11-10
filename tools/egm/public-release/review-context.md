# Fresh review context — public release

Use this context for a fresh, adversarial review of the public-release draft and linked artifacts. Do not consult parent conversation, private Git history, private worktree paths, or author rationale. The included prior Sol findings are present only to verify their response independently; do not assume they are closed or treat that report as approval.

## User outcome
Maintain the public `Parswanadh/DBMS-sld` source release with a corrected responsive landing hero, accurate Oracle/DBMS documentation, a clickable poster-to-MP4 link, a five-slide deck without speaker ownership assignments, and individual scripts plus a timed handoff. Review follow-up changes separately from the published `main` base.

## Current publication and QA state
- The repository is published at `https://github.com/Parswanadh/DBMS-sld`. The release owner confirmed `main` at `3c4308f5bbfa64aa1f11a640e25e99dd0377dbcf`. The prior Goldfish report records its checkout commit but says it did not query the remote.
- The Login/Profile privacy-copy follow-up was tested in a public checkout based on that published commit; the QA report says these edits were uncommitted at test time. Do not describe those edits as part of `main` until commit and push evidence is recorded.
- The current public-source QA follow-up and source hashes are in `tools/egm/public-release/public-qa-followup.md` and `docs/showcase/public-device-results.json`. Hashes [MEASURED]: Landing `91b67ecc93bbc2d69390c2920e6f5719b47a78a95144a665425d91e5995c4bcc`; Login `94fd42d2fbf45ad241f210d83e4728768d134008190549189a92a9d2fa95e1d2`; Profile `59aa88ab277edfad10ac544300894540559a54c6a027497ce9efaa24833d0df7`; stylesheet `acf9f93e031d6512be7644d8eb16f7e970068108513c0c9b63fe0afea68c3714`.
- The public landing/Login retest passed 20 browser checks [MEASURED], including the privacy dialog, 12 CSS widths, four 200% computed-font-size emulation widths, and reduced-motion behavior. It supersedes the earlier 19-check pre-export report for the listed public Login/Profile state. The mobile app gate and its limits are in the follow-up report. Do not open `test-results/`, logs, screenshots, or ignored local configuration.
- Login copy now distinguishes portal-uploaded Aadhaar documents, restricted to the student and authorized placement staff, from externally hosted links whose sharing follows their host. It also says email codes verify mailbox control, not institutional enrollment. The Login dialog had a targeted assertion. Profile copy was included in the build and source hash, but its exact wording did not have a targeted assertion.
- The abstract contour art is a generated decorative pattern, not an official campus drawing or logo.
- The published snapshot has no private Git history. Do not infer commit authorship, effort shares, or historical API changes from the current files alone.

## Prior findings to independently re-check
`tools/egm/public-release/sol-goldfish-final.md` records two Major findings and one Nit: stale Login source hash, overbroad Aadhaar document privacy wording, and publication status described as pending. The updated draft separates the published base from uncommitted tested follow-up, cites current hashes, narrows the privacy wording, and states the published status. Verify each response against current allowlisted evidence. Do not claim fresh EGM approval.

## Review questions
1. Is the draft accurate about architecture, Oracle-only persistence, Gmail transport, APEX access, enrollment verification, document-sharing boundaries, and DBMS behavior?
2. Are QA results tied to the tested public source state, with the 20-check follow-up clearly distinguished from the earlier 19-check result and current hashes recorded accurately?
3. Does the draft distinguish the published `main` base from uncommitted Login/Profile follow-up edits tested in the public checkout?
4. Are prior findings answered with evidence, without claiming an unperformed remote check, a pushed remediation, or fresh EGM approval?
5. Does the README give safe local setup and realistic service expectations without secrets, private contact details, or misleading publication claims?
6. Does the five-slide presentation explain the system/DBMS design while keeping personal assignments out of visible slide content, notes, image alt descriptions, and properties?
7. Do the scripts match the agreed speaking scope without asserting historical authorship or exposing private/synthetic demo data?
8. Are alternatives, risks, privacy boundaries, and pass/fail acceptance checks adequate for a public release?

## Reading boundary
Read only paths in `source-allowlist.md`. The allowlist is the complete project context for this review. If a required read fails, report an incomplete review with the missing project-relative path; do not widen access.
