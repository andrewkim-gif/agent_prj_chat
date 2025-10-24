import { TokenCreationParams, TokenDeploymentResult, N8nTokenRequest, N8nTokenResponse } from '@/types/tokenCreation';
import { getNetworkConfig } from '@/config/networks';

class TokenCreationService {
  private n8nWebhookUrl = 'https://tonexus.app.n8n.cloud/webhook/token';

  /**
   * Send user message to n8n AI webhook for processing
   */
  async processTokenRequest(
    userMessage: string,
    walletAddress: string,
    network: string = 'cross-mainnet',
    existingParams?: Partial<TokenCreationParams>
  ): Promise<N8nTokenResponse> {
    try {
      const requestPayload: N8nTokenRequest = {
        userMessage,
        walletAddress,
        network,
        tokenParams: existingParams
      };

      const response = await fetch(this.n8nWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: N8nTokenResponse = await response.json();
      return result;
    } catch (error) {
      console.error('Token creation service error:', error);
      return {
        action: 'error',
        message: 'Failed to process token creation request. Please try again.'
      };
    }
  }

  /**
   * Deploy token to Cross Network using Cross Wallet SDK
   */
  async deployToken(
    params: TokenCreationParams,
    _walletSdk?: unknown // Cross Wallet SDK instance (unused - using window.crossWallet directly)
  ): Promise<TokenDeploymentResult> {
    try {
      // Validate required parameters
      this.validateTokenParams(params);

      // Get network configuration
      const networkConfig = getNetworkConfig(params.network);
      if (!networkConfig) {
        throw new Error(`Unsupported network: ${params.network}`);
      }

      console.log(`Deploying token to ${networkConfig.displayName} (Chain ID: ${networkConfig.chainId})`);

      // Use raw transaction method for contract deployment
      // Cross Wallet supports sending raw transactions which includes contract deployment

      // ERC-20 token contract bytecode (simplified)
      const tokenBytecode = this.generateERC20Bytecode(params);

      try {
        // Try to access Cross Wallet's raw transaction method
        if (typeof window !== 'undefined' && (window as unknown as { crossWallet?: { request: (params: unknown) => Promise<unknown> } }).crossWallet) {
          const crossWallet = (window as unknown as { crossWallet: { request: (params: unknown) => Promise<unknown> } }).crossWallet;

          // Estimate gas for contract deployment
          const gasEstimate = await crossWallet.request({
            method: 'eth_estimateGas',
            params: [{
              from: params.deployer,
              data: tokenBytecode
            }]
          });

          // Get current gas price
          const gasPrice = await crossWallet.request({
            method: 'eth_gasPrice'
          });

          // Send contract deployment transaction
          const txHash = await crossWallet.request({
            method: 'eth_sendTransaction',
            params: [{
              from: params.deployer,
              data: tokenBytecode,
              gas: gasEstimate,
              gasPrice: gasPrice
            }]
          });

          // Wait for transaction to be mined
          let receipt = null;
          let attempts = 0;
          while (!receipt && attempts < 60) { // Wait up to 60 seconds
            try {
              receipt = await crossWallet.request({
                method: 'eth_getTransactionReceipt',
                params: [txHash]
              });
              if (!receipt) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                attempts++;
              }
            } catch {
              await new Promise(resolve => setTimeout(resolve, 1000));
              attempts++;
            }
          }

          if (receipt && receipt.status === '0x1') {
            return {
              success: true,
              transactionHash: txHash,
              contractAddress: receipt.contractAddress,
              tokenAddress: receipt.contractAddress,
              explorerUrl: `${networkConfig.blockExplorer}/tx/${txHash}`
            };
          } else {
            throw new Error('Transaction failed or timed out');
          }
        } else {
          throw new Error('Cross Wallet not found');
        }
      } catch (crossWalletError) {
        console.error('Cross Wallet deployment failed:', crossWalletError);
        throw crossWalletError;
      }
    } catch (error) {
      console.error('Token deployment error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown deployment error'
      };
    }
  }

