# Independent public source readiness findings

Review baseline: `f2a24a7` and all reachable local Git history. This is a read-only source and package review; later release edits require a fresh gate. No GitHub repository was created or pushed during this review.

## Publication gate

**Blocked for a full-history public push.** Published history would retain unnecessary personal email addresses and private workstation paths. A safe public snapshot with a new root commit can preserve the application source, slides, and video while omitting or sanitizing internal artifacts. If preserving original history is required, rewrite it in a separate reviewed copy and rescan the rewritten result before publishing. Editing only the latest commit is insufficient.

### PR-01 — Real email addresses in committed verification prose (High, publication blocker)

- **Location:** `PROGRESS.md:28` and `docs/verification-ledger.md:32`, reachable at `f2a24a7` and earlier revisions.
- **Evidence:** These lines name the real SMTP sender and test recipient. Redacted SHA-256 prefixes: sender `d3c58a6cad`, recipient `99f0428c45`. No address or credential value is reproduced here.
- **Impact:** A public GitHub clone exposes contact identities unnecessary to understand or run the project.
- **Expected fix:** Replace addresses with role descriptions in the release copy. Verify the values are absent from every object in the Git history selected for publication. Do not treat a tip-only edit as a full-history fix.
- **Uncertainty:** This is a privacy exposure, not evidence that the SMTP password is committed.

### PR-02 — Private absolute workstation paths in committed artifacts (Medium, publication blocker under release spec)

- **Location examples:** `.superpowers/sdd/mobile-showcase/plan-deck-report.md:22-23`, `.superpowers/sdd/nov9-e2e/final-verification.md:15`, `tools/egm/reviews/round-1-goldfish.md:4-22`, and `brag-output/composition-brief.md:16`.
- **Evidence:** These contain absolute paths rooted in a private user home directory. The release spec explicitly excludes private home paths (`docs/superpowers/specs/2026-11-10-public-release.md:22`).
- **Impact:** Public history exposes local account/layout details, even if HEAD is redacted.
- **Expected fix:** Omit internal review artifacts from the public snapshot or rewrite their paths and the affected history. Preserve project source and required deliverables.

### PR-03 — Current exported PowerPoint retains ownership allocations (High, artifact gate pending refresh)

- **Location:** `deliverables/presentation/amrita-placement-portal-showcase.pptx`, `ppt/slides/slide5.xml` and `ppt/notesSlides/notesSlide5.xml` inside the package.
- **Evidence:** Package-wide XML text inspection found member identifiers and ownership wording on slide 5, plus member names in slide 5 notes. The separate speaking scripts are intentionally role-specific; the deck must be neutral per the release spec (`docs/superpowers/specs/2026-11-10-public-release.md:8,20`).
- **Expected fix:** Regenerate PPTX and PDF from sanitized source. Inspect every slide, notes slide, alt text, document property, and presentation package XML for ownership assignments. Recheck the final artifacts after export.
- **Status:** The presentation worker is editing source; this finding describes the current exported baseline only.

### PR-04 — University affiliation is not established by student signup (Medium, live-service integrity and copy accuracy)

- **Location:** `server/src/auth-routes.ts:39-45`, `server/src/auth-routes.ts:23`, `client/src/pages/Landing.tsx:23`.
- **Evidence:** Registration accepts any valid mailbox and student roll string; after OTP, student accounts are created active. The landing copy says “University access with secure email verification.”
- **Impact:** A person who controls an arbitrary mailbox can create a student account and enter a claimed roll number. OTP establishes mailbox control, not enrollment or roll ownership. This can contaminate live student records and permits access to student-role features.
- **Expected fix:** If the service promises university-only access, enforce an approved email or enrollment source at the server before activation. If open demo registration is intended, state that plainly and avoid the university-access implication. Review demo data retention and admin monitoring.
- **Boundary:** This review did not demonstrate cross-role authorization bypass or run a registration request.

### PR-05 — Bundled third-party media needs a redistribution decision (Low, nonblocking if rights established)

- **Location:** tracked `.agents/skills/brag/assets/music/*.mp3`, `.agents/skills/brag/assets/sfx/*`, and duplicate `brag-output/composition/assets/music/*`.
- **Evidence:** These are large tool/production assets distinct from the requested final MP4 and portal source. Ownership or redistribution rights were not established in this review.
- **Expected fix:** Publish only source and media needed for the project plus materials with confirmed redistribution rights. If bundled third-party assets are required, include their licensing/attribution evidence. This is a scope/rights review item, not a claim of infringement.

## Controls observed in source

- `.env`, `storage/`, `logs/*`, `node_modules/`, build output, and browser test output are ignored by `.gitignore`; historical path inventory found no tracked runtime file in these categories beyond `.env.example` and `logs/.gitkeep`.
- `server/src/mail.ts:16-18` only captures OTP codes in memory when **both** `MAIL_TRANSPORT=json` and `NODE_ENV=test`. `server/src/auth.ts:34` rejects a missing or short session secret.
- `server/src/app.ts:18-33` uses Helmet, limited JSON parsing, API auth middleware, an origin check on writes, and an edge origin header check for requests identified as edge traffic. `cloudflare/worker.ts:12-25` overwrites the origin header and forwarding headers. The API listener is loopback-only in `server/src/index.ts:7`. These are source observations, not a live deployment attestation.
- `server/src/upload-routes.ts:11-23` authenticates upload routes, limits size and MIME, checks file magic, stores randomized names, and checks owner/role/linkage before download. `server/src/routes.ts:48-53,72-74` validates ownership before linking portal uploads. No unauthenticated protected-file route was found in the reviewed paths.
- Client static assets tracked under `client/public/` are brand/illustration media; no tracked auth code, raw cookie, browser storage, or protected upload file was found by filename/content pattern screening.

## Secret and history scan scope

What ran: `git rev-list --objects --all`, `git cat-file` over reachable blobs, a bounded byte-pattern scan, and byte-for-byte comparison against configured sensitive `.env` values held only in process memory. Raw evidence: terminal output from this review session; no secret values were emitted. Result: no high-confidence credential-value match in reachable objects **[MEASURED]**. False-positive exact matches for public configuration strings were excluded. Gitleaks was not installed; no third-party scanner or network installer was run. No downloads, service-account key, app-password file, remote refs, unreachable Git objects, or new untracked binary exports were scanned. **Not measured:** whether any secret exists outside these patterns, whether public demo media contains recognizable real people/records, or whether live Cloudflare/Oracle/SMTP configuration matches source.

## Approval criteria before public push

1. Select a publish history/snapshot and verify PR-01 and PR-02 are absent from **every object to be published**. Keep `.env`, storage, logs, raw QA screenshots/frames, caches, and local runtime files out of the release; inspect the staged manifest.
2. Confirm the final exported deck/PDF is ownership-neutral, including package notes and properties, and that the README links the actual video/poster.
3. Re-run the bounded secret scan against the selected publication ref and inspect static/video/screenshots for unintended personal or secret content. Review third-party asset rights or omit unnecessary bundled assets.
4. Review the latest fresh multi-device, three-role QA and independent EGM findings. Do not infer QA status from the prior release's screenshots.
5. Only then create/push the public repository. This review does not grant a blanket security guarantee.
