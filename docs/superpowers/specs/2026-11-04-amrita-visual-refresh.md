# Amrita Placement Portal visual refresh

## Goal
Rename the user-facing application to Amrita Placement Portal; use the supplied Amrita Bengaluru Campus logo and transform the supplied campus photograph into an architectural sketch background. Add a polished public landing experience, professional abstract artwork, reusable GIF animations and matching HTML OTP emails. Preserve every Oracle-backed workflow, active Gmail configuration and existing domain.

## Success criteria
- Public landing at `/` for visitors; authenticated overview remains at `/` to preserve current application links. `/login` retains student/recruiter/placement-team OTP login and registration.
- Supplied white logo is visible against maroon; no invented university logo. Photograph composition remains recognizable in the generated campus sketch.
- At least two actual pre-rendered animated GIF files, with static posters, pause controls and reduced-motion support. No runtime Canvas/WebGL or per-frame React state for illustrations.
- All visible CampusBridge branding replaced, including page metadata and Gmail sender display name; internal schema/session/service identifiers stay compatible.
- Responsive branded table-based HTML email with readable plain text, prominently displayed OTP, five-minute expiry, safe site link and embedded logo. No additional test email is sent without authorization.
- Build, targeted API/email checks, desktop/mobile/reduced-motion browser checks, and Wrangler deployment verified. Gmail credentials never enter source or logs.

## Visual direction
Amrita Bengaluru Campus identity from the supplied white wordmark. Burgundy #761731, deep burgundy #431626, gold #c79a63, ivory #f8f6f2, charcoal #252634 and soft ink #6b6470. Retain readable interface typography; add a restrained academic editorial display face for the public hero. Campus architectural sketch carries the visual identity, with orbit/pathway abstract motion used in small purposeful areas. User-provided campus image determines the architecture; no fabricated buildings or metrics.

## Assets and interface contract
- `client/public/brand/amrita-logo.png`: byte-for-byte original supplied PNG. Optional trimmed export may remove transparent padding without changing content.
- `client/public/media/campus-sketch.png`: generated architectural sketch from the supplied photo; panoramic composition preserved.
- `client/public/media/career-orbit.gif` and `career-orbit-poster.png`: 640x420, 48 frames, 80ms/frame, 3.84-second periodic loop, opaque ivory background, burgundy/gold artwork.
- `client/public/media/pathways.gif` and `pathways-poster.png`: 480x260, 48 frames, 80ms/frame, same loop/colors.
- `client/public/media/opportunity-sketch.png`: static editorial abstract artwork, generated if available; campus sketch can serve as initial fallback during implementation only.
- `/login`, role tab labels and all frozen API endpoint/payload shapes remain compatible with `docs/API-CONTRACT.md`.
- Offline renders happen only when the explicit asset-generation script is run, never in dev/build/server startup. GIF target under 2MB each, static posters for reduced motion and pause; measure actual sizes/frame counts.

## Constraints
User explicitly requests multiple Luna subagents and orchestration. Available memory at start about 2.2GiB: one Luna implementation worker at a time; no browser/render/build while worker runs a heavy command. Keep current API/tunnel alive except controlled API restart at integration. Use existing memory caps, Oracle schema and Gmail account. Preserve existing uncommitted SMTP setup documentation changes.
