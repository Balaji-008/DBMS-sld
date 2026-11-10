# 320px student route overflow diagnosis

Captured from the current production client bundle using one isolated local test server and one controlled `student@campus.test` OTP sign-in. The browser used a 320 × 844 CSS pixel viewport. Captures and machine-readable element geometry are in `test-results/showcase/mobile320-{dashboard,opportunities,applications}.png` and `test-results/showcase/mobile320-diagnostics.json`.

## Measured causes

- **Dashboard:** `section.dashboard-grid.dashboard-bottom > div.panel.upcoming-panel` measures 341.3px wide inside its 298px parent, ending at x=352.3px. Its computed `min-width` is `auto` and width is 341.25px, while the parent grid uses one `1fr` track. This creates 32px document overflow. The sibling panel also measures 341.3px, indicating the grid item minimum is not shrinking to its available track width.
- **Bottom navigation on all three routes:** `nav.mobile-bottom-nav` extends beyond its 320px `div.app-shell` parent: right edge 352px on dashboard, 333px on opportunities, and 324px on applications. Its grid tracks plus gap and horizontal padding exceed the viewport. This is a shared overflow source.
- **Opportunities header:** `header.topbar` is 320px wide but reports 333px `scrollWidth`; the screenshot shows the account/sign-out area clipped at the right edge. Inspect its children when fixing the header, in addition to the fixed navigation overflow.
- **Applications:** page-level overflow is 4px, matching the bottom navigation. The wider intrinsic table row is inside the table and is omitted as an intentional table-area overflow.

No UI files were changed in this diagnostic task. The exact per-route viewport and selector metrics are in the JSON evidence file.
