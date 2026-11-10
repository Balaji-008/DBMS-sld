# Elephant-Goldfish Model: source analysis and portal fit

**Reviewed:** 2026-11-09
**Scope:** Read-only review of the exact repository supplied by the user and the portal's existing documentation. No application code, dependencies, credentials, student records, or external services were changed.

## Finding

`google/elephant-goldfish-model` is a public open-source plugin/workflow for AI coding assistants. The repository describes an “Elephant” that carries project context and drafts specifications, and “Goldfish” reviewers that assess a document and its referenced sources without the earlier conversation. Its stated domain is software design and document review. It is **not presented in the inspected primary sources as a downloadable trained predictive model for placement matching, candidate ranking, or other portal runtime decisions**. The README's review-loop option supports other document types when the reviewer roles and standards are configured explicitly. [README](https://github.com/google/elephant-goldfish-model/blob/main/README.md) [plugin manifest](https://github.com/google/elephant-goldfish-model/blob/main/plugin.json)

The fit is therefore the team's development/documentation workflow: challenge a proposed change or review design and operational documents with fresh agent contexts. EGM should not be wired into student or recruiter screens, the Express API, Oracle queries, or Cloudflare. No new endpoint, database object, inference service, checkpoint, or model API key is justified by this repository analysis.

## Project execution

The project used a local adaptation of the documented author/reviewer split for the mobile-showcase design: the Elephant context authored a sanitized draft, then root launched two fresh Luna Goldfish reviews. Round 1 returned two Major document-acceptance findings; the author added role-specific workflow outcomes and static API-boundary evidence; Round 2 completed with no actionable findings. The versioned record and reports are in [`tools/egm/review-record.md`](../../tools/egm/review-record.md), [`round-1-goldfish.md`](../../tools/egm/reviews/round-1-goldfish.md), and [`round-2-goldfish.md`](../../tools/egm/reviews/round-2-goldfish.md).

This was execution of the **local adapted workflow through fresh Luna agents**, not installation or invocation of the upstream EGM plugin. No learned placement model, checkpoint, model API, or portal runtime inference path was introduced. Mobile browser results remain QA-reported in the sanitized summary; this author did not run those gates.

## Primary-source verification

