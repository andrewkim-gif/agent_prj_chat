# 🚀 월렛 연동 구현 계획서

## 📋 SDK React 샘플 코드 분석 결과

### 핵심 발견사항
1. **내장 컴포넌트**: `<appkit-button />`, `<appkit-network-button />` Web Components 제공
2. **연결 방식**:
   - 일반 연결: `appKit.connect()` (월렛 목록 표시)
   - CrossX 직접 연결: `connect('cross_wallet')`
3. **네트워크 관리**: `switchNetwork()` 함수로 Cross Mainnet/Testnet, BSC 전환
4. **상태 관리**: `useAppKitAccount`, `useAppKitNetwork`, `useAppKitWallet` 훅들
5. **초기화**: `initCrossSdk()` 함수로 프로젝트 설정

## 🎯 구현 목표

### 1. SDK 내장 컴포넌트 최대 활용
- `<appkit-button />`: 기본 월렛 연결 버튼
- `<appkit-network-button />`: 네트워크 선택 버튼
- 빠른 구현과 일관성 보장

### 2. ARA Chat 특화 기능 추가
- 채팅 명령어를 통한 월렛 제어
- 한국어 UI 및 메시지
- ARA 디자인 시스템과 통합

### 3. 완벽한 기능 구현
- Connect / Disconnect
- CrossX 직접 연결
- 네트워크 전환 (Choose Network)
- 잔액 및 토큰 표시
- 에러 처리 및 사용자 피드백

## 🏗️ 구현 아키텍처

### Phase 1: SDK 기본 통합 (우선순위: 높음)

#### 1.1 SDK 초기화
```typescript
// lib/wallet/config.ts
export const walletConfig = {
  projectId: process.env.NEXT_PUBLIC_CROSS_PROJECT_ID!,
  redirectUrl: typeof window !== 'undefined' ? window.location.href : '',
  metadata: {
    name: 'ARA Chat',
    description: 'AI-powered Cross ecosystem chat assistant',
    url: 'https://arachat.to.nexus',
    icons: ['https://contents.crosstoken.io/wallet/token/images/CROSSx.svg']
  },
  themeMode: 'dark',
  defaultNetwork: crossMainnet
}
```

#### 1.2 앱 레벨 SDK 초기화
```typescript
// app/layout.tsx 또는 _app.tsx
import { initCrossSdk } from '@to-nexus/sdk/react'
import { walletConfig } from '@/lib/wallet/config'

// SDK 초기화 (앱 시작 시 한 번만)
initCrossSdk(
  walletConfig.projectId,
  walletConfig.redirectUrl,
  walletConfig.metadata,
  walletConfig.themeMode,
  walletConfig.defaultNetwork
)
```

#### 1.3 내장 컴포넌트 래퍼
```typescript
// components/wallet/BuiltInComponents.tsx
export const WalletConnectButton = () => {
  return <appkit-button />
}

export const NetworkSelectButton = () => {
  return <appkit-network-button />
}
```

### Phase 2: 상태 관리 및 훅 (우선순위: 높음)

#### 2.1 메인 월렛 훅
```typescript
// hooks/useWalletIntegration.ts
import {
  useAppKit,
  useAppKitAccount,
  useAppKitWallet,
  useAppKitNetwork,
  useDisconnect
} from '@to-nexus/sdk/react'

export const useWalletIntegration = () => {
  const appKit = useAppKit()
  const account = useAppKitAccount()
  const network = useAppKitNetwork()
  const { disconnect } = useDisconnect()
  const { connect } = useAppKitWallet()

  // 기본 연결 (월렛 목록 표시)
  const connectWallet = async () => {
    try {
      await appKit.connect()
    } catch (error) {
      console.error('Wallet connection failed:', error)
      throw error
    }
  }

  // CrossX 직접 연결
  const connectCrossX = async () => {
    try {
      await connect('cross_wallet')
    } catch (error) {
      console.error('CrossX connection failed:', error)
      throw error
    }
  }

  // 네트워크 전환
  const switchToMainnet = () => network.switchNetwork(crossMainnet)
  const switchToTestnet = () => network.switchNetwork(crossTestnet)
  const switchToBSC = () => network.switchNetwork(bscMainnet)

  return {
    // 상태
    isConnected: account.isConnected,
    address: account.address,
    balance: account.balance,
    balanceSymbol: account.balanceSymbol,
    tokenBalance: account.tokenBalance,
    chainId: network.chainId,
    networkName: network.caipNetwork?.name,

    // 액션
    connect: connectWallet,
    connectCrossX,
    disconnect,
    switchToMainnet,
    switchToTestnet,
    switchToBSC,

    // 유틸리티
    formatAddress: (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`,
    formatBalance: (balance: string) => parseFloat(balance).toFixed(4)
  }
}
```

### Phase 3: UI 컴포넌트 (우선순위: 중간)

#### 3.1 통합 월렛 버튼
```typescript
// components/wallet/WalletButton.tsx
interface WalletButtonProps {
  variant: 'builtin' | 'custom' | 'compact'
  showBalance?: boolean
}

