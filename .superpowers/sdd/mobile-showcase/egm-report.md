# EGM review report

**Date:** 2026-11-09
**Result:** EGM is a development-time AI assistant plugin, not a portal runtime placement model. The project executed a local adaptation of its author/reviewer workflow through two fresh Luna Goldfish rounds: Round 1 reported two Major document gaps; the v3 response addressed them; Round 2 completed with no actionable findings. The upstream plugin itself was not installed or invoked.

## Scope recommendation

Use EGM only for bounded, sanitized software-design or documentation reviews if the team wants to trial it in a Codex host that supports its plugin and fresh subagents. Do not add an EGM control to the placement portal or add API, database, Cloudflare, model-serving, or checkpoint dependencies. The upstream README describes the design/review workflow, says other documents require an explicitly configured review loop, and says reviews do not replace tests or human judgment. [Upstream README](https://github.com/google/elephant-goldfish-model/blob/main/README.md)

Project review evidence: [versioned round record](../../../tools/egm/review-record.md), [Round 1 findings](../../../tools/egm/reviews/round-1-goldfish.md), and [Round 2 result](../../../tools/egm/reviews/round-2-goldfish.md). The local review used fresh Luna agents; this does not mean the upstream EGM plugin was invoked or that a learned model ran.

For this portal, a safe first target could be one non-sensitive document such as `docs/API-CONTRACT.md`, the DBMS walkthrough, or the showcase storyboard. The operator supplies explicit review criteria and sanitized source paths; a maintainer verifies each finding. Never include real student/recruiter data, OTPs, resume/Aadhaar material, SMTP credentials, tunnel secrets, or live account-bearing logs. A fresh agent context is not a filesystem, instruction-file, or privacy boundary, and upstream documents Codex isolation caveats. [Upstream Codex limits](https://github.com/google/elephant-goldfish-model/blob/main/docs/codex.md)

## Ownership

- **Documentation owner:** select a target document, standards, and source paths; retain the review record beside the target or in a named report path.
- **Reviewer operator:** verify the plugin is installed and its review skill and fresh subagent capability are available in the actual host; redact inputs and capture available source-read evidence.
- **Maintainer:** accept/reject/defer findings, confirm them against the portal source, and own any follow-up code changes and normal verification.
- **Runtime/product owners:** none for the trial. Keep client, server, Oracle, deployment configuration, and dependencies unchanged.

## Acceptance checks for a future trial

1. Record host and plugin versions, the exact target, criteria, and supplied source paths.
2. Confirm no real personal or secret data appears in the review inputs.
3. Confirm the review ran with the active host's supported fresh-context mechanism; inspect available native tool/read evidence instead of relying on a parent summary.
4. Disposition every finding with a source-backed reason. Review suggestions do not count as correctness evidence.
5. If a disposition leads to a code change, run the portal's existing relevant checks and report their actual output separately.

No trial outcome, correctness rate, model quality, latency, or cost is claimed here. Full repository/source review and citations: [Elephant-Goldfish analysis](../../../docs/research/elephant-goldfish-analysis.md).
