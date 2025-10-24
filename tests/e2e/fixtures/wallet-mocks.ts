import { Page } from '@playwright/test';

/**
 * Wallet mocking utilities for E2E tests
 * Simulates various wallet states and interactions
 */

export interface WalletMockConfig {
  address?: string;
  network?: string;
  balance?: string;
  tokens?: Array<{
    symbol: string;
    balance: string;
    value: string;
  }>;
  connected?: boolean;
}

export class WalletMocks {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Mock successful wallet connection
   */
  async mockWalletConnection(config: WalletMockConfig = {}): Promise<void> {
    const defaultConfig = {
      address: '0x1234567890123456789012345678901234567890',
      network: 'ethereum',
      balance: '1.5',
      connected: true,
      ...config,
    };

    await this.page.addInitScript((mockConfig) => {
      // Mock window.ethereum object
      (window as any).ethereum = {
        isMetaMask: true,
        request: async ({ method }: { method: string }) => {
          switch (method) {
            case 'eth_requestAccounts':
              return [mockConfig.address];
            case 'eth_accounts':
              return mockConfig.connected ? [mockConfig.address] : [];
            case 'eth_chainId':
              return '0x1'; // Ethereum mainnet
            case 'wallet_requestPermissions':
              return [{ parentCapability: 'eth_accounts' }];
            default:
              return null;
          }
        },
        on: (event: string, callback: Function) => {
          // Mock event listeners
          if (event === 'accountsChanged') {
            setTimeout(() => callback([mockConfig.address]), 100);
          }
        },
        removeListener: () => {},
      };

      // Mock Cross SDK
      (window as any).CrossSDK = {
        init: async () => ({ success: true }),
        connect: async () => ({
          success: true,
          address: mockConfig.address,
          network: mockConfig.network,
        }),
        disconnect: async () => ({ success: true }),
        getBalance: async () => ({
          success: true,
          balance: mockConfig.balance,
        }),
        getTokens: async () => ({
          success: true,
          tokens: mockConfig.tokens || [],
        }),
      };
    }, defaultConfig);
  }

  /**
   * Mock wallet connection rejection
   */
  async mockWalletRejection(): Promise<void> {
    await this.page.addInitScript(() => {
      (window as any).ethereum = {
        isMetaMask: true,
        request: async ({ method }: { method: string }) => {
          if (method === 'eth_requestAccounts') {
            throw new Error('User rejected the request');
          }
          return null;
        },
        on: () => {},
        removeListener: () => {},
      };
    });
  }

  /**
   * Mock wallet not installed
   */
  async mockWalletNotInstalled(): Promise<void> {
    await this.page.addInitScript(() => {
      delete (window as any).ethereum;
    });
  }

  /**
   * Mock network switching
   */
  async mockNetworkSwitch(chainId: string, networkName: string): Promise<void> {
    await this.page.addInitScript((params) => {
      if ((window as any).ethereum) {
        (window as any).ethereum.request = async ({ method }: { method: string }) => {
          switch (method) {
            case 'wallet_switchEthereumChain':
              return null; // Success
            case 'eth_chainId':
              return params.chainId;
            default:
              return null;
          }
        };
      }
    }, { chainId, networkName });
  }

  /**
   * Mock token transaction
   */
  async mockTokenTransaction(txHash: string = '0xabcd...1234'): Promise<void> {
    await this.page.addInitScript((hash) => {
      if ((window as any).CrossSDK) {
        (window as any).CrossSDK.sendToken = async () => ({
          success: true,
          txHash: hash,
          status: 'pending',
        });
      }
    }, txHash);
  }

  /**
   * Mock transaction failure
   */
  async mockTransactionFailure(error: string = 'Insufficient funds'): Promise<void> {
    await this.page.addInitScript((errorMessage) => {
      if ((window as any).CrossSDK) {
        (window as any).CrossSDK.sendToken = async () => ({
          success: false,
          error: errorMessage,
        });
      }
    }, error);
  }

  /**
   * Mock loading states
   */
  async mockWalletLoading(duration: number = 2000): Promise<void> {
    await this.page.addInitScript((delay) => {
      if ((window as any).ethereum) {
        const originalRequest = (window as any).ethereum.request;
        (window as any).ethereum.request = async (params: any) => {
          await new Promise(resolve => setTimeout(resolve, delay));
          return originalRequest(params);
        };
      }
    }, duration);
  }
}