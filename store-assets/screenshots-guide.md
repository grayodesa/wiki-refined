# Screenshots Guide — Wiki Refined

Chrome Web Store accepts screenshots at **1280×800** or **640×400**. Always pick 1280×800 — it's sharper in the listing and you can downscale if needed.

## Setup (one-time)

1. Load the unpacked extension from the repo root in `chrome://extensions/` (Developer mode → Load unpacked → select the project folder). Do **not** load the zip — use the folder so live reloads work.
2. Open a new Chrome window sized exactly to the capture area. Easiest approach:
   - DevTools → Device toolbar (Cmd+Shift+M) → "Responsive" → type **1280 × 800** in the size inputs → set DPR to **2** for Retina sharpness.
   - Alternatively use a window resizer extension, or set window bounds via AppleScript:
     ```
     osascript -e 'tell application "Google Chrome" to set bounds of front window to {0, 0, 1280, 800}'
     ```
3. Disable browser UI overlays that would leak into the screenshot (bookmarks bar: Cmd+Shift+B, DevTools panel closed, no notifications).
4. For the "popup open" shot, the popup overlays the page — capture at 1280×800 including the popup. Use **Cmd+Shift+4 then Space** on macOS to capture a window region, or DevTools → Capture screenshot.

## Capture list (5 shots, ordered for the listing)

The order matters — Chrome Web Store displays them in sequence and the first one is the hero image.

### Shot 1 — Hero / main reading view
**Filename:** `01-hero-reading.png`
**URL:** `https://en.wikipedia.org/wiki/Typography`
**Why this article:** long intro, clean infobox, visible TOC, typography as the subject is a nice meta-joke.
**What to show:**
- Scroll position: top of article, infobox visible on the right
- Sticky TOC visible on the left
- Top bar (progress + title) visible
- Default font size (18 px), default width (740 px)
- **Light mode**

### Shot 2 — Sticky TOC highlighting current section
**Filename:** `02-sticky-toc.png`
**URL:** same Typography page (or `https://en.wikipedia.org/wiki/Photosynthesis` if you prefer a longer TOC)
**What to show:**
- Scroll down ~40% so reading progress bar is visibly filled
- A mid-article H2 in view
- TOC on the left highlights the currently-visible section
- Top bar shows article title (collapsed state)

### Shot 3 — Popup with controls
**Filename:** `03-popup-controls.png`
**URL:** any Wikipedia article (same hero article is fine for continuity)
**What to show:**
- Click the extension's toolbar icon so the popup is open
- Popup shows: enabled toggle (on), font size control, content width control
- The article behind is still visible and styled

### Shot 4 — Dark mode
**Filename:** `04-dark-mode.png`
**URL:** `https://en.wikipedia.org/wiki/Night_sky` (topical) or the Typography article
**Setup:** Click Wikipedia's own Appearance → Dark toggle (top right of the page, native Wikipedia control). Wiki Refined respects it.
**What to show:**
- Same type of view as Shot 1 but dark
- TOC + top bar both in dark styling

### Shot 5 — Wide content + large font (customization)
**Filename:** `05-custom-width-font.png`
**URL:** `https://en.wikipedia.org/wiki/Iceberg` (has a clean hero image)
**Setup:** Open popup → set content width to **860 px** → set font size to **22 px** → close popup
**What to show:**
- The same reading layout but visibly wider and larger
- Optional: include the popup in a small corner if it fits cleanly; otherwise just the article

## Crop & export

- All screenshots must be **exactly 1280×800 PNG**. Tolerate no off-by-one.
- If you captured at 2× (Retina), downscale in Preview: Tools → Adjust Size → Width 1280, Height 800, Resolution 72, uncheck "Resample image" is **wrong** — you DO want resample on, with "Scale proportionally" on.
- Save as PNG (not JPEG — store requires lossless).
- Place finished files in `store-assets/screenshots/` in the repo.

## Quick verification

After exporting, confirm dimensions:

```
file store-assets/screenshots/*.png
```

Each line must end with `1280 x 800`. If any are off, re-crop — the store rejects mismatched dimensions silently (they just don't upload).

## Style tips (make them look like a product, not a bug report)

- **Pick real articles with real content.** Don't screenshot stubs or disambiguation pages.
- **Avoid selection highlights** — click somewhere neutral before capture.
- **No cursor in frame** if possible. macOS: Cmd+Shift+5 → Options → Hide cursor. Or just move the mouse off-screen.
- **No browser chrome badges** — remove notification dots from the extension icon area by dismissing any pending Chrome update prompts.
- **Consistent font rendering** — keep the same zoom level (100%) across all shots so text looks the same size.
- **No ads in sidebars** — Wikipedia has none, but if you have other extensions injecting anything, disable them for the capture session.

## If you need to automate it

Playwright can snapshot a real Chromium with the unpacked extension loaded. Rough sketch — ask me to expand it if manual capture is painful:

```js
import { chromium } from 'playwright';
const ctx = await chromium.launchPersistentContext('', {
  headless: false,
  args: [
    '--disable-extensions-except=/Volumes/Video/Git/other/wiki-refined',
    '--load-extension=/Volumes/Video/Git/other/wiki-refined',
  ],
  viewport: { width: 1280, height: 800 },
  deviceScaleFactor: 2,
});
const page = await ctx.newPage();
await page.goto('https://en.wikipedia.org/wiki/Typography');
await page.waitForTimeout(1500); // let content.js run
await page.screenshot({ path: '01-hero-reading.png', fullPage: false });
```

The catch: Playwright's bundled Chromium is missing some codecs and the "Appearance" dark-mode toggle may behave slightly differently, so the dark-mode shot is easier done in real Chrome.
