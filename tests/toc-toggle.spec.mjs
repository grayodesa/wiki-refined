// TOC toggle: drawer below 1100px (button + Escape), collapse above via the
// keyboard command path (background.js → tabs.sendMessage → content.js).
// TOC title comes from Wikipedia's own localised header, not the built-in dictionary.

import { test, expect } from './fixtures.mjs';

const ARTICLE = 'https://en.wikipedia.org/wiki/Typography';

async function tocLeft(page) {
  return page.locator('.wr-toc').evaluate((el) => el.getBoundingClientRect().left);
}

test('narrow screen: drawer opens with the topbar button and closes on Escape', async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 800 });
  await page.goto(ARTICLE, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.wr-toc')).toHaveCount(1);
  await expect(page.locator('#wr-btn-toc')).toBeVisible();
  await expect.poll(() => tocLeft(page)).toBeLessThan(0); // translated off-screen

  await page.locator('#wr-btn-toc').click();
  await expect(page.locator('body')).toHaveClass(/wr-toc-open/);
  await expect(page.locator('#wr-btn-toc')).toHaveAttribute('aria-expanded', 'true');
  await expect.poll(() => tocLeft(page)).toBe(0);

  await page.keyboard.press('Escape');
  await expect(page.locator('body')).not.toHaveClass(/wr-toc-open/);
  await expect.poll(() => tocLeft(page)).toBeLessThan(0);
});

test('wide screen: keyboard command collapses the TOC and centres the article', async ({ context }) => {
  const page = await context.newPage();
  await page.goto(ARTICLE, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.wr-toc')).toBeVisible();
  await expect(page.locator('#wr-btn-toc')).toBeHidden();

  const margins = () =>
    page.locator('.mw-body').evaluate((el) => {
      const cs = getComputedStyle(el);
      return { left: parseFloat(cs.marginLeft), right: parseFloat(cs.marginRight) };
    });
  const before = await margins();
  expect(before.left).toBeGreaterThan(before.right + 100); // offset for the TOC column

  await page.bringToFront();
  let [sw] = context.serviceWorkers();
  if (!sw) sw = await context.waitForEvent('serviceworker');
  // Same code path background.js runs for the "toggle-toc" command.
  await sw.evaluate(async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    await chrome.tabs.sendMessage(tab.id, { type: 'wr-toggle-toc' });
  });

  await expect(page.locator('body')).toHaveClass(/wr-toc-hidden/);
  await expect(page.locator('.wr-toc')).toBeHidden();
  const after = await margins();
  expect(Math.abs(after.left - after.right)).toBeLessThan(1);

  // Toggle back so the persistent profile stays clean.
  await sw.evaluate(async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    await chrome.tabs.sendMessage(tab.id, { type: 'wr-toggle-toc' });
  });
  await expect(page.locator('body')).not.toHaveClass(/wr-toc-hidden/);
});

test('TOC title uses Wikipedia\'s own label for languages outside the dictionary', async ({ page }) => {
  // Polish is not in content.js tocTitles; "Spis treści" is Wikipedia's own label.
  await page.goto('https://pl.wikipedia.org/wiki/Typografia', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.wr-toc-title')).toHaveText('Spis treści');
  await expect(page.locator('#wr-btn-toc')).toHaveText(/Spis treści/);
});
