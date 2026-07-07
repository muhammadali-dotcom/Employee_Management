import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: 0,
  workers: 1,
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: [
    {
      name: 'Mobile Chrome 390',
      use: {
        ...devices['Pixel 5'],
        viewport: { width: 390, height: 844 },
        browserName: 'chromium',
      },
    },
    {
      name: 'Mobile Chrome 375',
      use: {
        ...devices['Pixel 5'],
        viewport: { width: 375, height: 812 },
        browserName: 'chromium',
      },
    },
    {
      name: 'Desktop Chrome 1440',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
        browserName: 'chromium',
      },
    },
  ],
});
