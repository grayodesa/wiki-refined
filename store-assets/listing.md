# Chrome Web Store Listing — Wiki Refined

Everything you need to paste into the Developer Dashboard submission form.
Two languages provided (EN primary, RU secondary). Character limits are enforced by the store — counts noted inline.

---

## 1. Basic info

| Field | Value |
|---|---|
| **Extension name** | Wiki Refined |
| **Version** | 1.0.0 |
| **Category** | Productivity |
| **Language (default)** | English |
| **Additional languages** | Russian |

---

## 2. Short description (EN)

**Limit: 132 characters. This one: 119.**

```
Clean, distraction-free Wikipedia reading. Better typography, focused layout, sticky table of contents, dark mode.
```

## 2a. Short description (RU)

```
Чистое чтение Wikipedia без отвлечений: лучшая типографика, центрированный текст, липкое оглавление, тёмная тема.
```

---

## 3. Detailed description (EN)

```
Wiki Refined turns every Wikipedia article into a focused reading surface — the kind you'd expect from a modern long-form site, not a 20-year-old wiki chrome.

What it does
• Removes clutter — hides navigation panels, edit buttons, admin notices, and the footer wall
• Better typography — Inter for body text, JetBrains Mono for headings, proper line-height and measure
• Centered column — focused reading width (640 / 740 / 860 px, adjustable)
• Sticky table of contents — auto-generated, pinned to the left, highlights the section you're reading
• Reading progress — a thin bar at the top shows how far you've read
• Minimal top bar — article title on scroll, one-click toggle to disable, link back to the original page
• Dark mode — respects Wikipedia's own dark/light toggle
• Customizable — font size (13–23 px) and content width adjustable from the toolbar popup

What it does NOT do
• No proxy. The extension never sends your browsing anywhere. All changes are local CSS and a few hundred lines of vanilla JS.
• No tracking. No analytics. No remote code.
• No ads. Ever.
• No account, no sign-up, no cloud sync beyond Chrome's built-in settings sync for your preferences.

Why it exists
Wikipedia's content is incredible. Its default presentation is not. Wiki Refined is the smallest possible intervention that makes long articles pleasant to read — no rewriting, no mirroring, no middleman. If you disable the extension, you get the original page back instantly.

Privacy
Wiki Refined stores only your own settings (font size, content width, enabled/disabled flag) using Chrome's standard storage API. Nothing is collected, transmitted, or shared. See the Privacy Practices tab for the full declaration.

Open source
Source code available at: https://github.com/grayodesa/wiki-refined
Licensed under MIT.
```

## 3a. Detailed description (RU)

```
Wiki Refined превращает любую статью Wikipedia в сфокусированное пространство для чтения — такое, какого ждёшь от современного лонгрида, а не от 20-летнего wiki-интерфейса.

Что делает
• Убирает визуальный шум — скрывает навигацию, кнопки редактирования, служебные уведомления и нижний колонтитул
• Улучшает типографику — Inter для основного текста, JetBrains Mono для заголовков, корректная межстрочка и длина строки
• Центрирует колонку — ширина для комфортного чтения (640 / 740 / 860 px, настраивается)
• Липкое оглавление — автогенерируемое, закреплено слева, подсвечивает текущий раздел
• Индикатор прогресса — тонкая полоса сверху показывает, сколько прочитано
• Минималистичная верхняя панель — название статьи при скролле, быстрое выключение, ссылка на оригинал
• Тёмная тема — уважает собственный переключатель Wikipedia
• Настраивается — размер шрифта (13–23 px) и ширина колонки в popup-меню

Чего НЕ делает
• Никакого прокси. Расширение не отправляет ничего наружу. Всё работает локально: CSS плюс несколько сотен строк обычного JS.
• Никакой аналитики. Никакой телеметрии. Никакого удалённого кода.
• Никакой рекламы.
• Ни аккаунтов, ни регистрации, ни облачной синхронизации, кроме встроенного Chrome sync для ваших настроек.

Зачем оно
Содержимое Wikipedia великолепно. Оформление — нет. Wiki Refined — минимальное вмешательство, которое делает длинные статьи приятными для чтения, без переписывания и зеркал. Отключите расширение — получите исходную страницу мгновенно.

Приватность
Wiki Refined хранит только ваши настройки (размер шрифта, ширина, вкл/выкл) через стандартное Chrome Storage API. Ничего не собирается, не передаётся и не разглашается. Полная декларация — во вкладке Privacy Practices.

Open source
Исходный код: https://github.com/grayodesa/wiki-refined
Лицензия MIT.
```

---

