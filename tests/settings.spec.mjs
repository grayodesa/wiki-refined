// Settings changed in the popup must reach every open Wikipedia tab through
// chrome.storage.onChanged in content.js — without scripting/activeTab permissions.
// Also covers the "Original" opt-out: ?wr=off must leave the page untouched.

import { test, expect } from './fixtures.mjs';

const ARTICLE = 'https://en.wikipedia.org/wiki/Typography';

test('popup font-size change propagates to two open tabs', async ({ context, extensionId }) => {
  const tabA = await context.newPage();
  const tabB = await context.newPage();
  await tabA.goto(ARTICLE, { waitUntil: 'domcontentloaded' });
  await tabB.goto(ARTICLE, { waitUntil: 'domcontentloaded' });
  await expect(tabA.locator('.wr-topbar')).toHaveCount(1);
  await expect(tabB.locator('.wr-topbar')).toHaveCount(1);

  const popup = await context.newPage();
  await popup.goto(`chrome-extension://${extensionId}/popup.html`);
  await expect(popup.locator('#font-size-display')).toHaveText('18px');
  await popup.locator('#font-increase').click();
  await expect(popup.locator('#font-size-display')).toHaveText('19px');

  const readVar = (p) =>
    p.evaluate(() => document.documentElement.style.getPropertyValue('--wr-body-size'));
  await expect.poll(() => readVar(tabA)).toBe('19px');
  await expect.poll(() => readVar(tabB)).toBe('19px');

  // Restore the default so the persistent profile does not leak state into other tests.
  await popup.locator('#font-decrease').click();
  await expect.poll(() => readVar(tabA)).toBe('18px');
});

test('?wr=off leaves the page unstyled', async ({ page }) => {
  await page.goto(`${ARTICLE}?wr=off`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#mw-content-text')).toHaveCount(1);
  await expect(page.locator('body')).not.toHaveClass(/wr-active/);
  await expect(page.locator('.wr-topbar')).toHaveCount(0);
});
