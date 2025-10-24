"use client"

import { useState, useCallback } from 'react';
import { TokenCreationParams, TokenDeploymentResult, N8nTokenResponse } from '@/types/tokenCreation';
import { tokenCreationService } from '@/services/tokenCreationService';
import { useBlockchainWallet } from '@/hooks/useBlockchainWallet';

interface UseTokenCreationOptions {
  onSuccess?: (result: TokenDeploymentResult) => void;
  onError?: (error: string) => void;
}

export function useTokenCreation(options: UseTokenCreationOptions = {}) {
  const { onSuccess, onError } = options;
  const { wallet, walletAddress, isConnected } = useBlockchainWallet();

  const [isProcessing, setIsProcessing] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentResult, setDeploymentResult] = useState<TokenDeploymentResult | null>(null);
  const [currentStep, setCurrentStep] = useState<'form' | 'progress' | 'complete'>('form');
  const [deploymentStep, setDeploymentStep] = useState<'preparing' | 'signing' | 'deploying' | 'confirming'>('preparing');

  const processAIRequest = useCallback(async (
    userMessage: string,
    existingParams?: Partial<TokenCreationParams>
  ): Promise<N8nTokenResponse> => {
    if (!walletAddress) {
      throw new Error('지갑이 연결되어 있지 않습니다');
    }

    setIsProcessing(true);
    try {
      const response = await tokenCreationService.processTokenRequest(
        userMessage,
        walletAddress,
        existingParams
      );
      return response;
    } finally {
      setIsProcessing(false);
    }
  }, [walletAddress]);

  const deployToken = useCallback(async (params: TokenCreationParams) => {
    if (!isConnected || !wallet || !walletAddress) {
      const error = '지갑이 연결되어 있지 않습니다';
      onError?.(error);
      throw new Error(error);
    }

    setIsDeploying(true);
    setCurrentStep('progress');
    setDeploymentResult(null);
    setDeploymentStep('preparing');

    try {
      // Validate parameters
      if (!params.name || !params.symbol || !params.totalSupply) {
        throw new Error('필수 토큰 정보가 누락되었습니다');
      }

      // Ensure deployer is set to current wallet
      const deployParams: TokenCreationParams = {
        ...params,
        deployer: walletAddress,
        network: 'cross-mainnet'
      };

      // Step 1: Preparing
      setDeploymentStep('preparing');
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 2: Signing (user will sign in wallet)
      setDeploymentStep('signing');
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 3: Deploying
      setDeploymentStep('deploying');

      // Deploy token using Cross Wallet SDK
      const result = await tokenCreationService.deployToken(deployParams, wallet);

      // Step 4: Confirming (only if successful)
      if (result.success) {
        setDeploymentStep('confirming');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      setDeploymentResult(result);

      if (result.success) {
        setCurrentStep('complete');
        onSuccess?.(result);
      } else {
        onError?.(result.error || '토큰 배포에 실패했습니다');
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다';
      const errorResult: TokenDeploymentResult = {
        success: false,
        error: errorMessage
      };

      setDeploymentResult(errorResult);
      onError?.(errorMessage);

      return errorResult;
    } finally {
      setIsDeploying(false);
    }
  }, [isConnected, wallet, walletAddress, onSuccess, onError]);

  const resetFlow = useCallback(() => {
    setCurrentStep('form');
    setDeploymentResult(null);
    setIsDeploying(false);
    setIsProcessing(false);
    setDeploymentStep('preparing');
  }, []);

  const openTokenInExplorer = useCallback((tokenAddress: string) => {
    const explorerUrl = `https://scan.cross.technology/token/${tokenAddress}`;
    window.open(explorerUrl, '_blank');
  }, []);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  }, []);

  return {
    // State
    isProcessing,
    isDeploying,
    deploymentResult,
    currentStep,
    deploymentStep,
    isConnected,
    walletAddress,

    // Actions
    processAIRequest,
    deployToken,
    resetFlow,
    openTokenInExplorer,
    copyToClipboard,

    // Helpers
    canDeploy: isConnected && walletAddress && !isDeploying,
    hasError: deploymentResult && !deploymentResult.success,
    isComplete: deploymentResult && deploymentResult.success
  };
}