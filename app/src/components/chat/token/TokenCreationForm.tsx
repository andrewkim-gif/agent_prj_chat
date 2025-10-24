"use client"

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { TokenCreationParams, TokenCreationStep } from '@/types/tokenCreation';
import { tokenCreationService } from '@/services/tokenCreationService';
import { NetworkStatusIndicator } from '@/components/network/NetworkStatusIndicator';
import { NetworkWarningBanner } from '@/components/network/NetworkWarningBanner';
import { useCurrentNetwork, useNetworkConfig } from '@/stores/networkStore';

interface TokenCreationFormProps {
  onSubmit: (params: TokenCreationParams) => void;
  onCancel: () => void;
  walletAddress: string;
  className?: string;
}

interface FormData {
  [key: string]: string | number;
}

export function TokenCreationForm({
  onSubmit,
  onCancel,
  walletAddress,
  className = ''
}: TokenCreationFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    decimals: 18
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Network awareness
  const currentNetwork = useCurrentNetwork();
  const networkConfig = useNetworkConfig();

  const steps = tokenCreationService.getTokenCreationSteps();

  const handleFieldChange = useCallback((fieldName: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));

    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  }, [errors]);

  const validateStep = (step: TokenCreationStep): boolean => {
    const stepErrors: Record<string, string> = {};

    step.fields.forEach(field => {
      const value = formData[field.name];

      if (field.validation?.required && (!value || String(value).trim() === '')) {
        stepErrors[field.name] = `${field.label}은(는) 필수입니다`;
      }

      if (field.type === 'number' && value) {
        const numValue = Number(value);
        if (field.validation?.min !== undefined && numValue < field.validation.min) {
          stepErrors[field.name] = `최소값은 ${field.validation.min}입니다`;
        }
        if (field.validation?.max !== undefined && numValue > field.validation.max) {
          stepErrors[field.name] = `최대값은 ${field.validation.max}입니다`;
        }
      }
    });

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    const currentStepData = steps[currentStep];
    if (validateStep(currentStepData)) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      const tokenParams: TokenCreationParams = {
        name: formData.name as string,
        symbol: formData.symbol as string,
        description: formData.description as string,
        totalSupply: formData.totalSupply as string,
        decimals: formData.decimals as number,
        logo: formData.logo as string,
        website: formData.website as string,
        network: currentNetwork as 'cross-mainnet' | 'cross-testnet',
        deployer: walletAddress
      };

      onSubmit(tokenParams);
    } catch (error) {
      console.error('Token creation form error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderField = (field: any) => {
    const value = formData[field.name] || '';
    const error = errors[field.name];

    switch (field.type) {
      case 'textarea':
        return (
          <div key={field.name} className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              {field.label}
              {field.validation?.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <Textarea
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              className={cn(error && "border-red-500")}
            />
            {field.helpText && (
              <p className="text-xs text-muted-foreground">{field.helpText}</p>
            )}
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>
        );

      case 'number':
        return (
          <div key={field.name} className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              {field.label}
              {field.validation?.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <Input
              type="number"
              value={value}
              onChange={(e) => handleFieldChange(field.name, Number(e.target.value))}
              placeholder={field.placeholder}
              className={cn(error && "border-red-500")}
            />
            {field.helpText && (
              <p className="text-xs text-muted-foreground">{field.helpText}</p>
            )}
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>
        );

      case 'file':
        return (
          <div key={field.name} className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              {field.label}
              {field.validation?.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="border border-border rounded-lg p-4 text-center">
              <Icon name="upload" size={32} className="mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-3">파일을 선택하거나 드래그해주세요</p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    // Handle file upload logic here
                    handleFieldChange(field.name, file.name);
                  }
                }}
                className="hidden"
                id={`file-${field.name}`}
              />
              <label
                htmlFor={`file-${field.name}`}
                className="inline-block cursor-pointer"
              >
                <div className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3">
                  파일 선택
                </div>
              </label>
              {value && (
                <p className="text-xs text-foreground mt-2">선택된 파일: {value}</p>
              )}
            </div>
            {field.helpText && (
              <p className="text-xs text-muted-foreground">{field.helpText}</p>
            )}
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>
        );

      default:
        return (
          <div key={field.name} className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              {field.label}
              {field.validation?.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <Input
              type={field.type}
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              className={cn(error && "border-red-500")}
            />
            {field.helpText && (
              <p className="text-xs text-muted-foreground">{field.helpText}</p>
            )}
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>
        );
    }
  };

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className={cn("bg-card border border-border rounded-xl p-6 max-w-2xl mx-auto", className)}>
      {/* Network Warning */}
      {networkConfig?.testnet && (
        <div className="mb-4">
          <NetworkWarningBanner showSwitchButton={true} />
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">토큰 생성</h3>
          <p className="text-sm text-muted-foreground">
            Cross Network에서 새로운 토큰을 생성합니다
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
          className="text-muted-foreground hover:text-foreground"
        >
          <Icon name="x" size={20} />
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-muted-foreground">
            단계 {currentStep + 1} / {steps.length}
          </span>
          <span className="text-sm text-muted-foreground">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Network Information */}
      <div className="mb-6 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h5 className="text-sm font-medium text-foreground mb-1">배포 네트워크</h5>
            <p className="text-xs text-muted-foreground">토큰이 배포될 블록체인 네트워크</p>
          </div>
          <NetworkStatusIndicator variant="compact" />
        </div>
      </div>

      {/* Step Content */}
      <div className="mb-6">
        <div className="mb-4">
          <h4 className="text-base font-medium text-foreground mb-1">
            {currentStepData.title}
          </h4>
          <p className="text-sm text-muted-foreground">
            {currentStepData.description}
          </p>
        </div>

        <div className="space-y-4">
          {currentStepData.fields.map(renderField)}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={currentStep === 0 ? onCancel : handlePrevious}
          disabled={isLoading}
        >
          <Icon name="chevron-left" size={16} className="mr-2" />
          {currentStep === 0 ? '취소' : '이전'}
        </Button>

        <div className="flex gap-2">
          {currentStep === steps.length - 1 ? (
            <Button
              onClick={handleNext}
              disabled={isLoading}
              className="min-w-24"
            >
              {isLoading ? (
                <Icon name="spinner" size={16} className="animate-spin" />
              ) : (
                <>
                  토큰 생성
                  <Icon name="rocket" size={16} className="ml-2" />
                </>
              )}
            </Button>
          ) : (
            <Button onClick={handleNext} disabled={isLoading}>
              다음
              <Icon name="chevron-right" size={16} className="ml-2" />
            </Button>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-start gap-3">
          <Icon name="info" size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-muted-foreground">
            <p className="font-medium mb-1">중요 안내사항</p>
            <ul className="space-y-1">
              <li>• 토큰 생성에는 Cross Network의 가스비가 필요합니다</li>
              <li>• 토큰 생성 후에는 이름과 심볼을 변경할 수 없습니다</li>
              <li>• 지갑이 연결되어 있는지 확인해주세요</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}