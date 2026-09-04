# Wiki Refined v1.1 — задачи

Чекбокс = состояние. Ссылки на разделы `plan.md`.

## Фаза 1 — TOC + smoke-тест
- [x] 1.1 `content.js` `buildTOC`: фильтр через `closest`, исключения первыми, `table` добавлен, мёртвые переменные убраны
- [x] 1.2 `package.json`, `playwright.config.mjs`, `tests/fixtures.mjs`, `tests/toc.spec.mjs`, `.gitignore`
- [x] 1.3 Доказательство: тест падает на старом `content.js`, проходит на новом (вывод обоих прогонов в отчёте)
- [x] Коммит фазы 1

## Фаза 2 — Original, permissions, PRIVACY
- [x] 2.1 `?wr=off` guard в `content.js`, кнопка Original ставит параметр, README «Known limitations»
- [x] 2.2 `manifest.json` permissions → `["storage"]`; `popup.js` без `injectCSS`; PRIVACY.md §Permissions; `store-assets/listing.md` §5 (локально)
- [x] 2.3 PRIVACY.md:91 ссылка → `PRIVACY.md`; копия в `store-assets/privacy-policy.md`
- [x] Проверка (автоматизирована вместо ручной): `tests/settings.spec.mjs` — popup меняет шрифт в двух вкладках без `scripting`, `?wr=off` оставляет страницу нетронутой
- [x] Коммит фазы 2

## Фаза 3 — тема
- [x] 3.1 `content.js`: `themePref`, `resolveTheme`, `applyTheme`, синхронный вызов при старте, `applyTheme` + `matchMedia` listener в `activate()`, `onChanged`, очистка в `deactivate`
- [x] 3.2 `styles.css:44`: убрать `html.skin-theme-clientpref-night`
- [x] 3.3 popup: группа Theme, `KEYS.theme`, `DEFAULTS.theme`
- [x] 3.4 PRIVACY.md таблица ключей + счётчик «four»; README; `tests/theme.spec.mjs`; `cp PRIVACY.md store-assets/privacy-policy.md`
- [x] Коммит фазы 3

## Фаза 4 — шрифты
- [ ] Скачаны variable-woff2 Inter (roman + italic) и JetBrains Mono, лицензии в `fonts/`
- [ ] `@font-face` в `styles.css`, `web_accessible_resources` в manifest
- [ ] Assert `document.fonts.check` в `toc.spec.mjs`
- [ ] Коммит фазы 4 (размер zip — в сообщении коммита)

## Фаза 5 — панель TOC, клавиши, заголовок, релиз
- [ ] 5.1 `toggleToc()`, выдвижная TOC ниже 1100px, `body.wr-toc-hidden` + CSS для широкого экрана, кнопка `#wr-btn-toc`, Escape
- [ ] 5.2 `background.js`, `commands` в manifest, `onMessage` в `content.js`, README, PRIVACY.md (tabs-формулировка + абзац про commands), `cp` в `store-assets/`
- [ ] 5.3 `getTocTitle()` из `#vector-toc .vector-pinnable-header-label`, assert в тесте
- [ ] 5.4 Версия 1.1.0, CHANGELOG.md, README «Files», zip-команда в `.claude/settings.local.json`, `unzip -l`, `store-assets/listing.md` по списку мест из плана
- [ ] Финальный `npm test` — вывод в отчёте
- [ ] Коммит фазы 5