export const WalletButton = ({ variant, showBalance }: WalletButtonProps) => {
  const wallet = useWalletIntegration()

  if (variant === 'builtin') {
    return (
      <div className="flex gap-2">
        <appkit-button />
        <appkit-network-button />
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2 p-2 bg-card border rounded-lg">
        {wallet.isConnected ? (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-sm">{wallet.formatAddress(wallet.address!)}</span>
            {showBalance && (
              <span className="text-xs text-muted-foreground">
                {wallet.balance} {wallet.balanceSymbol}
              </span>
            )}
            <Button onClick={wallet.disconnect} size="sm" variant="ghost">
              <Power className="w-3 h-3" />
            </Button>
          </div>
        ) : (
          <div className="flex gap-1">
            <Button onClick={wallet.connect} size="sm">Connect</Button>
            <Button onClick={wallet.connectCrossX} size="sm" variant="outline">
              CrossX
            </Button>
          </div>
        )}
      </div>
    )
  }

  // custom variant
  return (
    <div className="space-y-2">
      {!wallet.isConnected ? (
        <div className="flex gap-2">
          <Button onClick={wallet.connect} className="flex-1">
            <CreditCard className="w-4 h-4 mr-2" />
            Connect Wallet
          </Button>
          <Button onClick={wallet.connectCrossX} variant="outline">
            <Logo className="w-4 h-4 mr-2" />
            CrossX
          </Button>
        </div>
      ) : (
        <div className="p-4 bg-card border rounded-lg space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">{wallet.formatAddress(wallet.address!)}</p>
              <p className="text-sm text-muted-foreground">{wallet.networkName}</p>
            </div>
            <Button onClick={wallet.disconnect} variant="ghost" size="sm">
              <Power className="w-4 h-4" />
            </Button>
          </div>

          {showBalance && (
            <div className="pt-2 border-t">
              <p className="text-sm">
                <span className="text-muted-foreground">Balance: </span>
                <span className="font-medium">
                  {wallet.balance} {wallet.balanceSymbol}
                </span>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
```

### Phase 4: 채팅 통합 (우선순위: 중간)

#### 4.1 ChatInterface 헤더 통합
```typescript
// components/chat/ChatInterface.tsx 수정
import { WalletButton } from '@/components/wallet/WalletButton'

export function ChatInterface() {
  const wallet = useWalletIntegration()

  return (
    <div className="h-full flex flex-col">
      {/* 상단 헤더에 월렛 정보 표시 */}
      <div className="p-4 border-b bg-card/50 backdrop-blur">
        <div className="flex justify-between items-center">
          <h1 className="text-lg font-semibold">ARA Chat</h1>

          {/* 월렛 상태 표시 - 내장 컴포넌트 사용 */}
          <div className="flex gap-2">
            <appkit-button />
            <appkit-network-button />
          </div>
        </div>
      </div>

      {/* 기존 채팅 내용 */}
      {/* ... */}
    </div>
  )
}
```

#### 4.2 음성 명령어 처리 확장
```typescript
// 기존 blockchain/BlockchainChatProcessor.ts 확장
const walletCommands = [
  {
    pattern: /지갑.*연결|월렛.*연결|wallet.*connect/i,
    action: 'connect_wallet',
    response: '지갑 연결을 시작합니다. 연결할 지갑을 선택해주세요.'
  },
  {
    pattern: /CrossX.*연결|크로스.*연결/i,
    action: 'connect_crossx',
    response: 'CrossX 지갑으로 직접 연결합니다.'
  },
  {
    pattern: /지갑.*해제|월렛.*해제|disconnect/i,
    action: 'disconnect_wallet',
    response: '지갑 연결을 해제합니다.'
  },
  {
    pattern: /잔액.*확인|balance.*check|얼마.*있어/i,
    action: 'check_balance',
    response: '현재 잔액을 확인합니다.'
  },
  {
    pattern: /네트워크.*전환|체인.*바꿔|network.*switch/i,
    action: 'show_network_options',
    response: '네트워크를 전환할 수 있는 옵션을 표시합니다.'
  }
]

// 월렛 액션 실행
export const executeWalletAction = async (action: string, wallet: any) => {
  switch (action) {
    case 'connect_wallet':
      return await wallet.connect()
    case 'connect_crossx':
      return await wallet.connectCrossX()
    case 'disconnect_wallet':
      return await wallet.disconnect()
    case 'check_balance':
      return {
        balance: wallet.balance,
        symbol: wallet.balanceSymbol,
        address: wallet.address
      }
    case 'show_network_options':
      return {
        currentNetwork: wallet.networkName,
        availableNetworks: ['Cross Mainnet', 'Cross Testnet', 'BSC']
      }
  }
}
```

### Phase 5: 고급 기능 (우선순위: 낮음)

#### 5.1 토큰 송금 기능
```typescript
// 샘플 코드의 SendController 활용
const sendCrossTokens = async (receiverAddress: string, amount: string) => {
  return await SendController.sendNativeToken({
    data: '0x',
    receiverAddress,
    sendTokenAmount: amount,
    decimals: '18',
    customData: {
      metadata: `ARA Chat에서 ${amount} CROSS 송금`
    },
    type: ConstantsUtil.TRANSACTION_TYPE.LEGACY
  })
}
```

#### 5.2 스마트 컨트랙트 상호작용
```typescript
// 샘플 코드의 ConnectionController 활용
const interactWithContract = async (contractAddress: string, method: string, args: any[]) => {
  return await ConnectionController.writeContract({
    fromAddress: wallet.address,
    contractAddress,
    args,
    method,
    abi: contractABI,
    chainNamespace: 'eip155',
    customData: {
      metadata: 'ARA Chat에서 실행된 스마트 컨트랙트 상호작용'
    }
  })
}
```

## 📋 구현 체크리스트

### ✅ Phase 1: 기본 통합
- [ ] Cross SDK 프로젝트 설정 및 환경변수 구성
- [ ] `initCrossSdk()` 앱 초기화 구현
- [ ] `<appkit-button />` 내장 컴포넌트 통합
- [ ] `<appkit-network-button />` 내장 컴포넌트 통합
- [ ] 기본 연결/해제 기능 테스트

### ✅ Phase 2: 상태 관리
- [ ] `useWalletIntegration` 훅 구현
- [ ] 연결 상태 관리 구현
- [ ] CrossX 직접 연결 기능 구현
- [ ] 네트워크 전환 기능 구현
- [ ] 에러 처리 로직 구현

### ✅ Phase 3: UI 개선
- [ ] 커스텀 WalletButton 컴포넌트 구현
- [ ] 잔액 및 토큰 표시 기능
- [ ] 네트워크 상태 표시 개선
- [ ] ARA 디자인 시스템과 통합

### ✅ Phase 4: 채팅 통합
- [ ] ChatInterface 헤더에 월렛 UI 통합
- [ ] 음성 명령어 월렛 제어 구현
- [ ] 블록체인 액션 버튼 연동
- [ ] 한국어 메시지 및 피드백 구현

### ✅ Phase 5: 고급 기능
- [ ] 토큰 송금 기능 구현
- [ ] 스마트 컨트랙트 상호작용
- [ ] 트랜잭션 히스토리 표시
- [ ] 성능 최적화 및 테스트

## 🎯 성공 지표

1. **기능 완성도**: 샘플 코드의 모든 주요 기능 구현
2. **사용자 경험**: 직관적이고 빠른 월렛 연결
3. **안정성**: 연결 오류율 < 5%
4. **통합도**: 채팅 인터페이스와 완벽한 통합

---

이 계획서를 따라 단계별로 구현하여 sdk-react 샘플의 모든 기능을 ARA Chat에 완벽하게 통합하겠습니다.