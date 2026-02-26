import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright E2E Configuration
 *
 * Runs against the local Vite dev server in development.
 * In CI, set PLAYWRIGHT_BASE_URL to the deployed preview URL.
 *
 * Docs: https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',

  // Run test files in parallel
  fullyParallel: true,

  // Fail the build if test.only is left in source
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Single worker in CI to avoid flakiness; auto-detect locally
  workers: process.env.CI ? 1 : undefined,

  reporter: [['html', { outputFolder: 'playwright-report', open: 'never' }], ['line']],

  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:5173',

    // Collect trace on first retry — useful for debugging CI failures
    trace: 'on-first-retry',

    // Screenshot only on failure
    screenshot: 'only-on-failure',

    // Record video on retry (helps triage flaky tests)
    video: 'on-first-retry',
  },

  projects: [
    // ── Setup project: authenticate once and store session ─────────────────
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },

    // ── Unauthenticated tests ───────────────────────────────────────────────
    {
      name: 'chromium-public',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /.*\.public\.spec\.ts/,
    },

    // ── Authenticated tests (re-use stored session) ─────────────────────────
    {
      name: 'chromium-auth',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/e2e/.auth/user.json',
      },
      testMatch: /.*\.auth\.spec\.ts/,
      dependencies: ['setup'],
    },

    // ── Mobile smoke test ───────────────────────────────────────────────────
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
      testMatch: /.*\.public\.spec\.ts/,
    },
  ],

  // Start Vite dev server automatically when running locally
  webServer: process.env.CI
    ? undefined
    : {
        command: 'pnpm dev',
        url: 'http://localhost:5173',
        reuseExistingServer: true,
        timeout: 120_000,
      },
})
