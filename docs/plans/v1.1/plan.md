# Wiki Refined v1.1 — план

Дата: 2026-09-04. Ветка `feat/v1.1` от `main` (`1ed7244`). Все правки — vanilla JS/CSS, без сборки.

Скоуп — девять пунктов из анализа 2026-09-04, пять фаз. Фаза 1 закрывает единственный известный баг и даёт тест, остальные — по убыванию ценности. Каждая фаза — отдельный коммит; PRIVACY.md правится в том же коммите, что меняет ключи хранилища или permissions (это обещание самого PRIVACY.md).

## Факты, на которых стоит план

| # | Факт | Источник |
|---|---|---|
| F1 | Wikipedia отдаёт Parsoid-разметку: `div.mw-parser-output > section > div.mw-heading > h2`, `h3` — в `section > section`. Родитель `.mw-heading` никогда не `.mw-parser-output`. | curl en/ru/uk 2026-09-04, парсер предков |
| F2 | Нативный `#vector-toc` на тех же страницах содержит `N+1` элементов `.vector-toc-list-item`, где `N` — число `.mw-heading` (лишний — «(Top)»). en: 21/20, ru: 8/7, uk: 6/5. | тот же fetch |
| F3 | `?wr=off` → HTTP 200 без редиректа на обеих схемах из manifest: `/wiki/Title` (en, ru) и `/w/index.php?title=…` с `oldid` и без. | curl -I 2026-09-04 |
| F4 | Playwright: расширения работают только в persistent context; `channel: 'chromium'` позволяет headless. Локально есть `playwright@1.59.1` в `store-assets/node_modules`, с `playwright/test.js`. | playwright.dev/docs/chrome-extensions |
| F5 | Шрифты в content-CSS: `url('chrome-extension://__MSG_@@extension_id__/fonts/X.woff2')` + файл в `web_accessible_resources` с `matches`. | developer.chrome.com content-scripts, web-accessible-resources |
| F6 | `chrome.storage.onChanged` доступен в content scripts и срабатывает при любом изменении области; `content.js:35` уже так получает toggle из popup. | developer.chrome.com storage; код |
| F7 | Горячие клавиши: manifest `commands` + `background.service_worker` + `chrome.commands.onCommand`. | developer.chrome.com commands |
| F8 | `styles.css:104-108` скрывает `#vector-appearance`; при активном расширении пользователь не может переключить тему Wikipedia. Классы темы на `<html>`: `skin-theme-clientpref-day|night|os`. | код; fetch |

## Фаза 1 — TOC на Parsoid-разметке + smoke-тест

### 1.1 Фильтр заголовков (`content.js`, `buildTOC`)

Заменить блок строк 167–179 на:

```js
).filter((h) => {
  // Исключения проверяются первыми: навбоксы, таблицы, сноски, инфобоксы
  if (h.closest(".navbox, .mw-collapsible, .reflist, .references, .infobox, .sidebar, .metadata, table")) return false;
  // Заголовок должен принадлежать основному контейнеру (любая глубина: Parsoid оборачивает в <section>)
  if (!h.closest(".mw-parser-output")) return false;
  return getHeadingText(h).length > 0;
});
```

Убрать переменные `parent`, `grandparent`, `isDirectChild`, `isInHeadingDiv`. Убрать неиспользуемую `const id` (строка 197). Порог `headings.length < 3` оставить.

`getHeadingText` без изменений: в Parsoid `.mw-editsection` лежит в `.mw-heading` рядом с `h2`, а не внутри, клон-очистка остаётся корректной для старой разметки.

### 1.2 Инфраструктура теста

- `package.json` в корне: `"private": true`, `"scripts": {"test": "playwright test"}`, `"devDependencies": {"playwright": "^1.59.1"}` (та же версия, что уже в `store-assets`).
- `playwright.config.mjs`: `testDir: 'tests'`, `timeout: 60000`, `workers: 1`, `reporter: 'list'`.
- `tests/fixtures.mjs`: fixture `context` по документации (F4): `chromium.launchPersistentContext(mkdtemp, { channel: 'chromium', args: ['--disable-extensions-except=<repo root>', '--load-extension=<repo root>'] })`; fixture `page` = `context.newPage()`.
- `tests/toc.spec.mjs` — три статьи: `en/Typography`, `ru/Типографика`, `uk/Типографіка`. Для каждой:
  1. `page.goto(url, { waitUntil: 'domcontentloaded' })`, затем `expect(page.locator('.wr-toc')).toBeVisible()`.
  2. Оракул (F2): `count('.wr-toc a[data-wr-target]') === count('#vector-toc .vector-toc-list-item') - 1`.
  3. Каждый `href` из `.wr-toc a` указывает на существующий `id` на странице.
  4. `.wr-topbar` и `.wr-progress` присутствуют.
