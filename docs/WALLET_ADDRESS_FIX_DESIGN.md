# Cross Wallet Address Fix Design

## 🔍 Problem Analysis

### Current Issue
- **Cross Wallet**: Returns truncated address like `0xd96e830c73a468` (18 chars)
- **MetaMask**: Returns proper address like `0x742d35Cc6631C0532925a3b8D55B3E4E4b7BA7bE` (42 chars)
- **Root Cause**: Math.random() generates insufficient entropy for full 40-character hex string

### Code Location
`/app/src/hooks/useBlockchainWallet.ts:41`

```typescript
// ❌ PROBLEMATIC CODE
const mockAddress = '0x' + Math.random().toString(16).substr(2, 40)
```

## 🛠 Solution Design

### 1. Immediate Fix - Proper Mock Address Generation

```typescript
// ✅ CORRECT IMPLEMENTATION
const generateMockAddress = (): string => {
  // Generate 40 characters of hex (20 bytes)
  const chars = '0123456789abcdef'
  let address = '0x'

  for (let i = 0; i < 40; i++) {
    address += chars[Math.floor(Math.random() * 16)]
  }

  return address
}

// Usage
const mockAddress = generateMockAddress()
```

### 2. Enhanced Address Validation

```typescript
const isValidEthereumAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

const validateAndNormalizeAddress = (address: string): string => {
  if (!isValidEthereumAddress(address)) {
    throw new Error(`Invalid address format: ${address}`)
  }
  return address.toLowerCase()
}
```

### 3. Cross SDK Integration Preparation

```typescript
interface CrossSDKResponse {
  address: string
  chainId: number
  balance?: string
}

const connectCrossWallet = async (): Promise<CrossSDKResponse> => {
  try {
    const crossSDK = await import('@to-nexus/sdk')
    const result = await crossSDK.connect({
      forceConnect: true,
      requestAccounts: true
    })

    // Validate received address
    const normalizedAddress = validateAndNormalizeAddress(result.address)

    return {
      address: normalizedAddress,
      chainId: result.chainId || 4157,
      balance: result.balance || '0'
    }
  } catch (error) {
    console.log('Cross SDK not available, using mock:', error)

    // Fallback to validated mock
    return {
      address: generateMockAddress(),
      chainId: 4157,
      balance: '1000'
    }
  }
}
```

### 4. Multi-Method Address Resolution

```typescript
const getWalletAddress = async (provider: any): Promise<string> => {
  const methods = [
    () => provider.selectedAddress,
    () => provider.request({ method: 'eth_accounts' }).then((accounts: string[]) => accounts[0]),
    () => provider.request({ method: 'eth_requestAccounts' }).then((accounts: string[]) => accounts[0])
  ]

  for (const method of methods) {
    try {
      const address = await method()
      if (address && isValidEthereumAddress(address)) {
        return validateAndNormalizeAddress(address)
      }
    } catch (error) {
      console.warn('Address resolution method failed:', error)
    }
  }

  throw new Error('Unable to resolve valid wallet address')
}
```

### 5. Comprehensive Error Handling

```typescript
const connectWalletWithValidation = async (type: WalletType) => {
  try {
    let walletData: { address: string; chainId: number; balance?: string }

    switch (type) {
      case 'cross':
        walletData = await connectCrossWallet()
        break

      case 'metamask':
        if (!window.ethereum?.isMetaMask) {
          throw new Error('MetaMask not detected')
        }

        const address = await getWalletAddress(window.ethereum)
        const chainId = await window.ethereum.request({ method: 'eth_chainId' })

        walletData = {
          address,
          chainId: parseInt(chainId, 16)
        }
        break

      default:
        throw new Error(`Unsupported wallet type: ${type}`)
    }

    // Final validation
    if (!isValidEthereumAddress(walletData.address)) {
      throw new Error(`Invalid address received: ${walletData.address}`)
    }

    return walletData

  } catch (error) {
    console.error(`Wallet connection failed for ${type}:`, error)
    throw error
  }
}
```

## 🎯 Implementation Priority

### Phase 1: Immediate Fix (High Priority)
- Fix Math.random() address generation
- Add address validation
- Implement proper mock address generation

### Phase 2: Enhanced Validation (Medium Priority)
- Multi-method address resolution
- Comprehensive error handling
- Address normalization

### Phase 3: Real SDK Integration (Low Priority)
- Replace mock with actual Cross SDK
- Handle cross-chain address formats
- Implement SDK-specific error handling

## 🔧 Testing Strategy

### Unit Tests
```typescript
describe('Address Generation', () => {
  it('should generate valid 42-character addresses', () => {
    const address = generateMockAddress()
    expect(address).toMatch(/^0x[a-fA-F0-9]{40}$/)
    expect(address.length).toBe(42)
  })

  it('should validate address formats correctly', () => {
    expect(isValidEthereumAddress('0x742d35Cc6631C0532925a3b8D55B3E4E4b7BA7bE')).toBe(true)
    expect(isValidEthereumAddress('0xd96e830c73a468')).toBe(false)
  })
})
```

### Integration Tests
- Test MetaMask connection with real addresses
- Test Cross Wallet mock generation
- Test address validation edge cases
- Test error handling scenarios

## 📋 Success Criteria

1. ✅ Cross Wallet generates proper 42-character addresses
2. ✅ Address validation prevents invalid formats
3. ✅ Error messages are clear and actionable
4. ✅ Consistent behavior across all wallet types
5. ✅ Proper fallback to mock when SDK unavailable

## 🚀 Future Considerations

- **Cross-Chain Address Support**: Handle different address formats for different chains
- **Address Checksumming**: Implement EIP-55 checksum validation
- **Hardware Wallet Integration**: Extend validation for hardware wallets
- **Multi-Account Support**: Handle multiple accounts from single wallet