- The exact requested GitHub URL opened as a public repository titled **Elephant-Goldfish Model**, with the description “Open-source plugin for designing and reviewing software with agents.” Its README says it is a plugin for AI assistants, and explicitly says it is not an officially supported Google product. [Repository](https://github.com/google/elephant-goldfish-model) [README](https://github.com/google/elephant-goldfish-model/blob/main/README.md)
- The README identifies the distinct context roles: Elephant has project context, requirements, and earlier decisions; Goldfish sees the review document and referenced source material without the earlier conversation; the human decides trade-offs and what to build. [README](https://github.com/google/elephant-goldfish-model/blob/main/README.md)
- The documented core activities are brainstorm, draft, review, human review, implementation, optional codebase bootstrap, and design/code drift reporting. The repo recommends human review and says EGM does not replace tests or human judgment. [Workflow guide](https://github.com/google/elephant-goldfish-model/blob/main/docs/getting_started.md) [README](https://github.com/google/elephant-goldfish-model/blob/main/README.md)
- It requires an agent harness/plugin runtime. The Codex CLI instructions install the plugin from its marketplace, start a fresh session, and select an EGM skill. The README states that brainstorming and review need fresh subagents. The `plugin.json` declares `requires_local_executor: true`; its text describes isolated AI reviewers, not a standalone inference server. [Codex integration](https://github.com/google/elephant-goldfish-model/blob/main/docs/codex.md) [README](https://github.com/google/elephant-goldfish-model/blob/main/README.md) [plugin manifest](https://github.com/google/elephant-goldfish-model/blob/main/plugin.json)
- The repository's `pyproject.toml` lists only a test dependency group, and its testing guide says the offline unit suite needs no API keys or model dependencies. The reviewed install/workflow documentation does not specify checkpoint downloads, model-serving infrastructure, or hardware requirements. EGM's reviews run through the configured host agent; host model usage, privacy, cost, and runtime constraints remain properties of that host. **I did not audit every repository blob or infer the host's data-handling policy.** [pyproject.toml](https://github.com/google/elephant-goldfish-model/blob/main/pyproject.toml) [testing guide](https://github.com/google/elephant-goldfish-model/blob/main/TESTING.md)
- The repository publishes an Apache-2.0 license. No EGM code is copied into this project by this report. If code or prompt content is later copied, retain the applicable license notice and review the specific file's headers and license terms. [LICENSE](https://github.com/google/elephant-goldfish-model/blob/main/LICENSE)
- The project's own Codex guide warns that a fresh conversation does not necessarily isolate filesystem contents, configured memory, or project instruction files. It also records an open/unverified instruction-file isolation limitation for some Codex CLI versions. Treat “fresh-context review” as a review technique, not a privacy boundary. [Codex integration and limits](https://github.com/google/elephant-goldfish-model/blob/main/docs/codex.md)

## Portal fit and safe use

The portal README describes a React/TypeScript client, Express API, Oracle-only database, Gmail OTP, and a Cloudflare Worker/private tunnel path. It also documents personally identifying and protected student data (including Aadhaar-related fields/documents). These are reasons to keep EGM strictly in the team's sanitized design/documentation workflow: do not send real student, recruiter, OTP, Aadhaar, resume, SMTP, tunnel, or other credential data to reviewer contexts. Limit review inputs to code/design facts and synthetic examples. The repo's clean-context feature alone is not a data-isolation control. [Portal README](../README.md) [EGM Codex privacy/isolation limits](https://github.com/google/elephant-goldfish-model/blob/main/docs/codex.md)

The local workflow used for this review followed the same basic author/reviewer separation. If the team later installs the upstream plugin in a supported Codex environment, potential uses include:

1. Use an EGM brainstorm/draft/review loop for a non-trivial software change before implementation.
2. For project documents such as the DBMS walkthrough, demo checklist, API contract, or showcase storyboard, use the configurable review-loop skill with explicit standards; EGM says its built-in draft/design-review targets software specifications and other documents need selected reviewers and standards.
3. Keep reviewer inputs redacted and narrow. Use referenced source files rather than pasting account-bearing logs or live production data.
4. Treat findings as review suggestions. A maintainer resolves trade-offs; implementation still requires the portal's existing verification steps and human approval.

The local workflow introduced no runtime path, checkpoint, or model API into the portal. Any hosted-model/API cost depends on the agent product/account and was not measured here.

## Ownership and acceptance checks for a future trial

These are proposed checks for a later, explicitly scoped trial; no plugin install or review run was performed for this report.

- **Product/runtime owners:** no changes to `client/`, `server/`, Oracle schema/seeds, Cloudflare configuration, `.env`, or package dependencies for a documentation-review trial.
- **Documentation owner:** choose one non-sensitive design or handbook artifact, state review criteria and source paths, and save the returned findings with the artifact (or in the designated review report path). Avoid making EGM the authority on correctness.
- **Reviewer operator:** confirm the EGM skill is actually installed and selectable in the active Codex host; confirm fresh subagent capability is available; give only sanitized materials; inspect cited paths and requested source reads in the host's available evidence.
- **Maintainer:** classify each finding as accepted, rejected, or deferred with a brief reason; verify factual findings against source; run the portal's relevant tests/checks after any resulting code change.
- **Trial completion:** record host/plugin version, target document, exact review scope, any findings and dispositions, and limitations. A completed launch or a reviewer summary alone is not proof the source was read or that findings are correct; EGM's own test guidance calls for actual tool evidence where available. [Testing guide](https://github.com/google/elephant-goldfish-model/blob/main/TESTING.md) [Codex integration](https://github.com/google/elephant-goldfish-model/blob/main/docs/codex.md)

## Evidence limits

No model-quality benchmark, portal outcome improvement, operational cost, latency, privacy guarantee, or installed-plugin compatibility was measured. The upstream plugin was not installed or invoked; only the adapted prompt workflow ran through fresh Luna agents. Findings above describe retrieved repository documentation, inspected portal documentation, and the two recorded document-review rounds; verify support in the exact active host/version before relying on upstream plugin behavior.
