// Bundled fonts must be fetched from the extension package, not from the OS.
// Oracle: FontFace entries for "Inter" / "JetBrains Mono" exist in document.fonts
// and report status "loaded" — a face that failed to fetch reports "error",
// and a system-installed font never appears as a FontFace entry at all.

import { test, expect } from './fixtures.mjs';

const ARTICLE = 'https://en.wikipedia.org/wiki/Typography';

test('Inter and JetBrains Mono load from the extension', async ({ page }) => {
  await page.goto(ARTICLE, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('body')).toHaveClass(/wr-active/);

  const faces = await page.evaluate(async () => {
    await document.fonts.ready;
    // Force-load the faces the page actually uses.
    await Promise.all([
      document.fonts.load('400 18px "Inter"'),
      document.fonts.load('italic 400 18px "Inter"'),
      document.fonts.load('700 18px "JetBrains Mono"'),
    ]);
    return Array.from(document.fonts)
      .filter((f) => f.family === 'Inter' || f.family === 'JetBrains Mono')
      .map((f) => `${f.family} ${f.style} ${f.weight} ${f.status}`)
      .sort();
  });

  expect(faces).toContain('Inter normal 100 900 loaded');
  expect(faces).toContain('Inter italic 100 900 loaded');
  expect(faces).toContain('JetBrains Mono normal 700 loaded');
  expect(faces.filter((f) => f.endsWith('error'))).toEqual([]);
});
