// Smoke test: the extension builds its TOC on live Wikipedia markup.
// Oracle: Wikipedia's own #vector-toc lists every section plus a "(Top)" entry,
// so the extension's TOC must have exactly one link fewer.
// Network-dependent by design — its job is to catch Wikipedia markup changes.

import { test, expect } from './fixtures.mjs';

const ARTICLES = [
  'https://en.wikipedia.org/wiki/Typography',
  'https://ru.wikipedia.org/wiki/Типографика',
  'https://uk.wikipedia.org/wiki/Типографіка',
];

for (const url of ARTICLES) {
  test(`builds TOC on ${new URL(url).hostname}`, async ({ page }) => {
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    await expect(page.locator('.wr-topbar')).toHaveCount(1);
    await expect(page.locator('.wr-progress')).toHaveCount(1);
    await expect(page.locator('.wr-toc')).toBeVisible();
    await expect(page.locator('.wr-toc-title')).not.toBeEmpty();

    const nativeCount = await page.locator('#vector-toc .vector-toc-list-item').count();
    const ourLinks = page.locator('.wr-toc a[data-wr-target]');
    expect(nativeCount).toBeGreaterThan(3);
    await expect(ourLinks).toHaveCount(nativeCount - 1);

    // Every TOC link must point at an existing element id.
    const missing = await page.evaluate(() =>
      Array.from(document.querySelectorAll('.wr-toc a[data-wr-target]'))
        .map((a) => a.getAttribute('data-wr-target'))
        .filter((id) => !document.getElementById(id)),
    );
    expect(missing).toEqual([]);
  });
}
