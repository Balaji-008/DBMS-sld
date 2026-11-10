# HyperFrames Composition Brief: Amrita Placement Portal — Bengaluru

## Objective
Create a premium short product film for the Amrita Bengaluru campus placement portal. Ground every product shot in the frozen QA captures; use the supplied wordmark and campus sketch for the brand bookends.

## Output
- Composition directory: `brag-output/composition/`
- BRAG workflow render: `brag-output/brag.mp4`
- Final deliverable: `deliverables/video/amrita-placement-portal-showcase.mp4`
- Format: landscape — 1920×1080
- Duration: 22 seconds
- Frame rate: 30 fps target; verify with ffprobe
- Narration: off

## Source Material
- Project root: `$PROJECT_ROOT`
- Project source read: `client/index.html`, the product pages/components/styles, `README.md`, and the mobile showcase spec/storyboard
- Product name: Amrita Placement Portal — Bengaluru
- Landing headline, verbatim: “From campus learning to a career in motion.”
- Landing supporting copy, verbatim: “A shared place for students, recruiters, and the placement team to find the next right opportunity.”
- Supplied assets: `client/public/brand/amrita-logo-trimmed.png`, `client/public/media/campus-sketch.webp`
- Frozen product captures: `test-results/showcase/dashboard-mobile.png` and `test-results/showcase/apply-mobile.png`; copied unchanged to `composition/assets/captures/`
- The dashboard capture is framed as a top-of-screen macro crop that ends before its personal summary cards. The apply capture shows a QA-reviewed synthetic demo opportunity. The final composition pans through this one unchanged screenshot from opportunity details to its actual submitted confirmation, without a simulated interaction; it contains no person's name/email/OTP.
- No reports screenshot, outcome metrics, external URL or campus result claim is used.

## Creative Direction
- Tone: polished; quiet, premium campus-to-career product film
- Storyboard: `brag-output/brag-plan.md`
- Scenes: campus sketch + actual landing headline; dashboard crop focused on Browse opportunities; opportunity capture panned from role details to its existing submitted message; campus sketch + wordmark + exact copy excerpt “The next right opportunity.”
- No simulated button press, success state, human history, performance claim or metric. The application state is shown only because it appears in the frozen QA capture.

## Visual Look
- Palette: wine `#431626`, burgundy `#761731`, ivory `#f8f6f2`, gold `#c79a63`, ink `#30272b`
- Video overlay faces: EB Garamond display and Inter body, both bundled with HyperFrames. Captured UI keeps its product typography.
- The official wordmark uses the supplied image directly; the campus sketch is the supplied architectural artwork, not documentary photography.
- Screens are the actual approved PNG captures, not recreated UI.

## Audio
- Narration: none
- Track: “Happy Beats / Business Moves, Vol. 10” by Sascha Ende ([source](https://ende.app/en)), licensed [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/); local file `assets/music/happy-beats-business-moves-vol-10-by-ende-dot-app.mp3`
- Cue preset: `.agents/skills/brag/assets/music/cues/happy-beats-business-moves-vol-10-by-ende-dot-app.music-cues.json`; 109.96 BPM. The 20.19s cue is an optional landing point for the final brand card; only use if it preserves the hold.
- SFX: `impactSoft_medium_001.ogg`, Kenney Impact Sounds, CC0; two soft brand-reveal accents, never used as a simulated UI click or notification
- No audio-reactive effect. Keep both sounds sparse under a warm low-level music bed.

## Scene Timing
- 0–4s: campus artwork + Amrita wordmark + landing headline
- 4–10s: QA dashboard capture zoom crop on greeting and Browse opportunities; summary cards/counters remain outside frame
- 10–17s: actual QA mobile opportunity capture, panned to the existing submitted confirmation
- 17–22s: campus artwork + wordmark + “The next right opportunity.”

## Delivery
- `brag-output/brag.mp4` and `brag-output/brag.jpg` — canonical BRAG workflow video and poster
- `deliverables/video/amrita-placement-portal-showcase.mp4` and `amrita-placement-portal-showcase-poster.jpg` — named shareable deliverables
- `brag-output/brag-plan.md`, this brief, and `brag-output/share-copy.txt`
- `brag-output/composition/` — editable HyperFrames source and captured source assets
- `deliverables/video/README.md` — capture provenance, source/license credits, check/render evidence and measured output properties
- Validate final duration, frame dimensions, FPS, codecs, nonzero audio stream, and actual file size using ffprobe/ls. Select a settled poster frame, then bake that poster into frame 0.