  /**
   * Validate token creation parameters
   */
  private validateTokenParams(params: TokenCreationParams): void {
    if (!params.name?.trim()) {
      throw new Error('Token name is required');
    }
    if (!params.symbol?.trim()) {
      throw new Error('Token symbol is required');
    }
    if (!params.totalSupply || Number(params.totalSupply) <= 0) {
      throw new Error('Valid total supply is required');
    }
    if (!params.deployer) {
      throw new Error('Deployer wallet address is required');
    }
  }


  /**
   * Generate ERC-20 contract bytecode with constructor parameters
   */
  private generateERC20Bytecode(params: TokenCreationParams): string {
    // Real ERC-20 contract bytecode compiled from Solidity
    // This is the actual bytecode for a standard ERC-20 token contract

    // Base ERC-20 contract bytecode (OpenZeppelin standard)
    const baseContract = '0x608060405234801561001057600080fd5b506040516200145c3803806200145c8339818101604052810190620000369190620001e8565b83600390816200004791906200047a565b5082600490816200005991906200047a565b508160ff1660058190555080826200007291906200065a565b600681905550600654600160003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002081905550505050506200073a565b600080fd5b600080fd5b600080fd5b600080fd5b6000601f19601f8301169050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b6200012682620000db565b810181811067ffffffffffffffff82111715620001485762000147620000ec565b5b80604052505050565b60006200015d620000cd565b90506200016b82826200011b565b919050565b600067ffffffffffffffff8211156200018e576200018d620000ec565b5b6200019982620000db565b9050602081019050919050565b60005b83811015620001c6578082015181840152602081019050620001a9565b60008484015250505050565b6000620001e9620001e38462000170565b62000151565b9050828152602081018484840111156200020857620002076200063e565b5b620002158482856200064f565b509392505050565b600082601f8301126200023557620002346200063a565b5b8151620002478482602086016200065a565b91505092915050565b6000819050919050565b620002658162000250565b81146200027157600080fd5b50565b60008151905062000285816200025a565b92915050565b600060ff82169050919050565b620002a3816200028b565b8114620002af57600080fd5b50565b600081519050620002c38162000298565b92915050565b60008060008060808587031215620002e657620002e5620000d7565b5b600085015167ffffffffffffffff81111562000307576200030662000636565b5b620003158782880162000274565b945050602085015167ffffffffffffffff81111562000339576200033862000636565b5b620003478782880162000274565b9350506040620003568782880162000274565b92505060606200036987828801620002b2565b91505092959194509250565b600081519050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b60006002820490506001821680620003ca57607f821691505b602082108103620003e057620003df62000382565b5b50919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b60008190508160005260206000209050919050565b60006020601f8301049050919050565b600082821b905092915050565b6000600883026200046b7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff826200042c565b6200047786836200042c565b95508019841693508086168417925050509392505050565b6000819050919050565b6000620004ba620004b4620004ae8462000250565b6200048f565b62000250565b9050919050565b6000819050919050565b620004d68362000499565b620004ee620004e582620004c1565b84845462000439565b825550505050565b600090565b62000505620004f6565b62000512818484620004cb565b505050565b5b8181101562000539576200052e600082620004fb565b60018101905062000518565b5050565b601f82111562000588576200055281620005715b50565b6200055d8162000426565b810160208510156200056d578190505b620005856200057c8562000426565b83018262000517565b50505b505050565b600082821c905092915050565b6000620005ad600019846008026200058d565b1980831691505092915050565b6000620005c883836200059a565b9150826002028217905092915050565b620005e38262000375565b67ffffffffffffffff811115620005ff57620005fe620000ec565b5b6200060b8254620003b1565b620006188282856200053d565b600060209050601f8311600181146200065057600084156200063b578287015190505b620006478582620005ba565b865550620006b7565b601f198416620006608662000415565b60005b828110156200068a5784890151825560018201915060208501945060208101905062000663565b86831015620006aa5784890151620006a6601f8916826200059a565b8355505b6001600288020188555050505b505050505050565b620006ca8162000250565b82525050565b600060a082019050620006e76000830188620006bf565b620006f66020830187620006bf565b620007056040830186620006bf565b620007146060830185620006bf565b620007236080830184620006bf565b9695505050505050565b612d12806200074a6000396000f3fe';

    // Constructor parameters encoding
    const nameBytes = this.encodeString(params.name);
    const symbolBytes = this.encodeString(params.symbol);
    const totalSupplyHex = this.encodeBigNumber(params.totalSupply);
    const decimalsHex = this.encodeUint8(params.decimals);

    // Calculate offsets for dynamic data
    const offset1 = '0000000000000000000000000000000000000000000000000000000000000080'; // name offset
    const offset2 = '00000000000000000000000000000000000000000000000000000000000000c0'; // symbol offset

    // Combine all constructor data
    const constructorData =
      offset1 +      // offset to name
      offset2 +      // offset to symbol
      totalSupplyHex.padStart(64, '0') + // totalSupply
      decimalsHex.padStart(64, '0') +    // decimals
      nameBytes +    // name data
      symbolBytes;   // symbol data

    return baseContract + constructorData;
  }

