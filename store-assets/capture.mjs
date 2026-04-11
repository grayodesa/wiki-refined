// Playwright capture script for Chrome Web Store screenshots.
// Runs headed Chromium with the unpacked extension loaded,
// renders three Wikipedia articles at exactly 1280×800, and writes PNGs.
//
// Usage:
//   npx playwright install chromium    # first run only
//   node store-assets/capture.mjs
//
// Output: store-assets/screenshots/01..03-*.png (1280×800 exact)
// Shot 04 (popup composite) is produced separately via ImageMagick.

import { chromium } from 'playwright';
import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EXT_ROOT = path.resolve(__dirname, '..');
const OUT_DIR  = path.join(EXT_ROOT, 'store-assets', 'screenshots');

fs.mkdirSync(OUT_DIR, { recursive: true });
const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'wr-pw-'));

const SHOTS = [
  {
    file: '01-hero-reading.png',
    url:  'https://en.wikipedia.org/wiki/Typography',
    scrollY: 0,
  },
  {
    file: '02-toc-rich-article.png',
    url:  'https://en.wikipedia.org/wiki/Photosynthesis',
    scrollY: 0,
  },
  {
    file: '03-reading-view.png',
    url:  'https://en.wikipedia.org/wiki/Iceberg',
    scrollY: 400,
  },
];

console.log(`[wr] loading extension from: ${EXT_ROOT}`);
const ctx = await chromium.launchPersistentContext(userDataDir, {
  headless: false,
  args: [
    `--disable-extensions-except=${EXT_ROOT}`,
    `--load-extension=${EXT_ROOT}`,
    '--no-first-run',
    '--no-default-browser-check',
  ],
  viewport: { width: 1280, height: 800 },
  deviceScaleFactor: 2,
});

for (const shot of SHOTS) {
  console.log(`[wr] → ${shot.file}  (${shot.url})`);
  const page = await ctx.newPage();
  await page.goto(shot.url, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(2500);
  if (shot.scrollY) {
    await page.evaluate((y) => window.scrollTo(0, y), shot.scrollY);
    await page.waitForTimeout(600);
  }
  const outPath = path.join(OUT_DIR, shot.file);
  await page.screenshot({
    path: outPath,
    clip: { x: 0, y: 0, width: 1280, height: 800 },
  });
  await page.close();
  console.log(`[wr]   wrote ${outPath}`);
}

await ctx.close();
fs.rmSync(userDataDir, { recursive: true, force: true });
console.log('[wr] done. run: file store-assets/screenshots/*.png');