## 4. Single-purpose description

Chrome Web Store requires a single-purpose statement for MV3 extensions. Paste into the "Single Purpose" field:

```
Wiki Refined has one purpose: restyle Wikipedia article pages for comfortable reading — applying typography, layout, table of contents, and dark-mode refinements via CSS and a small content script. It does not modify any other site, does not collect data, and does not perform any unrelated task.
```

---

## 5. Permission justifications

Chrome Web Store asks for a separate justification for each permission. Use these verbatim:

### `storage`

```
Used to persist user preferences (enabled/disabled flag, font size, content column width) via chrome.storage.sync so they survive page reloads and sync across the user's Chrome profile. No other data is stored.
```

### `scripting`

```
Used by the toolbar popup to push live CSS-variable updates (--wr-font-size, --wr-content-max-width) into the active Wikipedia tab when the user adjusts sliders, so changes apply immediately without a page reload. The injected function is a one-line document.documentElement.style.setProperty call — no remote code, no eval.
```

### `activeTab`

```
Used so the toolbar popup can target the currently focused Wikipedia tab when applying live preference updates. Grants access only to the tab the user explicitly invoked the extension on, and only for the duration of that interaction.
```

### Host permissions (`*://*.wikipedia.org/wiki/*`, `*://*.wikipedia.org/w/index.php*`)

```
The extension only operates on Wikipedia article pages. Host matches are scoped to /wiki/ and /w/index.php paths on any wikipedia.org subdomain (any language). No other sites are touched.
```

---

## 6. Privacy practices (Data usage tab)

Check the following boxes in the Developer Dashboard "Privacy practices" form:

| Data type | Collected? |
|---|---|
| Personally identifiable info | **No** |
| Health info | **No** |
| Financial & payment info | **No** |
| Authentication info | **No** |
| Personal communications | **No** |
| Location | **No** |
| Web history | **No** |
| User activity | **No** |
| Website content | **No** |

Certification checkboxes (all three must be checked and are true for this extension):

- [x] I do not sell or transfer user data to third parties, outside of the approved use cases.
- [x] I do not use or transfer user data for purposes that are unrelated to my item's single purpose.
- [x] I do not use or transfer user data to determine creditworthiness or for lending purposes.

**Privacy policy URL:** `https://github.com/grayodesa/wiki-refined/blob/main/store-assets/privacy-policy.md`

Policy source lives in-repo at `store-assets/privacy-policy.md`. GitHub renders markdown at the `/blob/main/...` URL, which is an acceptable target for the Chrome Web Store "Privacy policy" field. If you'd prefer a bare HTML page, enable GitHub Pages on the repo and change this URL to the Pages version — content is the same.

---

## 7. Support & homepage URLs

| Field | Value |
|---|---|
| **Homepage URL** | https://github.com/grayodesa/wiki-refined |
| **Support URL** | https://github.com/grayodesa/wiki-refined/issues |

---

## 8. Assets checklist

| Asset | Required? | Size | Status |
|---|---|---|---|
| Store icon | required | 128×128 PNG | ✅ `icons/icon128.png` |
| Screenshot 1 | required | 1280×800 | ✅ `store-assets/screenshots/01-hero-reading.png` |
| Screenshot 2 | recommended | 1280×800 | ✅ `store-assets/screenshots/02-toc-rich-article.png` |
| Screenshot 3 | recommended | 1280×800 | ✅ `store-assets/screenshots/03-reading-view.png` |
| Screenshot 4 | recommended | 1280×800 | ✅ `store-assets/screenshots/04-popup-controls.png` |
| Small promo tile | optional | 440×280 | ⏳ skip for v1, add later if doing featured promotion |
| Marquee promo tile | optional | 1400×560 | skip |

---

## 9. Submission checklist (run through before clicking Publish)

- [ ] Replace all `<REPLACE>` placeholders above with the real GitHub repo URL
- [ ] Upload `dist/wiki-refined-1.0.0.zip`
- [ ] Paste short description (EN) — verify ≤132 chars
- [ ] Paste detailed description (EN)
- [ ] Add Russian translation (toggle language in dashboard)
- [ ] Upload store icon 128×128
- [ ] Upload 3–5 screenshots 1280×800
- [ ] Fill single-purpose field
- [ ] Fill permission justifications (three fields)
- [ ] Check Privacy Practices boxes + three certifications
- [ ] Set category = Productivity
- [ ] Set visibility (Public / Unlisted / Private)
- [ ] Set regions (Worldwide unless you have a reason)
- [ ] Review → Submit for review

Review typically takes 1–3 business days for a first submission.
