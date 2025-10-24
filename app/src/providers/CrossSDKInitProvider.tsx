"use client"

import React, { createContext, useContext, useEffect, useState } from 'react';
import { initCrossSdk } from '@to-nexus/sdk/react';
import { getNetworkConfig, DEFAULT_NETWORK } from '@/config/networks';

interface CrossSDKContextValue {
  isInitialized: boolean;
  error: string | null;
}

const CrossSDKContext = createContext<CrossSDKContextValue | null>(null);

interface CrossSDKInitProviderProps {
  children: React.ReactNode;
}

export function CrossSDKInitProvider({ children }: CrossSDKInitProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeCrossSDK = async () => {
      try {
        console.log('🚀 Initializing Cross SDK...');

        // Get environment variables
        const projectId = process.env.NEXT_PUBLIC_CROSS_PROJECT_ID;
        const redirectUrl = process.env.NEXT_PUBLIC_CROSS_REDIRECT_URL || 'http://localhost:3001';

        if (!projectId) {
          throw new Error('Cross SDK project ID not found in environment variables');
        }

        // SDK metadata
        const metadata = {
          name: 'ARA Chat',
          description: 'ARA Chat - Cross Network Integration',
          url: redirectUrl,
          icons: ['https://crosstoken.io/favicon.ico']
        };

        // Use default network (mainnet) for initial SDK setup
        const defaultNetworkConfig = getNetworkConfig(DEFAULT_NETWORK);
        const defaultCrossNetwork = defaultNetworkConfig?.crossSdkNetwork;

        if (!defaultCrossNetwork) {
          throw new Error('Default Cross SDK network configuration not found');
        }

        console.log('Cross SDK initialization:', {
          projectId,
          redirectUrl,
          defaultNetwork: DEFAULT_NETWORK,
          chainId: defaultCrossNetwork.chainId || defaultCrossNetwork.id
        });

        // Initialize Cross SDK once with default network
        await initCrossSdk(
          projectId,
          redirectUrl,
          metadata,
          'dark',
          defaultCrossNetwork
        );

        // Wait for initialization to complete
        await new Promise(resolve => setTimeout(resolve, 1500));

        console.log('✅ Cross SDK initialized successfully');

        // Mark SDK as ready globally
        if (typeof window !== 'undefined') {
          (window as any).crossSdkReady = true;
          (window as any).crossSdkNetwork = DEFAULT_NETWORK;
        }

        setIsInitialized(true);
        setError(null);

      } catch (err) {
        console.error('❌ Cross SDK initialization failed:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize Cross SDK');
        setIsInitialized(false);
      }
    };

    initializeCrossSDK();
  }, []);

  const contextValue: CrossSDKContextValue = {
    isInitialized,
    error
  };

  // Show loading screen until SDK is initialized
  if (!isInitialized && !error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Initializing Cross SDK...</p>
        </div>
      </div>
    );
  }

  // Show error screen if initialization failed
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-muted-foreground">Cross SDK initialization failed</p>
          <p className="text-sm text-red-500 mt-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <CrossSDKContext.Provider value={contextValue}>
      {children}
    </CrossSDKContext.Provider>
  );
}

export function useCrossSDK() {
  const context = useContext(CrossSDKContext);
  if (!context) {
    throw new Error('useCrossSDK must be used within a CrossSDKInitProvider');
  }
  return context;
}