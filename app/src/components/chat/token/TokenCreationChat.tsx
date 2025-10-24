"use client"

import { useState, useEffect } from 'react';
import { TokenCreationForm } from './TokenCreationForm';
import { TokenCreationProgress } from './TokenCreationProgress';
import { useTokenCreation } from '@/hooks/useTokenCreation';
import { TokenCreationParams } from '@/types/tokenCreation';
import { cn } from '@/lib/utils';

interface TokenCreationChatProps {
  onClose: () => void;
  onTokenCreated?: (tokenAddress: string) => void;
  className?: string;
}

export function TokenCreationChat({
  onClose,
  onTokenCreated,
  className = ''
}: TokenCreationChatProps) {
  const [showForm, setShowForm] = useState(true);

  const {
    isDeploying,
    deploymentResult,
    currentStep,
    deploymentStep,
    walletAddress,
    deployToken,
    resetFlow,
    openTokenInExplorer,
    isConnected,
    canDeploy
  } = useTokenCreation({
    onSuccess: (result) => {
      if (result.tokenAddress) {
        onTokenCreated?.(result.tokenAddress);
      }
    },
    onError: (error) => {
      console.error('Token creation error:', error);
    }
  });

  const handleFormSubmit = async (params: TokenCreationParams) => {
    setShowForm(false);
    await deployToken(params);
  };

  const handleClose = () => {
    if (currentStep === 'form' || currentStep === 'complete') {
      onClose();
    } else {
      // Don't allow closing during deployment
      return;
    }
  };

  const handleReset = () => {
    resetFlow();
    setShowForm(true);
  };

  // Check wallet connection
  if (!isConnected || !walletAddress) {
    return (
      <div className={cn("bg-card border border-border rounded-xl p-6 max-w-2xl mx-auto", className)}>
        <div className="text-center">
          <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-orange-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            지갑 연결 필요
          </h3>
          <p className="text-muted-foreground mb-4">
            토큰을 생성하려면 먼저 Cross Wallet을 연결해주세요
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            확인
          </button>
        </div>
      </div>
    );
  }

  // Show form
  if (showForm && currentStep === 'form') {
    return (
      <TokenCreationForm
        onSubmit={handleFormSubmit}
        onCancel={onClose}
        walletAddress={walletAddress}
        className={className}
      />
    );
  }

  // Show progress/result
  return (
    <TokenCreationProgress
      isDeploying={isDeploying}
      deploymentResult={deploymentResult || undefined}
      deploymentStep={deploymentStep}
      onClose={deploymentResult?.success ? onClose : handleReset}
      onViewToken={openTokenInExplorer}
      className={className}
    />
  );
}