- `.gitignore`: `node_modules/`, `test-results/`, `playwright-report/`.
- Тест ходит в сеть к Wikipedia. Это осознанно: его задача — ловить смену разметки, офлайн-фикстура её не поймает.

### 1.3 Приёмка
`npm install && npx playwright install chromium && npm test` — три теста зелёные, вывод в отчёте. До фикса тот же тест должен падать на шаге 1 (прогнать один раз на `main`-версии `content.js` для доказательства, что тест ловит баг).

## Фаза 2 — кнопка «Original», permissions, PRIVACY.md

### 2.1 «Original» открывает страницу без стилей
- `content.js`, первой строкой IIFE после проверки `#mw-content-text`:
  ```js
  if (new URLSearchParams(window.location.search).get("wr") === "off") return;
  ```
  Возврат до `chrome.storage.sync.get` и до регистрации `onChanged` — включить обратно из popup такую вкладку нельзя, это и есть «оригинал».
- Обработчик `#wr-btn-original`: `const u = new URL(window.location.href); u.searchParams.set("wr", "off"); window.open(u.toString(), "_blank");`
- README «Known limitations»: убрать пункт про кнопку Original.

### 2.2 Убрать `scripting` и `activeTab`
- `manifest.json`: `"permissions": ["storage"]`.
- `popup.js`: удалить `injectCSS` и оба её вызова; остальное без изменений. Доставка — через `storage.onChanged` в `content.js` (F6), во все вкладки, а не только в активную.
- `PRIVACY.md` §«Permissions and why they exist»: оставить только `storage`, убрать абзацы про `scripting` и `activeTab`, обновить строку «requests three browser permissions» → одно.
- `store-assets/listing.md` §5 — вне git, правится локально: удалить блоки `scripting` и `activeTab`.

### 2.3 Мёртвая ссылка
`PRIVACY.md:91`: `.../commits/main/store-assets/privacy-policy.md` → `.../commits/main/PRIVACY.md`. `store-assets/privacy-policy.md` — локальная копия, синхронизировать `cp PRIVACY.md store-assets/privacy-policy.md`.

## Фаза 3 — тема: auto / light / dark

Решение: единственный источник истины — атрибут `data-wr-theme` на `<html>`, который ставит `content.js`. CSS ключуется только на него; селектор `html.skin-theme-clientpref-night` из `styles.css:44` удаляется, иначе принудительный light не сработает на «ночной» странице.

### 3.1 `content.js`
- Ключ `wr-theme`, значения `"auto" | "light" | "dark"`, default `"auto"`.
- Функция `resolveTheme(pref)`:
  ```js
  function resolveTheme(pref) {
    if (pref === "light" || pref === "dark") return pref;
    const html = document.documentElement;
    if (html.classList.contains("skin-theme-clientpref-night")) return "dark";
    if (html.classList.contains("skin-theme-clientpref-day")) return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  ```
  `clientpref-os` и отсутствие класса → системная настройка.
- `applyTheme(pref)`: `document.documentElement.dataset.wrTheme = resolveTheme(pref)`.
- Состояние: `let themePref = "auto"` рядом с `isEnabled`. Синхронно при старте: `applyTheme("auto")` до `storage.get` (убирает вспышку светлой темы на ночной странице), затем `themePref = result["wr-theme"] || "auto"` и повторный `applyTheme(themePref)`.
- `activate()` вызывает `applyTheme(themePref)` и регистрирует `matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => applyTheme(themePref), { signal: scrollController.signal })` — так тема восстанавливается после цикла disable → enable, а listener снимается тем же `abort()`, что и остальные. `onChanged["wr-theme"]` → `themePref = newValue; applyTheme(themePref)`. В `deactivate()` — `delete document.documentElement.dataset.wrTheme`.

### 3.2 `styles.css`
Строка 44: `html.skin-theme-clientpref-night,` удалить; блок остаётся под `html[data-wr-theme="dark"]`.

### 3.3 `popup.html` / `popup.js`
Новая `settings-group` «Theme» с тремя кнопками `data-theme="auto|light|dark"` (класс `theme-btn`, `aria-pressed`), стили — те же, что у `.width-control`. `popup.js`: `KEYS.theme = "wr-theme"`, `DEFAULTS.theme = "auto"`, загрузка/клик по образцу `.width-btn`.

