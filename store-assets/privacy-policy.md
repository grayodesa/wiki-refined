# Privacy Policy — Wiki Refined

**Effective date:** 2026-04-11
**Extension:** Wiki Refined (Chrome Web Store)
**Source code:** https://github.com/grayodesa/wiki-refined
**Contact:** https://github.com/grayodesa/wiki-refined/issues

---

## Short version

Wiki Refined does not collect, transmit, or share any data about you.
The only information the extension ever touches is **your own preferences** — font size, content column width, and whether the extension is enabled — stored locally in your browser via Chrome's standard storage API. Nothing leaves your device through this extension.

---

## What the extension does

Wiki Refined is a client-side stylesheet + small content script that restyles Wikipedia article pages (`*.wikipedia.org/wiki/*`) for more comfortable reading. It removes clutter, improves typography, adds a sticky table of contents, and shows a minimal top bar. All of this runs locally in your browser using CSS and ~400 lines of vanilla JavaScript.

Wiki Refined is **not** a proxy, mirror, or rewriter. It does not fetch alternate versions of Wikipedia pages from any other server. The content you see is still served directly by Wikipedia — the extension only restyles it after your browser receives it.

## Data we collect

**None.**

- No analytics.
- No telemetry.
- No crash reports.
- No page content is ever sent anywhere.
- No IP addresses, device identifiers, cookies, or user agents are collected by the extension.
- No third-party services are contacted. The extension has **zero** network requests of its own.

## Data we store locally

Wiki Refined uses the standard [`chrome.storage.sync`](https://developer.chrome.com/docs/extensions/reference/api/storage) API to persist three user preferences:

| Key | Purpose | Values |
|---|---|---|
| `wr-enabled` | Whether Wiki Refined restyles Wikipedia pages | `true` / `false` |
| `wr-font-size` | Body font size | `13` to `23` (pixels) |
| `wr-content-width` | Content column width | `640`, `740`, or `860` (pixels) |

That's the entire scope of stored data. The extension never writes anything else.

### About `chrome.storage.sync`

`chrome.storage.sync` is a standard Chrome API. If you have Chrome Sync enabled in your Google account, these three preference values will sync to your other signed-in Chrome browsers so the extension behaves consistently across devices. This syncing is handled by Chrome/Google itself — Wiki Refined has no access to any sync infrastructure and cannot see or transmit the synced values outside the API.

If you are **not** signed in to Chrome, or have disabled Chrome Sync, the preferences are stored only on the current device.

You can inspect or clear these values at any time at `chrome://sync-internals` or by uninstalling the extension.

## Permissions and why they exist

Wiki Refined requests three browser permissions. Each one is used only for the extension's stated purpose.

- **`storage`** — to save the three user preferences listed above via `chrome.storage.sync`. Nothing else is stored.
- **`scripting`** — used by the toolbar popup to push live CSS-variable updates into the active Wikipedia tab when you move the font size or width controls, so changes apply immediately without a page reload. The only code injected is a single-line `document.documentElement.style.setProperty(name, value)` call. No remote code is ever loaded or executed.
- **`activeTab`** — grants the popup access to the currently focused tab *for the duration of the user-initiated interaction only*, so the live CSS-variable update can reach the Wikipedia page you are currently looking at.

Wiki Refined also declares **host permissions** restricted to Wikipedia:

```
*://*.wikipedia.org/wiki/*
*://*.wikipedia.org/w/index.php*
```

This means the extension can **only** run on Wikipedia article pages (any language edition). It cannot access, read, or modify any other website.

## What we do not do

Wiki Refined has no code and no permission to do any of the following. These aren't promises — they are constraints enforced by the manifest and source code (which is public and auditable):

- Contact any third-party server.
- Load or execute remote code.
- Read or modify pages outside `*.wikipedia.org/wiki/*`.
- Access your browsing history, bookmarks, tabs, or downloads.
- Access your clipboard, camera, microphone, location, or file system.
- Collect any form of analytics, identifiers, or usage statistics.
- Share any data with any third party, advertiser, or analytics provider.
- Use your data to determine creditworthiness or for lending purposes.
- Sell or transfer data to anyone.

## Children's privacy

Wiki Refined does not collect any data, so no data about children (or anyone) is collected, processed, or shared.

## Changes to this policy

If a future version of Wiki Refined changes what it stores or what permissions it needs, this policy will be updated in the same commit that introduces the change. The commit history on GitHub is the canonical record — see https://github.com/grayodesa/wiki-refined/commits/main/store-assets/privacy-policy.md

If a change would affect how your data is handled, it will also be announced in the release notes on the Chrome Web Store listing.

## Contact

For questions, concerns, or security reports, please open an issue at:

https://github.com/grayodesa/wiki-refined/issues

The extension's full source code is available at the same repository under the MIT license. You are encouraged to audit it.
