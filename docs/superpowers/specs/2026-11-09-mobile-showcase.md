# Mobile Showcase — Design

## Goal
Rewrite the Amrita Bengaluru Campus placements portal as a premium mobile-first product, validate mobile journeys across all three roles, produce a short professional brag video, and explain its actual Oracle/DBMS implementation and corrected team responsibilities through source documentation and a concise five-slide editable presentation.

## Success criteria
- The premium client rewrite supports phone-sized use across all three roles and retains the supplied Amrita identity and existing application behavior.
- Fresh mobile E2E evidence covers all three roles and is recorded with screenshots and coverage limits.
- A five-slide editable PowerPoint and matching PDF exist under `deliverables/presentation/`.
- A short 1080p professional brag video is produced with the resolved Hyperframes workflow and source/provenance recorded.
- The slides accurately describe the React → Express → bound Oracle SQL path, Cloudflare Worker/tunnel, Gmail SMTP branch, and APEX SQL Workshop inspection.
- Schema claims match the current source and Oracle QA evidence; claims are tagged and traced to retrieved artifacts, with unmeasured behavior identified.
- Team/viva documents and README contribution/deliverables sections use the user's corrected responsibility split without authorship percentages or commit-forensics claims.
- The deck uses the supplied campus wordmark faithfully and has coherent wine, ivory, and gold styling with native editable architecture shapes.

## Non-goals
- Modify client, tests, backend, environment, package, services, or credentials.
- Claim unverified delivery, performance, broad coverage, or nonexistent PL/SQL routines.

## Constraints
Work is split into disjoint lanes: UI owns `client/**`; QA owns mobile tests, browser/functional tests, fresh captures and QA reports; this lane owns docs, README and presentation assets; video owns `brag-output/**`, `deliverables/video/**`, `.agents/skills/brag/**`, and isolated local skill setup. Do not run builds, browsers, LibreOffice, video rendering, or other heavy jobs until the parent assigns a slot. Preserve existing Amrita logo/sketch assets. Do not change Oracle/backend/services or access SMTP credentials.

## Design
The full work combines a premium mobile UI rewrite, all-role mobile E2E validation, a short Hyperframes brag video, corrected team responsibilities and a five-slide product story: (1) product/problem and verified product view; (2) editable architecture; (3) actual relational model, keys, constraints, normalization, SQL and transaction example; (4) mobile workflows and the QA evidence available for them; (5) corrected team roles and demo/results. Use measured evidence only from current-session retrieved logs/artifacts, label all quantitative claims, and state limits. Keep a JS generator and content data editable; defer final render and PDF conversion to the coordinated slot.

## Assumptions
- Existing screenshots under the QA-owned test-results path may be historical; they are reference-only unless QA supplies a fresh capture after UI freeze.
- Actual schema/constraint details can be extracted from source and existing evidence without querying services or credentials.
- PDF export is possible if the existing toolchain is present and the parent approves its resource slot.

## Risks
- Stale screenshots could misrepresent the new UI; mitigate by waiting for QA's fresh capture freeze.
- README or team docs may contain outdated responsibilities; replace those claims with the supplied role split and describe them as planned responsibility, not verified commit attribution.
- Numeric test claims in existing prose may be stale; retrieve raw artifacts/logs before embedding them, otherwise omit or mark `[NOT MEASURED]`.
