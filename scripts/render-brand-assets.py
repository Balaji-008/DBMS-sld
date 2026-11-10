#!/usr/bin/env python3
"""Render the Amrita portal's offline brand assets.

This is an explicit utility. It is not imported by the application, build, or
server startup. Each frame is derived from its absolute frame index so a run is
deterministic and the looping motion is periodic.
"""

from __future__ import annotations

import hashlib
import json
import math
import platform
import time
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, __version__ as PILLOW_VERSION

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "client/public"
MEDIA = PUBLIC / "media"
BRAND = PUBLIC / "brand"
MANIFEST = ROOT / "design/asset-manifest.json"

IVORY = (248, 246, 242)
BURGUNDY = (118, 23, 49)
DEEP_WINE = (67, 22, 38)
GOLD = (199, 154, 99)
SCALE = 2
FRAMES = 48
FRAME_MS = 80
SEED = 17


def sha(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def point_on_bezier(p0, p1, p2, p3, t):
    u = 1.0 - t
    return (
        u**3 * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t**3 * p3[0],
        u**3 * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t**3 * p3[1],
    )


def line(draw, points, fill, width):
    draw.line([(round(x * SCALE), round(y * SCALE)) for x, y in points], fill=fill, width=width * SCALE, joint="curve")


def circle(draw, x, y, radius, fill, outline=None, width=1):
    box = ((x - radius) * SCALE, (y - radius) * SCALE, (x + radius) * SCALE, (y + radius) * SCALE)
    draw.ellipse(box, fill=fill, outline=outline, width=width * SCALE)


def smooth_path(p0, p1, p2, p3, steps=96):
    return [point_on_bezier(p0, p1, p2, p3, i / steps) for i in range(steps + 1)]


def career_orbit(index: int) -> Image.Image:
    width, height = 640, 420
    image = Image.new("RGB", (width * SCALE, height * SCALE), IVORY)
    draw = ImageDraw.Draw(image)

    # Fine architectural rules and the quiet central axis keep the illustration
    # grounded in the campus editorial style.
    for y in (78, 342):
        line(draw, [(68, y), (572, y)], (*GOLD, 88), 1)
    line(draw, [(320, 52), (320, 368)], (*BURGUNDY, 30), 1)

    # Sculptural arch and offset orbital ellipse form a stable, complete first frame.
    arch = smooth_path((112, 294), (150, 76), (494, 72), (528, 294), 100)
    line(draw, arch, DEEP_WINE, 2)
    inner = smooth_path((142, 294), (172, 118), (468, 114), (498, 294), 100)
    line(draw, inner, (*GOLD, 225), 1)

    # A tilted elliptical route passes around the arch. The moving point returns
    # to its exact starting phase at frame 48, producing a seamless periodic loop.
    cx, cy, rx, ry = 320.0, 215.0, 218.0, 104.0
    tilt = -0.16
    orbit_points = []
    for step in range(181):
        a = 2 * math.pi * step / 180
        x, y = rx * math.cos(a), ry * math.sin(a)
        orbit_points.append((cx + x * math.cos(tilt) - y * math.sin(tilt), cy + x * math.sin(tilt) + y * math.cos(tilt)))
    line(draw, orbit_points, (*BURGUNDY, 115), 1)

    # Delicate center marker, ring and small gold anchor.
    circle(draw, 320, 215, 44, IVORY, outline=(*BURGUNDY, 150), width=1)
    circle(draw, 320, 215, 34, None, outline=(*GOLD, 240), width=1)
    circle(draw, 320, 215, 5, BURGUNDY)
    circle(draw, 320, 215, 2, GOLD)

    phase = 2 * math.pi * index / FRAMES
    x, y = rx * math.cos(phase), ry * math.sin(phase)
    px = cx + x * math.cos(tilt) - y * math.sin(tilt)
    py = cy + x * math.sin(tilt) + y * math.cos(tilt)
    circle(draw, px, py, 8, IVORY, outline=BURGUNDY, width=2)
    circle(draw, px, py, 3, GOLD)

    # Three fixed waypoints suggest stages without adding text or UI symbols.
    for x, y, r in ((126, 294, 5), (514, 294, 5), (320, 92, 4)):
        circle(draw, x, y, r, IVORY, outline=GOLD, width=2)
    return image.resize((width, height), Image.Resampling.LANCZOS)


def pathways(index: int) -> Image.Image:
    width, height = 480, 260
    image = Image.new("RGB", (width * SCALE, height * SCALE), IVORY)
    draw = ImageDraw.Draw(image)

    # Source ribbon and branch paths have different silhouettes from the orbit
    # scene: a rising route divides into three graceful destinations.
    center = smooth_path((50, 211), (142, 209), (125, 57), (232, 119), 90)
    upper = smooth_path((232, 119), (294, 142), (302, 49), (421, 52), 80)
    middle = smooth_path((232, 119), (296, 134), (315, 130), (429, 130), 80)
    lower = smooth_path((232, 119), (295, 109), (308, 211), (421, 208), 80)
    line(draw, center, DEEP_WINE, 2)
    line(draw, upper, BURGUNDY, 2)
    line(draw, middle, (*GOLD, 240), 2)
    line(draw, lower, DEEP_WINE, 2)

    # Echo ribbons provide quiet depth while leaving generous blank space.
    line(draw, [(x + 5, y + 6) for x, y in center], (*GOLD, 115), 1)
    line(draw, [(x, y + 7) for x, y in upper], (*GOLD, 112), 1)
    line(draw, [(x, y - 7) for x, y in lower], (*BURGUNDY, 72), 1)

    # Stationary end nodes and a moving bead on the central route.
    for x, y, color in ((50, 211, BURGUNDY), (421, 52, GOLD), (429, 130, BURGUNDY), (421, 208, GOLD)):
        circle(draw, x, y, 8, IVORY, outline=color, width=2)
        circle(draw, x, y, 2, color)
    circle(draw, 232, 119, 7, IVORY, outline=BURGUNDY, width=2)

    # Ping-pong along the source ribbon with zero velocity at both endpoints;
    # frame 47 and frame 0 therefore meet with the same small step as any
    # neighboring pair rather than jumping from the end back to the start.
    t = 0.41 * (1.0 - math.cos(2 * math.pi * index / FRAMES))
    px, py = point_on_bezier((50, 211), (142, 209), (125, 57), (232, 119), t)
    circle(draw, px, py, 8, IVORY, outline=GOLD, width=2)
    circle(draw, px, py, 3, BURGUNDY)

    # A restrained top and bottom rule aligns with the landscape crop.
    line(draw, [(35, 24), (445, 24)], (*GOLD, 90), 1)
    line(draw, [(35, 236), (445, 236)], (*GOLD, 90), 1)
    return image.resize((width, height), Image.Resampling.LANCZOS)


def encode_gif(name: str, size: tuple[int, int], renderer):
    started = time.perf_counter()
    rgb_frames = []
    for frame_index in range(FRAMES):
        rgb_frames.append(renderer(frame_index))
    poster_path = MEDIA / f"{name}-poster.png"
    rgb_frames[0].save(poster_path, format="PNG", optimize=True)
    palette_source = rgb_frames[0].quantize(colors=128, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    palette = palette_source.getpalette()
    palette_frames = []
    for frame in rgb_frames:
        pal = frame.quantize(palette=palette_source, dither=Image.Dither.NONE)
        palette_frames.append(pal)
    gif_path = MEDIA / f"{name}.gif"
    palette_frames[0].save(
        gif_path,
        format="GIF",
        save_all=True,
        append_images=palette_frames[1:],
        duration=FRAME_MS,
        loop=0,
        optimize=True,
        disposal=2,
    )
    del rgb_frames, palette_frames, palette
    return {
        "gif": str(gif_path.relative_to(ROOT)),
        "poster": str(poster_path.relative_to(ROOT)),
        "dimensions": list(size),
        "frames": FRAMES,
        "frame_duration_ms": FRAME_MS,
        "loop": "infinite",
        "gif_bytes": gif_path.stat().st_size,
        "poster_bytes": poster_path.stat().st_size,
        "render_seconds": round(time.perf_counter() - started, 3),
    }


def main():
    MEDIA.mkdir(parents=True, exist_ok=True)
    BRAND.mkdir(parents=True, exist_ok=True)
    started = time.perf_counter()

    original_logo = BRAND / "amrita-logo.png"
    logo = Image.open(original_logo).convert("RGBA")
    alpha_bbox = logo.getchannel("A").getbbox()
    if alpha_bbox is None:
        raise ValueError("Supplied logo is fully transparent")
    trimmed_path = BRAND / "amrita-logo-trimmed.png"
    logo.crop(alpha_bbox).save(trimmed_path, format="PNG", optimize=True)

    webp_outputs = {}
    for filename in ("campus-sketch.png", "opportunity-sketch.png"):
        source = MEDIA / filename
        target = source.with_suffix(".webp")
        with Image.open(source) as original:
            original.convert("RGB").save(target, "WEBP", quality=86, method=6)
        webp_outputs[target.name] = {
            "source": str(source.relative_to(ROOT)),
            "output": str(target.relative_to(ROOT)),
            "dimensions": list(Image.open(target).size),
            "quality": 86,
            "bytes": target.stat().st_size,
        }

    animations = {
        "career-orbit": encode_gif("career-orbit", (640, 420), career_orbit),
        "pathways": encode_gif("pathways", (480, 260), pathways),
    }
    for name, item in animations.items():
        if item["gif_bytes"] >= 2_000_000:
            raise ValueError(f"{name} exceeds the 2 MB GIF budget")

    source_paths = [original_logo, MEDIA / "campus-sketch.png", MEDIA / "opportunity-sketch.png"]
    manifest = {
        "authoring": {
            "tool": "scripts/render-brand-assets.py",
            "python": platform.python_version(),
            "pillow": PILLOW_VERSION,
            "seed": SEED,
            "explicit_command": "systemd-run --user --scope -p MemoryMax=256M -p MemorySwapMax=64M python scripts/render-brand-assets.py",
            "frame_rendering": "deterministic from absolute frame index; offline only",
        },
        "animation": {
            "fps": 12.5,
            "frame_count": FRAMES,
            "frame_duration_ms": FRAME_MS,
            "duration_seconds": round(FRAMES * FRAME_MS / 1000, 2),
            "colors": {"ivory": "#f8f6f2", "burgundy": "#761731", "deep_wine": "#431626", "gold": "#c79a63"},
            "antialias_scale": SCALE,
            "items": animations,
        },
        "webp_exports": webp_outputs,
        "logo_trim": {
            "source": str(original_logo.relative_to(ROOT)),
            "output": str(trimmed_path.relative_to(ROOT)),
            "alpha_bbox_xyxy": list(alpha_bbox),
            "dimensions": list(Image.open(trimmed_path).size),
            "pixel_content": "alpha-bounds crop only; source pixels preserved",
        },
        "source_sha256": {str(path.relative_to(ROOT)): sha(path) for path in source_paths},
        "output_sha256": {},
    }
    outputs = [trimmed_path]
    outputs.extend(MEDIA / f"{name}{suffix}" for name in animations for suffix in (".gif", "-poster.png"))
    outputs.extend(MEDIA / f"{name}.webp" for name in ("campus-sketch", "opportunity-sketch"))
    manifest["output_sha256"] = {str(path.relative_to(ROOT)): sha(path) for path in outputs}
    manifest["actual_script_elapsed_seconds"] = round(time.perf_counter() - started, 3)
    MANIFEST.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"animations": animations, "webp_exports": webp_outputs, "logo_trim": manifest["logo_trim"], "elapsed_seconds": manifest["actual_script_elapsed_seconds"]}, indent=2))


if __name__ == "__main__":
    main()
