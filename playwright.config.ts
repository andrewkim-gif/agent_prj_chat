import { defineConfig, devices } from '@playwright/test';

/**
 * ARA Chat E2E Testing Configuration
 *
 * This configuration sets up Playwright for comprehensive E2E testing
 * of the ARA Chat application with support for multiple browsers and
 * environments.
 */
export default defineConfig({
  // Test directory
  testDir: './tests/e2e/specs',

  // Global test timeout
  timeout: 30 * 1000,

  // Test execution settings
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // Reporter configuration
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ...(process.env.CI ? [['github']] : [['list']])
  ],

  // Global test configuration
  use: {
    // Base URL for all tests
    baseURL: process.env.TEST_BASE_URL || 'http://localhost:3009',

    // Browser settings
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    // Viewport settings
    viewport: { width: 1280, height: 720 },

    // Network settings
    ignoreHTTPSErrors: true,

    // Wait settings
    actionTimeout: 10 * 1000,
    navigationTimeout: 30 * 1000,
  },

  // Test environment projects
  projects: [
    // Desktop browsers
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Mobile browsers
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },

    // Tablet
    {
      name: 'tablet',
      use: { ...devices['iPad Pro'] },
    }
  ],

  // Development server configuration
  webServer: {
    command: 'npm run dev',
    port: 3009,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    env: {
      NODE_ENV: 'development'
    }
  },

  // Output directories
  outputDir: 'test-results/',

  // Global setup and teardown
  globalSetup: require.resolve('./tests/e2e/config/global-setup.ts'),
  globalTeardown: require.resolve('./tests/e2e/config/global-teardown.ts'),
});