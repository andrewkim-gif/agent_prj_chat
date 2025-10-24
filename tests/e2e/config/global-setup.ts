import { chromium, FullConfig } from '@playwright/test';

/**
 * Global setup for E2E tests
 * Runs once before all tests to prepare the environment
 */
async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting E2E test environment setup...');

  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Wait for development server to be ready
    const baseURL = config.projects[0].use.baseURL || 'http://localhost:3009';

    console.log(`📡 Checking server availability at ${baseURL}`);
    await page.goto(baseURL, { waitUntil: 'networkidle' });

    // Verify core application is loaded
    await page.waitForSelector('body', { timeout: 30000 });
    console.log('✅ Server is ready and application loaded');

    // Optional: Perform any authentication or setup tasks
    // await setupTestUser();
    // await prepareTestData();

  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await page.close();
    await browser.close();
  }

  console.log('✨ E2E test environment setup completed');
}

export default globalSetup;