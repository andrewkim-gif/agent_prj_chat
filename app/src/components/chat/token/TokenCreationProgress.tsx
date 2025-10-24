"use client"

import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { TokenDeploymentResult } from '@/types/tokenCreation';

interface TokenCreationProgressProps {
  isDeploying: boolean;
  deploymentResult?: TokenDeploymentResult;
  deploymentStep: 'preparing' | 'signing' | 'deploying' | 'confirming';
  onClose: () => void;
  onViewToken?: (tokenAddress: string) => void;
  className?: string;
}

const deploymentSteps = [
  {
    id: 'preparing',
    title: '배포 준비 중',
    description: '토큰 계약을 준비하고 있습니다'
  },
  {
    id: 'signing',
    title: '트랜잭션 서명',
    description: '지갑에서 트랜잭션을 서명해주세요'
  },
  {
    id: 'deploying',
    title: '배포 진행 중',
    description: 'Cross Network에 토큰을 배포하고 있습니다'
  },
  {
    id: 'confirming',
    title: '트랜잭션 확인',
    description: '블록체인에서 트랜잭션을 확인하고 있습니다'
  }
];

export function TokenCreationProgress({
  isDeploying,
  deploymentResult,
  deploymentStep,
  onClose,
  onViewToken,
  className = ''
}: TokenCreationProgressProps) {
  // Calculate current step index and status from real deployment state
  const { currentStepIndex, stepsWithStatus } = useMemo(() => {
    const stepOrder = ['preparing', 'signing', 'deploying', 'confirming'];
    const currentIndex = stepOrder.indexOf(deploymentStep);

    const steps = deploymentSteps.map((step, index) => {
      let status: 'pending' | 'active' | 'completed' | 'error' = 'pending';

      if (deploymentResult) {
        if (deploymentResult.success) {
          // All steps completed successfully
          status = 'completed';
        } else {
          // Error occurred
          if (index <= currentIndex) {
            status = index === currentIndex ? 'error' : 'completed';
          } else {
            status = 'pending';
          }
        }
      } else if (isDeploying) {
        // Deployment in progress
        if (index < currentIndex) {
          status = 'completed';
        } else if (index === currentIndex) {
          status = 'active';
        } else {
          status = 'pending';
        }
      }

      return { ...step, status };
    });

    return { currentStepIndex: currentIndex, stepsWithStatus: steps };
  }, [deploymentStep, deploymentResult, isDeploying]);

  const isComplete = deploymentResult && deploymentResult.success;
  const hasError = deploymentResult && !deploymentResult.success;

  if (isComplete) {
    return (
      <div className={cn("bg-card border border-border rounded-xl p-6 max-w-2xl mx-auto", className)}>
        {/* Success Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="check" size={32} className="text-green-500" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            토큰 생성 완료!
          </h3>
          <p className="text-muted-foreground">
            새로운 토큰이 성공적으로 Cross Network에 배포되었습니다
          </p>
        </div>

        {/* Token Details */}
        <div className="space-y-4 mb-6">
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">토큰 주소</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-foreground">
                    {deploymentResult.tokenAddress}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => {
                      if (deploymentResult.tokenAddress) {
                        navigator.clipboard.writeText(deploymentResult.tokenAddress);
                      }
                    }}
                  >
                    <Icon name="copy" size={12} />
                  </Button>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">트랜잭션 해시</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-foreground">
                    {deploymentResult.transactionHash?.slice(0, 10)}...
                    {deploymentResult.transactionHash?.slice(-6)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => {
                      if (deploymentResult.transactionHash) {
                        navigator.clipboard.writeText(deploymentResult.transactionHash);
                      }
                    }}
                  >
                    <Icon name="copy" size={12} />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {deploymentResult.explorerUrl && (
              <Button
                variant="outline"
                onClick={() => window.open(deploymentResult.explorerUrl, '_blank')}
                className="flex-1"
              >
                <Icon name="external-link" size={16} className="mr-2" />
                익스플로러에서 보기
              </Button>
            )}

            {onViewToken && deploymentResult.tokenAddress && (
              <Button
                onClick={() => onViewToken(deploymentResult.tokenAddress!)}
                className="flex-1"
              >
                <Icon name="eye" size={16} className="mr-2" />
                토큰 상세보기
              </Button>
            )}
          </div>
        </div>

        {/* Close Button */}
        <Button variant="outline" onClick={onClose} className="w-full">
          닫기
        </Button>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className={cn("bg-card border border-border rounded-xl p-6 max-w-2xl mx-auto", className)}>
        {/* Error Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="x" size={32} className="text-red-500" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            토큰 생성 실패
          </h3>
          <p className="text-muted-foreground">
            토큰 배포 중 오류가 발생했습니다
          </p>
        </div>

        {/* Error Details */}
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Icon name="alert-triangle" size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-500 mb-1">오류 내용</p>
              <p className="text-sm text-red-600">
                {deploymentResult.error || '알 수 없는 오류가 발생했습니다'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            닫기
          </Button>
          <Button onClick={() => window.location.reload()} className="flex-1">
            <Icon name="refresh" size={16} className="mr-2" />
            다시 시도
          </Button>
        </div>
      </div>
    );
  }

  // Deployment in progress
  return (
    <div className={cn("bg-card border border-border rounded-xl p-6 max-w-2xl mx-auto", className)}>
      {/* Progress Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="spinner" size={32} className="text-primary animate-spin" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          토큰 생성 중...
        </h3>
        <p className="text-muted-foreground">
          잠시만 기다려주세요. 토큰을 Cross Network에 배포하고 있습니다
        </p>
      </div>

      {/* Progress Steps */}
      <div className="space-y-4 mb-6">
        {stepsWithStatus.map((step, index) => {
          const isActive = step.status === 'active';
          const isCompleted = step.status === 'completed';
          const hasError = step.status === 'error';

          return (
            <div
              key={step.id}
              className={cn(
                "flex items-center gap-4 p-3 rounded-lg transition-all duration-300",
                isActive && "bg-primary/5 border border-primary/20",
                isCompleted && "bg-muted/50"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                isCompleted && "bg-green-500 text-white",
                hasError && "bg-red-500 text-white",
                isActive && "bg-primary text-primary-foreground",
                !isActive && !isCompleted && !hasError && "bg-muted text-muted-foreground"
              )}>
                {isCompleted ? (
                  <Icon name="check" size={16} />
                ) : hasError ? (
                  <Icon name="x" size={16} />
                ) : isActive ? (
                  <Icon name="spinner" size={16} className="animate-spin" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>

              <div className="flex-1">
                <h4 className={cn(
                  "text-sm font-medium",
                  isActive && "text-primary",
                  isCompleted && "text-foreground",
                  hasError && "text-red-500",
                  !isActive && !isCompleted && !hasError && "text-muted-foreground"
                )}>
                  {step.title}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Current Step Indicator */}
      <div className="flex justify-center mb-6">
        <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full">
          <Icon name="spinner" size={14} className="text-primary animate-spin" />
          <span className="text-sm text-primary font-medium">
            {deploymentSteps[currentStepIndex]?.title || '진행 중...'}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="bg-muted/50 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Icon name="info" size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-muted-foreground">
            <p className="font-medium mb-1">배포 진행 중</p>
            <p>
              지갑에서 트랜잭션 서명 요청이 나타나면 승인해주세요.
              배포 과정은 네트워크 상황에 따라 1-2분이 소요될 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}