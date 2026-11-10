# Task 2: Offline brand assets

## Outputs

- Added `scripts/render-brand-assets.py`, an explicit offline renderer. It is not imported by application, build, or server startup code.
- Added the 640×420, 48-frame career orbit GIF and its first-frame PNG poster.
- Added the 480×260, 48-frame branching pathways GIF and its first-frame PNG poster.
- Exported the supplied campus and opportunity sketches to WebP at their original dimensions, quality 86.
- Added `client/public/brand/amrita-logo-trimmed.png` by cropping only the alpha bounds of the supplied PNG. Its crop is `(10, 183, 1128, 407)` and pixel comparison against the corresponding source crop is exact.
- Added `design/asset-manifest.json` with authoring versions, command, seed, frame settings, source and output hashes, sizes, dimensions, and measured render timings.

## Render and verification evidence

Ran the explicit utility under the requested 256 MiB memory scope:

```sh
systemd-run --user --scope -p MemoryMax=256M -p MemorySwapMax=64M python scripts/render-brand-assets.py
```

The final measured full script time was 3.049 seconds. Measured GIF render times were 1.061 seconds for `career-orbit` and 0.575 seconds for `pathways`.

Pillow inspection confirmed both GIFs have the requested dimensions, 48 frames, 80 ms per frame (3,840 ms total), and infinite looping (`loop=0`). Their final sizes are 653,615 bytes and 396,511 bytes, below the 2 MB limit. Both first frames are complete illustrations.

The pathway bead now follows `t = 0.41 * (1 - cos(2π * frame_index / 48))` along its Bézier route. This returns the bead to the same endpoint each loop with zero endpoint velocity. A numerical position check measured 0.96445 px for frame 0→1 and 0.96445 px for frame 47→0 (ratio 1.0); the largest neighboring-frame step was 12.27786 px. This verifies the seam step matches the first ordinary step.

The WebP dimensions match their PNG sources: campus 2172×724 at 470,944 bytes; opportunity 1448×1086 at 123,154 bytes. Source SHA-256 checks match the manifest, confirming all three source PNGs were left unchanged. All seven generated output hashes match the manifest.

## Files owned by this task

- `scripts/render-brand-assets.py`
- `design/asset-manifest.json`
- `client/public/media/career-orbit.gif`
- `client/public/media/career-orbit-poster.png`
- `client/public/media/pathways.gif`
- `client/public/media/pathways-poster.png`
- `client/public/media/campus-sketch.webp`
- `client/public/media/opportunity-sketch.webp`
- `client/public/brand/amrita-logo-trimmed.png`
- `.superpowers/sdd/amrita-visual-refresh/task-2-report.md`
