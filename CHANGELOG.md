# Changelog

## 1.1.0 — 2026-09-04

### Fixed
- Table of contents was missing on almost every article. Wikipedia now serves Parsoid markup that wraps sections in `<section>`, which the old heading filter rejected. The filter now checks container membership instead of nesting depth.
- "Original" button opened the same restyled page. It now opens the article with `?wr=off`, which the content script honours by staying inactive in that tab.
- Dead link in PRIVACY.md to the old policy location.
- The article column now uses the extension's own background. Vector paints `.mw-page-container` white over the page, so the warm light background never reached the text and a forced dark theme showed light text on white. Modern `<figure>` thumbnails follow the theme as well.

### Added
- Theme setting: auto (follows Wikipedia's own setting, then the OS), light, dark. Wikipedia's appearance menu is hidden while the extension is active, so this is the only way to switch.
- Bundled fonts: Inter 4.1 and JetBrains Mono 2.304 ship in the package (SIL OFL), so the typography no longer depends on what is installed locally.
- TOC drawer on screens narrower than 1100px, opened from the top bar, closed by Escape or a link click.
- Keyboard shortcuts: `Alt+Shift+W` toggles the extension, `Alt+Shift+C` shows or hides the TOC (collapses it and centres the article on wide screens).
- TOC title taken from Wikipedia's own localised header for every language.
- Playwright smoke tests (`npm test`) against live Wikipedia: TOC oracle, settings propagation, theme precedence, font loading, drawer and shortcut paths.

### Changed
- Permissions reduced to `storage`. `scripting` and `activeTab` were only used to push live CSS variables from the popup; the storage change listener already does that in every open tab.
- A background service worker handles the keyboard commands (uses `tabs.sendMessage` on the active tab; the `tabs` permission is not requested).

## 1.0.0 — 2026-04-11

Initial release.
