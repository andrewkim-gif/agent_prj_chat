import { Page, Locator, expect } from '@playwright/test';

/**
 * Test helper utilities for ARA Chat E2E testing
 * Provides common utilities and patterns for test automation
 */

export class TestHelpers {
  constructor(private page: Page) {}

  /**
   * Wait for element to be visible and stable
   */
  async waitForElement(selector: string, timeout = 10000): Promise<Locator> {
    const element = this.page.locator(selector);
    await element.waitFor({ state: 'visible', timeout });
    return element;
  }

  /**
   * Wait for page to be fully loaded
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForFunction(() => document.readyState === 'complete');
  }

  /**
   * Handle toast messages
   */
  async verifyToastMessage(expectedMessage: string): Promise<void> {
    const toast = await this.waitForElement('[data-testid="toast"]');
    await expect(toast).toContainText(expectedMessage);
  }

  /**
   * Take screenshot with timestamp
   */
  async takeScreenshot(name: string): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await this.page.screenshot({
      path: `test-results/screenshots/${name}-${timestamp}.png`,
      fullPage: true,
    });
  }

  /**
   * Wait for API response
   */
  async waitForApiResponse(urlPattern: string | RegExp, timeout = 10000): Promise<void> {
    await this.page.waitForResponse(
      response => {
        const url = response.url();
        if (typeof urlPattern === 'string') {
          return url.includes(urlPattern);
        }
        return urlPattern.test(url);
      },
      { timeout }
    );
  }

  /**
   * Fill form field with validation
   */
  async fillField(selector: string, value: string): Promise<void> {
    const field = await this.waitForElement(selector);
    await field.clear();
    await field.fill(value);

    // Verify the value was set correctly
    const actualValue = await field.inputValue();
    expect(actualValue).toBe(value);
  }

  /**
   * Click element with retry logic
   */
  async clickElement(selector: string, options: { retries?: number } = {}): Promise<void> {
    const { retries = 3 } = options;
    let lastError: Error | null = null;

    for (let i = 0; i < retries; i++) {
      try {
        const element = await this.waitForElement(selector);
        await element.click();
        return;
      } catch (error) {
        lastError = error as Error;
        if (i < retries - 1) {
          await this.page.waitForTimeout(1000);
        }
      }
    }

    throw lastError;
  }

  /**
   * Verify element contains text
   */
  async verifyElementText(selector: string, expectedText: string): Promise<void> {
    const element = await this.waitForElement(selector);
    await expect(element).toContainText(expectedText);
  }

  /**
   * Verify element is visible
   */
  async verifyElementVisible(selector: string): Promise<void> {
    const element = await this.waitForElement(selector);
    await expect(element).toBeVisible();
  }

  /**
   * Wait for element to disappear
   */
  async waitForElementToDisappear(selector: string, timeout = 10000): Promise<void> {
    await this.page.locator(selector).waitFor({ state: 'hidden', timeout });
  }

  /**
   * Verify URL matches pattern
   */
  async verifyUrl(pattern: string | RegExp): Promise<void> {
    const currentUrl = this.page.url();
    if (typeof pattern === 'string') {
      expect(currentUrl).toContain(pattern);
    } else {
      expect(currentUrl).toMatch(pattern);
    }
  }
}