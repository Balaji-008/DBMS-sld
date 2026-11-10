# Mobile showcase UI review

Scope: read-only review of the targeted drawer and eligibility-control changes against current source. No source edits, browser runs, builds, or tests were performed. QA owns current-bundle visual and E2E evidence.

## Rereview status

- **Closed-drawer reachability — resolved in source.** At compact widths, `Shell` now sets `aria-hidden` and `inert` only while the drawer is closed. The resize handler closes it when crossing to desktop; desktop clears both attributes. Opening the drawer also clears both. See [Shell.tsx]($PROJECT_ROOT/client/src/components/Shell.tsx:10) and [Shell.tsx]($PROJECT_ROOT/client/src/components/Shell.tsx:16).
- **Eligibility-filter keyboard focus — resolved in source.** The visually hidden checkbox now styles its visible adjacent span under `:focus-visible`. See [styles.css]($PROJECT_ROOT/client/src/styles.css:1021).

## Remaining source finding

### Medium — Hidden collapse button is included in the mobile drawer focus trap

The mobile-open drawer hides `.collapse-button` with `display: none`, but `useDialog` includes every enabled button in its focusable list without checking whether the element is rendered. The hidden collapse button therefore becomes the trap's `lastElement`. Tab from the last visible drawer control is not contained because it is not that hidden element; Shift+Tab from the first control can target the hidden button. This can let keyboard focus leave the modal drawer or land on an invisible control.

References: [styles.css]($PROJECT_ROOT/client/src/styles.css:2354), [useDialog.ts]($PROJECT_ROOT/client/src/hooks/useDialog.ts:13), [useDialog.ts]($PROJECT_ROOT/client/src/hooks/useDialog.ts:21).

This is a source-level finding only; behavior has not been browser-verified in this review.
