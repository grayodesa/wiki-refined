# Wiki Refined

Clean, distraction-free Wikipedia reading experience. Better typography, focused layout, sticky table of contents.

**No proxy servers. No tracking. No ads. Just CSS + minimal JS.**

## What it does

- **Removes clutter** — hides Wikipedia's navigation chrome, edit buttons, admin notices, footer
- **Better typography** — Inter sans-serif for body text (system font fallback), JetBrains Mono for headings, proper line height and spacing
- **Centered layout** — focused content column (adjustable width: 640/740/860px)
- **Sticky TOC** — auto-generated table of contents pinned to the left side, highlights current section as you scroll
- **Reading progress** — thin progress bar at the top shows how far you've read
- **Top bar** — minimal bar with article title (appears on scroll), quick toggle to disable, link to original page
- **Dark mode** — respects Wikipedia's own dark mode toggle
- **Customizable** — font size (13-23px, default 18px) and content width (640/740/860px) adjustable from popup

## Installation

### Chrome / Brave / Edge

1. Download or clone this folder
2. Open `chrome://extensions/` (or `brave://extensions/`)
3. Enable **Developer mode** (toggle in top-right)
4. Click **Load unpacked**
5. Select the `wiki-refined` folder
6. Navigate to any Wikipedia article

### Firefox (with minor modifications)

The extension uses Manifest V3 which is supported in Firefox 109+. You may need to adjust `chrome.storage` → `browser.storage` calls.

## Files

```
wiki-refined/
├── manifest.json     # Extension manifest (MV3)
├── styles.css        # All CSS overrides (~500 lines)
├── content.js        # TOC builder, scroll tracking, topbar
├── popup.html        # Settings popup UI
├── popup.js          # Settings logic
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md
```

## Keyboard shortcuts

None yet — planned for v1.1.

## Known limitations

- TOC is hidden on screens narrower than 1100px
- Does not restyle Special: pages, Talk: pages, or edit mode
- Wikipedia's own A/B tests may occasionally change class names
- The "Original" button opens the page in a new tab with `?wr=off`; the extension stays off in that tab until you navigate away

## Compared to Wikiwand

| Feature | Wikiwand | Wiki Refined |
|---------|----------|--------------|
| Proxy through external domain | ✅ | ❌ |
| Ads | ✅ (now) | ❌ |
| Tracking | ✅ | ❌ |
| Works offline (cached pages) | ❌ | ✅ |
| Open source | ❌ | ✅ |
| Custom font size | ❌ | ✅ |
| Custom content width | ❌ | ✅ |
| Dark mode | ✅ | ✅ |
| Sticky TOC | ✅ | ✅ |

## License

MIT — do whatever you want with it.
