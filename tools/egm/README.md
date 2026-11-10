# Local EGM review bundle

This folder adapts the Elephant-Goldfish Model (EGM) document-review workflow for a bounded mobile-showcase design review. It is a **local prompt/reference bundle**, not an installed EGM plugin, not a trained model, and not application runtime code. No EGM plugin command was run.

## Upstream source and license

- Upstream: [`google/elephant-goldfish-model`](https://github.com/google/elephant-goldfish-model)
- Pinned source commit: `5382b17619be07811a14b2146c7672620b34a791` (the `main` head retrieved with read-only `git ls-remote` on 2026-11-09).
- License: Apache-2.0; full upstream text is in [`upstream/LICENSE`](upstream/LICENSE).
- The upstream tree at that commit has no `NOTICE` file. The Apache-2.0 license text and source attribution are retained here.
- No code or prompt text is copied into portal application paths. Upstream material is kept under `upstream/`; changes to those files require re-review of license and provenance.

## Contents

The following upstream files are copied verbatim from the pinned commit (the
full upstream tree remains available at the pinned commit URL; not every
cross-linked upstream guide is vendored here):

- `upstream/docs/codex.md` — Codex paths, fresh-context procedure, isolation limitations, and supported verification notes.
- `upstream/docs/getting_started.md` — EGM core workflow and artifact intent.
- `upstream/skills/egm-review-loop/SKILL.md` — upstream review-loop inputs, findings handling, and round rules.
- `upstream/agents/design_critic.md` — read-only Goldfish design-critic persona.
- `upstream/resources/document_standards/feature-spec-standard.md` — upstream feature specification standard.
- `upstream/LICENSE` — upstream Apache-2.0 license.

Project-specific artifacts in this folder:

- `elephant-author-brief.md` — context-rich drafting brief for the authoring pass.
- `mobile-review-draft.md` — the design target for fresh-context review.
- `mobile-qa-summary.md` — sanitized QA-reported gates and frozen client identity; raw evidence is excluded.
- `mobile-review-inputs.md` — curated, explicit allowlist of source paths and exclusions.
- `goldfish-review-prompt.md` — local dispatch prompt and finding schema aligned with the review coordinator.
- `review-record.md` — versioned round log updated from actual Goldfish reports and verified inputs.

## What was executed

The local Elephant authoring pass produced the mobile-showcase draft from the approved project context. Root then launched two fresh Luna Goldfish reviewers. Round 1 reported two Major document gaps; the author refined the acceptance matrix and static API-boundary evidence; Round 2 completed with no actionable findings. See the versioned [review record](review-record.md), [Round 1 report](reviews/round-1-goldfish.md), and [Round 2 report](reviews/round-2-goldfish.md).

This means the **adapted prompt workflow** was executed through fresh Luna agents. The upstream EGM plugin was not installed or invoked. No learned model, checkpoint, model API, or placement-portal runtime component was used or added. QA/browser figures in the review remain QA-reported; this author did not run those gates.

Research and adaptation context: [upstream source analysis](../../docs/research/elephant-goldfish-analysis.md) and [mobile showcase EGM report](../../.superpowers/sdd/mobile-showcase/egm-report.md).

## What is adapted

EGM's documented loop separates a context-rich Elephant author/resolver from fresh-context Goldfish reviewers. This task used that split for the mobile showcase draft: the authoring pass used the approved project documents and code paths, and root launched the fresh Goldfish reviewers. EGM's Codex guide says the reviewer must receive absolute paths to its persona, standard, target, and selected context, and that a reviewer that did not complete is “not run,” not a clean review.

This bounded run narrows upstream automation: root launches one read-only design-critic reviewer per round; findings use the coordinator's source-backed object schema; the author/maintainer decides whether to revise. No automatic remediation, synthesizer, code edits by reviewers, or full upstream five-stage `/egm-review` run is claimed. The requested ceiling is three rounds, focused on unresolved Blocker/Major issues; this differs from upstream's five-round cap/two-clean-round convergence rule and must be recorded as a local adaptation.

## Context and privacy boundaries

`fork_turns: "none"` (or the equivalent fresh-context option) limits parent conversation turns only. Upstream explicitly warns that it does **not** prove isolation from project/user instruction files and does not isolate the filesystem or configured memory services. The root operator must inspect actual host capabilities and avoid passing private parent reasoning or history. A fresh subagent is not a privacy boundary.

For this review, only the files in `mobile-review-inputs.md` are approved. Do not read or provide `.env`, credentials, OTPs, student/recruiter records, uploads, screenshots containing real data, application logs, test-result logs, account-bearing traces, or unrelated files. Use synthetic examples only. Do not send private data to any model/API. The reviewer may report missing capabilities or evidence; it must not fetch external URLs or expand the source list.

This review provides design feedback only. It does not establish application correctness, test coverage, accessibility conformance, security, performance, model quality, or product readiness. Portal tests and human approval remain separate.

## Review procedure

1. Root reads this README, `upstream/docs/codex.md`, `upstream/docs/getting_started.md`, the draft, input allowlist, persona, standard, and local prompt.
2. Root confirms the mobile source is ready for review and passes absolute paths to only the listed files.
3. Root launches a fresh read-only Goldfish with `fork_turns: "none"` (or an available equivalent), and explicitly asks it to read every supplied file. No parent transcript is passed.
4. Record actual completion and evidence in `review-record.md`. Missing reads, unavailable isolation, timeout, or absent report is `not run`, never zero findings.
5. Root resolves each finding, records its disposition, and revises the draft only for accepted findings. Root repeats up to the stated cap and preserves versioned review records.

The host must not be described as running the EGM plugin unless the plugin is separately installed and invoked through its supported host. This local use is an adapted EGM workflow, not plugin execution.
