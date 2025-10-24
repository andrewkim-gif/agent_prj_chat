// Token Creation Types
export interface TokenCreationParams {
  // Basic Information
  name: string;
  symbol: string;
  description?: string;

  // Economics
  totalSupply: string;
  decimals: number;
  initialDistribution?: {
    address: string;
    amount: string;
  }[];

  // Metadata
  logo?: string;
  website?: string;
  socialLinks?: {
    twitter?: string;
    telegram?: string;
    discord?: string;
  };

  // Deployment Configuration
  network: 'cross-mainnet' | 'cross-testnet';
  deployer: string; // wallet address
}

export interface TokenCreationStep {
  id: string;
  title: string;
  description: string;
  fields: TokenFormField[];
  isComplete: boolean;
  isRequired: boolean;
}

export interface TokenFormField {
  name: keyof TokenCreationParams;
  label: string;
  type: 'text' | 'number' | 'textarea' | 'file' | 'url';
  placeholder?: string;
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
  };
  helpText?: string;
}

export interface TokenDeploymentResult {
  success: boolean;
  transactionHash?: string;
  contractAddress?: string;
  tokenAddress?: string;
  error?: string;
  explorerUrl?: string;
}

export interface N8nTokenRequest {
  userMessage: string;
  tokenParams?: Partial<TokenCreationParams>;
  walletAddress: string;
  network: string;
}

export interface N8nTokenResponse {
  action: 'collect_params' | 'deploy_token' | 'error';
  message: string;
  requiredFields?: string[];
  deploymentResult?: TokenDeploymentResult;
}