# Amrita Placement Portal showcase video

## Deliverables

- Video: `amrita-placement-portal-showcase.mp4` — 1920×1080, 30 fps, 22.000 s, H.264 High / yuv420p, AAC LC 48 kHz stereo; 2,434,180 bytes.
- Poster: `amrita-placement-portal-showcase-poster.jpg` — 1920×1080; selected from the settled intro at 2.0 s, then baked into video frame 0.
- Share text: `share-copy.txt`.
- Rendered-frame review: `render-contact-sheet.jpg`.

The canonical BRAG workflow outputs also remain at `../../brag-output/brag.mp4` and `../../brag-output/brag.jpg`. The editable HyperFrames source, storyboard, and composition brief are in `../../brag-output/composition/`, `../../brag-output/brag-plan.md`, and `../../brag-output/composition-brief.md`.

## Product material

The video uses frozen, privacy-reviewed captures from `../../test-results/showcase/`: `dashboard-mobile.png` and `apply-mobile.png`. The dashboard is framed to show the actual greeting and “Browse opportunities” entry point while excluding summary counts. The application screenshot uses synthetic demo opportunity data; a camera pan follows the unchanged capture to its actual submitted confirmation. The report screenshot and campus outcome metrics are not used. The supplied Amrita wordmark and campus sketch are used for the branded opening and close.

## Audio and media provenance

The music is “Happy Beats / Business Moves, Vol. 10” by Sascha Ende ([source](https://ende.app/en)), licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Required attribution: “Music: Sascha Ende — Happy Beats / Business Moves, Vol. 10 (https://ende.app/en), CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/).”

Two quiet reveal accents use `impactSoft_medium_001.ogg` from Kenney's [Impact Sounds](https://kenney.nl/assets/impact-sounds) pack, identified as CC0. Courtesy credit: “SFX: Kenney (CC0).” There is no narration.

HyperFrames loaded EB Garamond and Inter from Google Fonts for the overlay text. Both are under SIL Open Font License 1.1: [EB Garamond OFL](https://github.com/google/fonts/blob/main/ofl/ebgaramond/OFL.txt), [Inter OFL](https://github.com/google/fonts/blob/main/ofl/inter/OFL.txt). Captured product UI retains its rendered interface fonts.

## Workflow and verification

- BRAG skill: `latent-spaces/brag` commit `669ab9286aa28b6c3ee30e75f181ee74319d012a`, local copy in `../../.agents/skills/brag/` with MIT license and upstream provenance.
- HyperFrames: `0.9.26`, project-local runtime under `../../brag-output/.runtime/`, based on `heygen-com/hyperframes` tag `v0.9.26`, commit `0c6c7fca45bddc9838ebc6c0f0280e9efea1f18a`.
- HyperFrames `check`: report `../../brag-output/composition/.hyperframes/artifacts/checks/77fb0e38-1bc3-4b98-a376-977e4ccc5f6b.json`; 0 errors, 0 warnings, 0 info findings; contrast passed 14/14 checks.
- Delivery render: 1 worker, 30 fps, delivery quality, low-memory streaming capture. The render ran under 2 GiB RAM / 128 MiB swap / 2 CPU affinity; `ffmpeg` poster bake used 2 threads. The poster is the chosen settled intro frame, not an arbitrary frame.
- Final `ffprobe` confirmed 1920×1080, 30/1 fps, 22.000 s, H.264 High video, AAC LC stereo audio at 48 kHz, and nonzero audio bitrate. The audio analysis found a 22 s music bed with no warnings.

No SMTP credentials, Oracle credentials, paid media providers, or external messaging were used.