### 3.4 Документы
- `PRIVACY.md` таблица ключей: добавить `wr-theme` — `auto` / `light` / `dark`; «three user preferences» → four (в «Short version» и §«Data we store locally»).
- README: «Dark mode — respects Wikipedia's own dark mode toggle» → «Theme — auto (follows Wikipedia / system), light, dark; switch in popup».
- `store-assets/privacy-policy.md` ← повторный `cp PRIVACY.md` в этом же коммите (копия из фазы 2 устареет с появлением ключа).
- Тест: `tests/theme.spec.mjs` — после `page.emulateMedia({ colorScheme: 'dark' })` и загрузки статьи `html` имеет `data-wr-theme="dark"`; после `chrome.storage.sync.set({'wr-theme':'light'})` через `context.serviceWorkers()`/popup-страницу — `"light"`. Если запись в storage из теста окажется неудобной без service worker, ограничиться проверкой auto-режима и записать это в отчёт.

## Фаза 4 — шрифты в пакете

- Скачать релизы: Inter (github.com/rsms/inter, OFL) и JetBrains Mono (github.com/JetBrains/JetBrainsMono, OFL). Из архивов взять variable-woff2 (у Inter — `InterVariable.woff2`, у JetBrains Mono — `JetBrainsMono[wght].woff2`; точные имена берутся из листинга архива при выполнении, в план не переносятся). Italic для Inter — тоже variable-файл. Положить в `fonts/`, рядом `fonts/LICENSE-Inter.txt`, `fonts/LICENSE-JetBrainsMono.txt`.
- `styles.css`, в начало:
  ```css
  @font-face {
    font-family: "Inter";
    font-style: normal;
    font-weight: 100 900;
    font-display: swap;
    src: url("chrome-extension://__MSG_@@extension_id__/fonts/InterVariable.woff2") format("woff2");
  }
  ```
  аналогично italic и `"JetBrains Mono"` (`font-weight: 100 800`).
- `manifest.json`: `"web_accessible_resources": [{ "resources": ["fonts/*.woff2"], "matches": ["*://*.wikipedia.org/*"] }]` (F5).
- Тест: в `toc.spec.mjs` добавить проверку `document.fonts.check('18px "Inter"')` → `true` после загрузки страницы.
- Размер пакета вырастет ориентировочно на несколько сотен КБ; зафиксировать реальный размер zip в отчёте.

## Фаза 5 — TOC-панель на узких экранах, горячие клавиши, заголовок TOC, релиз

### 5.1 Выдвижная TOC ниже 1100px
- `styles.css` `@media (max-width: 1100px)`: вместо `display: none` — `transform: translateX(-100%); transition: transform 0.2s ease; box-shadow: 4px 0 16px rgba(0,0,0,.15)`; `body.wr-toc-open .wr-toc { transform: none; }`.
- Кнопка `#wr-btn-toc` в `.wr-topbar-right` (иконка списка, текст из `getTocTitle()`), `display: none` выше 1100px. Клик → `toggleToc()`. Клик по ссылке TOC при открытой панели — закрывает. `Escape` — закрывает.
- Кнопку рисовать всегда, чтобы не зависеть от ширины при построении; видимость решает CSS.
- `toggleToc()` — одна функция для кнопки, `Escape` и команды 5.2. Ниже 1100px она переключает `body.wr-toc-open`; выше — `body.wr-toc-hidden`. Ширину берёт из `window.matchMedia("(max-width: 1100px)").matches`.
- CSS для широкого экрана, владелец — `styles.css` рядом с блоком `.wr-toc`:
  ```css
  body.wr-toc-hidden .wr-toc { display: none; }
  body.wr-toc-hidden .mw-body { margin-left: auto !important; margin-right: auto !important; }
  ```
  Второе правило перебивает `margin: 0 auto 0 calc(var(--wr-toc-width) + 60px)` из `styles.css:124` и `margin-left` из `@media (min-width: 1400px)` (`styles.css:653`) — оба с `!important`, поэтому правило должно стоять в файле после них.
- `getTocTitle()` — общий helper (см. 5.3), вызывается и из `buildTopbar()`, и из `buildTOC()`; сейчас `tocTitle` локален для `buildTOC`, а `buildTopbar()` вызывается раньше.

### 5.2 Горячие клавиши (F7)
- `manifest.json`:
  ```json
  "background": { "service_worker": "background.js" },
  "commands": {
    "toggle-enabled": { "suggested_key": { "default": "Alt+Shift+W" }, "description": "Toggle Wiki Refined" },
    "toggle-toc":     { "suggested_key": { "default": "Alt+Shift+C" }, "description": "Show / hide table of contents" }
  }
  ```
