# Landing UI release work — 2026-11-10

- Replaced the fixed-height, absolutely positioned hero campus artwork with a normal-flow grid row below the hero copy and aside. The copy and animation have separate columns at larger widths; the campus image retains intrinsic dimensions. Mobile uses a single column and retains the existing hidden-aside behavior.
- Preserved the motion component's visibility, pause and reduced-motion behavior, and existing logo and campus sketch. Sign-in text now says email verification instead of implying institutional affiliation.
- Created an original abstract campus-contour illustration using the built-in image generator. Prompt, transformation, usage and checksums are in `design/public-patterns/campus-contours.md`; only its 46 KB WebP export is loaded as a low-opacity decoration in the aside.
- `npm run typecheck:client`: passed (exit 0).
- Responsive browser overlap, screenshots, zoom, and focused brand gate await the coordinated browser/build slot and independent QA. No physical-device claim is made here.
- Coordinated production build passed (exit 0): `systemd-run --user --scope -p MemoryMax=640M -p MemorySwapMax=128M -p CPUQuota=200% env NODE_OPTIONS=--max-old-space-size=384 npm run build`. Server and client typechecks and Vite production build completed. Vite reported an existing mixed static/dynamic import chunking warning for `client/src/api.ts`.
- Frozen source hashes: Landing.tsx `91b67ecc93bbc2d69390c2920e6f5719b47a78a95144a665425d91e5995c4bcc`, Login.tsx `1cccf867646880698f397191a4f36198db7aa32da1d195b8d074acddd8d5a00e`, styles.css `acf9f93e031d6512be7644d8eb16f7e970068108513c0c9b63fe0afea68c3714`.
