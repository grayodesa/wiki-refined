// Theme resolution: html[data-wr-theme] is the only hook styles.css reads.
// Precedence in "auto": Wikipedia's own class on <html> wins, then the OS preference.
// A fresh profile gets skin-theme-clientpref-day from Wikipedia (checked 2026-09-04),
// so "auto" must resolve to light even when the OS prefers dark.

import { test, expect } from './fixtures.mjs';

const ARTICLE = 'https://en.wikipedia.org/wiki/Typography';

async function setTheme(context, extensionId, theme) {
  const popup = await context.newPage();
  await popup.goto(`chrome-extension://${extensionId}/popup.html`);
  await popup.locator(`.theme-btn[data-theme="${theme}"]`).click();
  await expect(popup.locator(`.theme-btn[data-theme="${theme}"]`)).toHaveAttribute('aria-pressed', 'true');
  await popup.close();
}

test('auto follows Wikipedia day class over a dark OS', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto(ARTICLE, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('body')).toHaveClass(/wr-active/);
  await expect(page.locator('html')).toHaveClass(/skin-theme-clientpref-day/);
  await expect(page.locator('html')).toHaveAttribute('data-wr-theme', 'light');
});

test('forced dark and light override the page class', async ({ context, extensionId }) => {
  const page = await context.newPage();
  await page.goto(ARTICLE, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('html')).toHaveAttribute('data-wr-theme', 'light');

  await setTheme(context, extensionId, 'dark');
  await expect(page.locator('html')).toHaveAttribute('data-wr-theme', 'dark');
  // Dark variables must actually apply to the injected UI (poll: 0.12s colour transition).
  await expect
    .poll(() => page.locator('.wr-topbar').evaluate((el) => getComputedStyle(el).backgroundColor))
    .toBe('rgb(28, 28, 30)'); // --wr-bg-content dark = #1c1c1e

  await setTheme(context, extensionId, 'light');
  await expect(page.locator('html')).toHaveAttribute('data-wr-theme', 'light');

  await setTheme(context, extensionId, 'auto');
  await expect(page.locator('html')).toHaveAttribute('data-wr-theme', 'light');
});

test('theme survives disable → enable', async ({ context, extensionId }) => {
  const page = await context.newPage();
  await page.goto(ARTICLE, { waitUntil: 'domcontentloaded' });
  await setTheme(context, extensionId, 'dark');
  await expect(page.locator('html')).toHaveAttribute('data-wr-theme', 'dark');

  const popup = await context.newPage();
  await popup.goto(`chrome-extension://${extensionId}/popup.html`);
  // The <input> is visually collapsed (opacity 0, 0×0); the slider span is the click target.
  await popup.locator('.toggle-slider').click();
  await expect(popup.locator('#toggle-enabled')).not.toBeChecked();
  await expect(page.locator('body')).not.toHaveClass(/wr-active/);
  await expect(page.locator('html')).not.toHaveAttribute('data-wr-theme');

  await popup.locator('.toggle-slider').click();
  await expect(popup.locator('#toggle-enabled')).toBeChecked();
  await expect(page.locator('body')).toHaveClass(/wr-active/);
  await expect(page.locator('html')).toHaveAttribute('data-wr-theme', 'dark');

  await setTheme(context, extensionId, 'auto');
  await popup.close();
});