- `background.js`: `onCommand` → `toggle-enabled`: прочитать `wr-enabled`, записать инверсию; `toggle-toc`: `chrome.tabs.query({active:true,currentWindow:true})` + `chrome.tabs.sendMessage(tabId, {type:"wr-toggle-toc"})`. `tabs.sendMessage` не требует permission `tabs`.
- `content.js`: `chrome.runtime.onMessage` → при `wr-toggle-toc` вызвать `toggleToc()` из 5.1.
- README: раздел «Keyboard shortcuts» — обе комбинации и ссылка на `chrome://extensions/shortcuts`.
- `PRIVACY.md`, в том же коммите: permissions не меняются (`commands` — не permission), но `PRIVACY.md:78` обещает «no code to … access your … tabs», а `background.js` вызывает `chrome.tabs.query` и `chrome.tabs.sendMessage`. Правка: в §«What we do not do» пункт про tabs переформулировать как «Read your browsing history, bookmarks, the URLs or contents of your tabs, or downloads»; в §«Permissions» добавить абзац: «Keyboard shortcuts (`commands`) are handled by a small background script that forwards the command to the Wikipedia tab you are looking at. It uses `chrome.tabs.sendMessage` on the active tab only; the `tabs` permission is not requested, so the script cannot see tab URLs or titles.»
- `store-assets/privacy-policy.md` ← `cp PRIVACY.md` в этом же коммите.

### 5.3 Заголовок TOC с самой страницы
Helper на уровне IIFE, словарь `tocTitles` переезжает из `buildTOC` в него:
```js
function getTocTitle() {
  const native = document.querySelector("#vector-toc .vector-pinnable-header-label")?.textContent.trim();
  if (native) return native;
  const lang = document.documentElement.lang || "en";
  return tocTitles[lang] || tocTitles.en;
}
```
`buildTOC` использует `getTocTitle()`. В тесте фазы 1 — assert, что `.wr-toc-title` непустой.

### 5.4 Релиз 1.1.0
- `manifest.json` `version: "1.1.0"`, `popup.html` `<p>v1.1.0</p>`.
- `CHANGELOG.md` — новый файл, секция 1.1.0 по фазам.
- README «Files»: добавить `background.js`, `fonts/`, `tests/`, `CHANGELOG.md`; убрать «Keyboard shortcuts — None yet».
- Сборка: `zip -rX dist/wiki-refined-1.1.0.zip manifest.json background.js content.js popup.html popup.js styles.css icons fonts -x "*.DS_Store"`; обновить allow-строку в `.claude/settings.local.json`. `unzip -l` — проверить, что `fonts/*.woff2` и `background.js` внутри.
- `store-assets/listing.md` (локально, вне git) — все места, где перечислены настройки или permissions: §1 версия; §3 и §3a «Dark mode» → тема auto/light/dark, добавить строку про горячие клавиши, «Privacy» — «font size, content width, theme, enabled/disabled flag»; §4 single-purpose без изменений; §5 — только `storage` и host permissions (блоки `scripting`/`activeTab` удалены в фазе 2), добавить абзац про `commands`; §9 чеклист — «permission justifications (one field)», zip `wiki-refined-1.1.0.zip`.
- Прогон `npm test` на финальном состоянии; в отчёт — вывод и размер zip.

## Вне скоупа
Firefox-совместимость, поповеры сносок, sepia-тема, изменение типографики (обоснована в `claudedocs/readability-research.md`).

## Adversarial Review (codex / gpt-5.6-sol)
- Итераций: 1, финальный вердикт: APPROVED
- Сессии Codex: `01a06bc8-506b-7bf3-9375-64b3aa24fa80` — `codex resume <id>` продолжает ревью
- Прогресс по итерациям: итерация 1 — 6 находок (4 MAJOR, 2 MINOR), 0 BLOCKER
- Принято:
  - #1 MAJOR — тема терялась после disable → enable: `themePref` в состоянии, `applyTheme` и `matchMedia`-listener в `activate()` (3.1).
  - #2 MAJOR → понижено до MINOR — рассинхрон `store-assets/`: файлы вне git и не влияют на shipped-код, но идут в форму CWS; добавлены `cp` после фазы 3 и 5.2 и явный список мест в `listing.md` (5.4).
  - #3 MAJOR — `wr-toc-hidden` без CSS: добавлены правила и требование к порядку в файле из-за `!important` (5.1).
  - #4 MAJOR — `background.js` использует Tabs API, а `PRIVACY.md:78` обещает обратное: правка формулировки и абзац про `commands` в том же коммите (5.2).
  - #5 MINOR — `wr=off` проверен и на `/w/index.php?title=…&oldid=…`: 200 без редиректа (F3).
  - #6 MINOR — `tocTitle` был локален для `buildTOC`: общий `getTocTitle()` (5.3).
- Отклонено: нет.
- Принятый остаточный риск: тест фазы 1 зависит от сети и от текущей разметки Wikipedia; при её смене тест падает — это его назначение, но CI без сети его не выполнит.
