# Public GitHub Release — Design

## Goal
Prepare the Amrita Bengaluru DBMS placement portal for a public source release at `https://github.com/Parswanadh/DBMS-sld`, with accurate project documentation, a presentation that explains the database work without assigning slide ownership, and practical speaking scripts for the four team members.

## Success criteria
- The repo root README presents the public repository and live demo clearly, links to the actual showcase video through a compatible poster/direct download, explains local setup, Oracle-only runtime storage, private tunnel/Gmail roles, actual SQL Workshop access, evidence and limitations, and contains no secret values or misleading CI badge.
- The showcase source and exported five-slide deck retain a DBMS-centered story; ownership/contribution assignments are absent from visible slide text, speaker notes, alt text, and document properties.
- Four individual scripts and a master handoff script assign speaking topics from the team-agreed viva allocation and current source, without implying verified historical authorship or adding unsupported performance/result claims.
- The overall release work includes the landing animation overlap fix, two fresh independent EGM rounds, multi-device and multi-user QA, and a public-source review for secret/private-data leakage before the public push.
- Release evidence records commands, outcomes, source scope, and coverage limits; the public push remains a parent-controlled final action.

## Non-goals
- Changing Oracle schema/data, application behavior beyond the separately owned UI animation correction, runtime services, or SMTP configuration.
- Claiming exhaustive security review, physical-device certification, placement outcomes, or historical individual authorship.
- Publishing private course materials, environment files, secrets, raw screenshots containing personal fields, or unreviewed local state.

## Constraints
- Oracle is the portal's only application database; APEX PARSHU has read-only access to the 14 business tables. Gmail is OTP transport. Cloudflare Worker/private VPC binding/tunnel forwards requests to the laptop-hosted API.
- Keep the deck to five slides and remove ownership claims from all slide-associated metadata, not just visible text. Team responsibility assignments may be used in separate script documents.
- Use fresh current-session QA evidence when stating release status. Preserve measured-vs-not-measured boundaries and coverage limits.
- The deliverable must be source-safe for a public GitHub repository; no secrets, unnecessary personal emails, private home paths, or private course materials.

## Design
Keep the existing five-slide deck's core flow (what was built, user workflows, Oracle/DBMS design, architecture/data path, validation/demo guidance). Replace its team/contributions slide with DBMS validation/demo/learning takeaways. Update the generator/content source alongside exports. Provide four concise speaking scripts plus a timed master sequence that follows the documented responsibility split. Rewrite the README for an external student/developer audience and link the showcase video via a poster image linked to the actual MP4. The coordinated release report will point to fresh QA, EGM, privacy, and public-source evidence produced by the designated lanes.

## Assumptions
- `Parswanadh/DBMS-sld` is the intended public repository URL and remains absent until the parent completes review and push.
- The current team identifiers and roles in `docs/team-viva/TEAM-CONTRIBUTIONS.md` are the agreed presentation allocation.
- The existing five-slide deck and showcase video are the current source assets; the parent may request a video refresh if the UI lane changes captured visuals.

## Risks
- Existing documentation may contain stale or excess personal details; perform a public-source inventory and redact unnecessary details before pushing.
- README verification claims can become stale after UI or deployment changes; cite dated current reports and keep limitations explicit.
- Speaker scripts may overstate database behavior if they drift from actual DDL/API paths; source claims against the schema, walkthrough, and current code.
- PowerPoint notes or package metadata may retain removed content; validate all slide and package text, then render and inspect the final five pages.
