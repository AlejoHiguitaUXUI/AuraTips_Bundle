import { defineConfig, devices } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// Load .env.local if present
try {
  const envLocal = path.resolve(__dirname, '.env.local');
  if (fs.existsSync(envLocal) && typeof (process as any).loadEnvFile === 'function') {
    (process as any).loadEnvFile(envLocal);
  }
} catch {
  // Ignored
}

const PORT = process.env.PORT || '3001';
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.spec.ts',
  /* Run tests in files in serial to ensure chain dependencies */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [['list']],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: BASE_URL,

    /* Video recording: "guarda un video de cada prueba" */
    video: 'on',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects: "solo pruebalo en chrome y guarda un video de cada prueba" */
  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        video: 'on',
      },
      dependencies: ['setup'],
    },
  ],

  /* Run local dev server before starting the tests */
  webServer: {
    command: process.env.CI ? 'npm run start -- -p 3001' : 'npm run dev -- -p 3001',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});

