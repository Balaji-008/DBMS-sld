# Independent media quality review

**Reviewer:** independent artifact inspection
**Date:** 2026-11-09
**Decision:** Approve for presentation and sharing; no blocking media-quality findings.

## Evidence inspected

- Opened all five slide PNGs and the presentation contact sheet; checked PDF page count/text and PPTX slide XML/text. PDF reports exactly 5 pages and PPTX contains exactly 5 slide IDs/slide XMLs.
- Inspected the encoded video contact sheet, poster, video metadata, and delivery provenance README/share copy. `ffprobe` reports 1920×1080 H.264 High / yuv420p at 30 fps, 22.000 seconds, with AAC LC 48 kHz stereo and nonzero audio bitrate. Poster is 1920×1080. No render/browser run was performed.
- Compared the slide team names and IDs to the requested full identifiers and the role statement in `docs/team-viva/DBMS-WALKTHROUGH.md`. Confirmed the 18-table `[DERIVED]` count directly against 18 `CREATE TABLE` statements in `database/001_schema.sql`.

## Review

- The deck has a clear five-part sequence: portal framing, system architecture, relational design and integrity, role workflows with scoped QA evidence, then the agreed team split/demo handoff. The architecture shown is consistent with the project README and viva walkthrough: React/TypeScript → Cloudflare forwarding/private tunnel → Express → Oracle `FREEPDB1`/`PLACEMENTS_PORTAL`; Gmail is an OTP delivery side path and APEX is described as read-only inspection. The database slide appropriately explains relation rows and JSON serialization mirrors without claiming strict normalization. The 18-table figure is labeled derived.
- The team slide gives all four full IDs and correct names/roles: Balaji Rayudu S (011), Balcha Venkata Parswanadh (012), Balusu Naga Sri Abhiram (013), and Bhavana Malladi (014). It presents responsibilities as agreed viva ownership, not commit-history attribution.
- Branding is consistent with Amrita Bengaluru: supplied wordmark, wine/ivory palette, and campus sketch. Product imagery is visibly synthetic/demo-labeled where applicable. The video shows the dashboard entry, opportunity detail and submitted application, and avoids the excluded aggregate report metrics. I found no visible CampusBridge brand or unresolved template placeholder in the inspected deck/video collateral.
- Slide text is legible at full slide size and no clipping/overlap is apparent. Some source/method and QA caveat text along the bottoms of slides 2–4 is small and intended as supporting detail; main headings, diagrams, workflow labels, and role cards remain easy to scan. Video pacing and transitions appear coherent in the encoded contact sheet; the poster matches the branded opening composition.
- Music and SFX are named and credited in the video README, share copy, and MP4 comment metadata. README identifies Sascha Ende’s “Happy Beats / Business Moves, Vol. 10” with a creator-site URL and CC BY 4.0, and Kenney Impact Sounds with the pack URL and CC0. The video metadata carries the same attribution. I verified presence/consistency of provenance claims, not license terms against external sources.

## Limits

This is an artifact-level review of exported files and local project documentation. It does not establish playback quality on physical devices, speaker-dependent loudness preference, or exhaustive factual verification of every implementation claim. The scoped caveats visible on the QA slide are appropriate and retained.
