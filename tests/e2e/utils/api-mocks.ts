import { Page, Route } from '@playwright/test';

/**
 * API mocking utilities for E2E tests
 * Provides consistent mock responses for different test scenarios
 */

export interface MockResponse {
  status: number;
  headers?: Record<string, string>;
  body: any;
}

export class ApiMocks {
  private page: Page;
  private activeMocks: Set<string> = new Set();

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Mock chat API responses
   */
  async mockChatApi(): Promise<void> {
    await this.page.route('**/api/chat/**', async (route: Route) => {
      const url = route.request().url();

      if (url.includes('/stream')) {
        await route.fulfill({
          status: 200,
          headers: { 'Content-Type': 'text/event-stream' },
          body: this.createMockStreamResponse(),
        });
      } else {
        await route.fulfill({
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            success: true,
            message: 'Mock chat response for testing',
            timestamp: new Date().toISOString(),
          }),
        });
      }
    });

    this.activeMocks.add('chat');
  }

  /**
   * Mock wallet API responses
   */
  async mockWalletApi(): Promise<void> {
    await this.page.route('**/api/wallet/**', async (route: Route) => {
      const url = route.request().url();

      if (url.includes('/connect')) {
        await route.fulfill({
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            success: true,
            address: '0x1234567890123456789012345678901234567890',
            network: 'ethereum',
            balance: '1.5',
          }),
        });
      } else if (url.includes('/tokens')) {
        await route.fulfill({
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            success: true,
            tokens: this.getMockTokenData(),
          }),
        });
      }
    });

    this.activeMocks.add('wallet');
  }

  /**
   * Mock insights API responses
   */
  async mockInsightsApi(): Promise<void> {
    await this.page.route('**/api/insight/**', async (route: Route) => {
      const url = route.request().url();

      if (url.includes('/metrics')) {
        await route.fulfill({
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            success: true,
            metrics: this.getMockMetricsData(),
          }),
        });
      } else if (url.includes('/trends')) {
        await route.fulfill({
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            success: true,
            trends: this.getMockTrendData(),
          }),
        });
      }
    });

    this.activeMocks.add('insights');
  }

  /**
   * Mock error responses for testing error handling
   */
  async mockErrorScenarios(): Promise<void> {
    await this.page.route('**/api/**error**', async (route: Route) => {
      await route.fulfill({
        status: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          error: 'Internal server error for testing',
          code: 'TEST_ERROR',
        }),
      });
    });

    this.activeMocks.add('errors');
  }

  /**
   * Clear all active mocks
   */
  async clearAllMocks(): Promise<void> {
    await this.page.unroute('**/*');
    this.activeMocks.clear();
  }

  private createMockStreamResponse(): string {
    const messages = [
      'data: {"type":"start","content":""}',
      'data: {"type":"content","content":"안녕하세요! "}',
      'data: {"type":"content","content":"ARA입니다. "}',
      'data: {"type":"content","content":"도움이 필요하시면 언제든 말씀해주세요."}',
      'data: {"type":"end","content":""}',
      '',
    ];
    return messages.join('\n');
  }

  private getMockTokenData() {
    return [
      {
        symbol: 'ETH',
        name: 'Ethereum',
        balance: '1.5',
        value: '$3,750.00',
        change: '+2.5%',
      },
      {
        symbol: 'USDC',
        name: 'USD Coin',
        balance: '1000.0',
        value: '$1,000.00',
        change: '0.0%',
      },
    ];
  }

  private getMockMetricsData() {
    return {
      totalChats: 1542,
      activeUsers: 89,
      avgResponseTime: '2.3s',
      satisfaction: '94%',
    };
  }

  private getMockTrendData() {
    return {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
      datasets: [
        {
          label: 'Chat Volume',
          data: [120, 190, 300, 500, 200],
        },
      ],
    };
  }
}