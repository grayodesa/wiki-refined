// Playwright fixtures that load the unpacked extension from the repo root.
// Extensions only work in a persistent context; `channel: 'chromium'` allows headless.
// Source: https://playwright.dev/docs/chrome-extensions

import { test as base, chromium } from 'playwright/test';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const EXT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Chrome derives an unpacked extension's id from its absolute path:
// first 32 hex chars of SHA-256(path), each hex digit mapped to a–p.
// The extension has no service worker yet, so this is the only way to reach popup.html.
// Verified by the settings test itself: a wrong id makes popup.html fail to load.
function unpackedExtensionId(absPath) {
  const hex = crypto.createHash('sha256').update(absPath).digest('hex').slice(0, 32);
  return Array.from(hex, (c) => String.fromCharCode(97 + parseInt(c, 16))).join('');
}

export const test = base.extend({
  extensionId: async ({}, use) => {
    await use(unpackedExtensionId(EXT_ROOT));
  },
  context: async ({}, use) => {
    const context = await chromium.launchPersistentContext('', {
      channel: 'chromium',
      args: [
        `--disable-extensions-except=${EXT_ROOT}`,
        `--load-extension=${EXT_ROOT}`,
      ],
    });
    await use(context);
    await context.close();
  },
});

export const expect = test.expect;
