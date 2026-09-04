// Playwright fixtures that load the unpacked extension from the repo root.
// Extensions only work in a persistent context; `channel: 'chromium'` allows headless.
// Source: https://playwright.dev/docs/chrome-extensions

import { test as base, chromium } from 'playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const EXT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const test = base.extend({
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
