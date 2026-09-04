import { defineConfig } from 'playwright/test';

export default defineConfig({
  testDir: 'tests',
  timeout: 60_000,
  workers: 1,
  reporter: 'list',
  use: {
    viewport: { width: 1280, height: 800 },
  },
});