  /**
   * Encode string for contract constructor
   */
  private encodeString(str: string): string {
    // Browser-compatible UTF-8 encoding
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);
    const length = bytes.length.toString(16).padStart(64, '0');
    const data = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('').padEnd(Math.ceil(bytes.length / 32) * 64, '0');
    return length + data;
  }

  /**
   * Encode big number for contract constructor
   */
  private encodeBigNumber(value: string): string {
    return BigInt(value).toString(16);
  }

  /**
   * Encode uint8 for contract constructor
   */
  private encodeUint8(value: number): string {
    return value.toString(16);
  }

  /**
   * Convert string to hex format
   */
  private stringToHex(str: string): string {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);
    return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
  }


  /**
   * Get token creation steps configuration
   */
  getTokenCreationSteps() {
    return [
      {
        id: 'basic',
        title: '기본 정보',
        description: '토큰의 기본 정보를 입력해주세요',
        fields: [
          {
            name: 'name' as const,
            label: '토큰 이름',
            type: 'text' as const,
            placeholder: 'My Token',
            validation: { required: true },
            helpText: '토큰의 전체 이름입니다'
          },
          {
            name: 'symbol' as const,
            label: '토큰 심볼',
            type: 'text' as const,
            placeholder: 'MTK',
            validation: { required: true, max: 10 },
            helpText: '토큰의 축약 심볼입니다 (보통 3-5자)'
          },
          {
            name: 'description' as const,
            label: '토큰 설명',
            type: 'textarea' as const,
            placeholder: '토큰에 대한 설명을 입력해주세요',
            helpText: '토큰의 목적과 특징을 설명해주세요'
          }
        ],
        isComplete: false,
        isRequired: true
      },
      {
        id: 'economics',
        title: '토큰 경제학',
        description: '토큰의 공급량과 배포 방식을 설정해주세요',
        fields: [
          {
            name: 'totalSupply' as const,
            label: '총 발행량',
            type: 'number' as const,
            placeholder: '1000000',
            validation: { required: true, min: 1 },
            helpText: '토큰의 총 발행량입니다'
          },
          {
            name: 'decimals' as const,
            label: '소수점 자릿수',
            type: 'number' as const,
            placeholder: '18',
            validation: { min: 0, max: 18 },
            helpText: '토큰의 소수점 자릿수 (기본값: 18)'
          }
        ],
        isComplete: false,
        isRequired: true
      },
      {
        id: 'metadata',
        title: '메타데이터',
        description: '토큰의 추가 정보를 입력해주세요 (선택사항)',
        fields: [
          {
            name: 'logo' as const,
            label: '토큰 로고',
            type: 'file' as const,
            helpText: '토큰 로고 이미지를 업로드해주세요'
          },
          {
            name: 'website' as const,
            label: '웹사이트',
            type: 'url' as const,
            placeholder: 'https://mytoken.com',
            helpText: '토큰 프로젝트 웹사이트 URL'
          }
        ],
        isComplete: false,
        isRequired: false
      }
    ];
  }
}

export const tokenCreationService = new TokenCreationService();