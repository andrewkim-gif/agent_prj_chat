# 🚀 ARA Chat 월렛 연동 완벽 구현 설계서

## 📋 분석 요약

### 현재 상황 분석
1. **기존 구현**: ARA Chat에는 Cross SDK 월렛 연동이 부분적으로 구현되어 있음
2. **SDK 샘플 코드**: sdk-react 폴더에 완벽한 Cross SDK 활용 예제가 제공됨
3. **필요한 기능**: Connect, CrossX Connect, Disconnect, 상태 관리, 에러 처리

### SDK React 샘플 분석
- **핵심 훅**: `useAppKit`, `useAppKitAccount`, `useAppKitWallet`, `useDisconnect`
- **연결 방식**:
  - 일반 연결: `appKit.connect()` (월렛 목록 표시)
  - Cross 직접 연결: `connect('cross_wallet')` (CrossX 직접 연결)
- **상태 관리**: `account.isConnected`, `account.address`, `account.balance`
- **네트워크**: Cross Mainnet/Testnet, BSC Mainnet/Testnet 지원

## 🏗️ 월렛 연동 아키텍처 설계

### 1. Core Wallet Hook (`useWalletIntegration`)

```typescript
interface WalletState {
  isConnected: boolean
  isConnecting: boolean
  account: {
    address: string | null
    balance: string | null
    balanceSymbol: string | null
    tokenBalance: TokenBalance[] | null
  }
  network: {
    chainId: number | null
    name: string | null
  }
  error: WalletError | null
}

interface WalletActions {
  // 연결 관련
  connect: () => Promise<void>              // 월렛 목록으로 연결
  connectCrossX: () => Promise<void>        // CrossX 직접 연결
  disconnect: () => Promise<void>           // 연결 해제

  // 네트워크 관련
  switchToMainnet: () => Promise<void>      // Cross Mainnet으로 전환
  switchToTestnet: () => Promise<void>      // Cross Testnet으로 전환
  switchToBSC: () => Promise<void>          // BSC 네트워크로 전환

  // 데이터 관련
  refreshBalance: () => Promise<void>       // 잔액 새로고침
  getTokenBalance: (tokenAddress: string) => Promise<string>
}
```

### 2. Wallet UI Components

#### WalletButton Component
```typescript
interface WalletButtonProps {
  variant?: 'default' | 'crossx' | 'compact'
  showBalance?: boolean
  showNetwork?: boolean
  className?: string
}

// 사용 예시
<WalletButton variant="default" showBalance={true} />
<WalletButton variant="crossx" showNetwork={true} />
```

#### WalletStatus Component
```typescript
interface WalletStatusProps {
  showAddress?: boolean
  showBalance?: boolean
  showNetwork?: boolean
  showTokens?: boolean
  compact?: boolean
}
```

#### WalletModal Component
```typescript
interface WalletModalProps {
  isOpen: boolean
  onClose: () => void
  mode: 'connect' | 'account' | 'network'
}
```

### 3. Error Handling System

```typescript
enum WalletErrorType {
  CONNECTION_REJECTED = 'CONNECTION_REJECTED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  WALLET_NOT_FOUND = 'WALLET_NOT_FOUND',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

interface WalletError {
  type: WalletErrorType
  message: string
  details?: any
}
```

### 4. State Management Architecture

```typescript
// Context Provider 구조
interface WalletContextValue {
  state: WalletState
  actions: WalletActions
  utils: {
    formatAddress: (address: string) => string
    formatBalance: (balance: string, decimals?: number) => string
    isValidAddress: (address: string) => boolean
  }
}

// Provider 설정
<WalletProvider projectId={PROJECT_ID} redirectUrl={REDIRECT_URL}>
  <App />
</WalletProvider>
```

## 🎨 UI/UX 설계

### 1. 연결 상태별 UI

#### 연결되지 않은 상태
```tsx
<div className="flex gap-2">
  <Button onClick={connect} variant="outline">
    <CreditCard className="w-4 h-4 mr-2" />
    Connect Wallet
  </Button>
  <Button onClick={connectCrossX} className="bg-gradient-to-r from-blue-500 to-purple-600">
    <Logo className="w-4 h-4 mr-2" />
    Connect CrossX
  </Button>
</div>
```

#### 연결된 상태
```tsx
<div className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg">
  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
  <div className="flex-1">
    <p className="text-sm font-medium">{formatAddress(account.address)}</p>
    <p className="text-xs text-muted-foreground">
      {account.balance} {account.balanceSymbol}
    </p>
  </div>
  <Button onClick={disconnect} variant="ghost" size="sm">
    <Power className="w-4 h-4" />
  </Button>
</div>
```

### 2. 네트워크 표시
```tsx
<div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-full">
  <div className="w-2 h-2 bg-green-500 rounded-full" />
  <span className="text-xs font-medium">{network.name}</span>
  <Button onClick={openNetworkModal} variant="ghost" size="sm">
    <ChevronDown className="w-3 h-3" />
  </Button>
</div>
```

### 3. 토큰 잔액 표시
```tsx
<div className="space-y-2">
  {account.tokenBalance?.map((token) => (
    <div key={token.symbol} className="flex justify-between text-sm">
      <span className="text-muted-foreground">{token.symbol}</span>
      <span className="font-medium">
        {formatBalance(token.quantity.numeric, token.quantity.decimals)}
      </span>
    </div>
  ))}
</div>
```

## 🔧 구현 전략

### Phase 1: Core Integration (우선순위 높음)
1. **기본 훅 구현**: `useWalletIntegration` 훅 생성
2. **Provider 설정**: WalletProvider 컨텍스트 구현
3. **기본 UI**: WalletButton, WalletStatus 컴포넌트 구현

### Phase 2: Advanced Features (우선순위 중간)
1. **네트워크 관리**: 네트워크 전환 기능 구현
2. **토큰 관리**: 토큰 잔액 표시 및 관리
3. **에러 처리**: 포괄적인 에러 처리 시스템

### Phase 3: Enhanced UX (우선순위 낮음)
1. **모달 인터페이스**: 고급 월렛 관리 모달
2. **트랜잭션 히스토리**: 거래 내역 표시
3. **성능 최적화**: 상태 관리 최적화

## 📁 파일 구조

```
app/src/
├── components/
│   └── wallet/
│       ├── WalletButton.tsx
│       ├── WalletStatus.tsx
│       ├── WalletModal.tsx
│       ├── NetworkSelector.tsx
│       └── TokenBalanceList.tsx
├── hooks/
│   ├── useWalletIntegration.ts
│   ├── useWalletError.ts
│   └── useNetworkSwitch.ts
├── context/
│   └── WalletProvider.tsx
├── types/
│   └── wallet.ts
└── utils/
    └── wallet.ts
```

## 🔄 Chat Interface 통합

### 1. ChatInterface에 월렛 연동
```tsx
// ChatInterface.tsx에 추가
import { useWalletIntegration } from '@/hooks/useWalletIntegration'

export function ChatInterface() {
  const wallet = useWalletIntegration()

  // 월렛 관련 명령어 처리
  const handleWalletCommand = (command: string) => {
    switch (command) {
      case '지갑 연결해줘':
        return wallet.connect()
      case 'CrossX 연결해줘':
        return wallet.connectCrossX()
      case '지갑 연결 해제해줘':
        return wallet.disconnect()
      case '잔액 확인해줘':
        return wallet.refreshBalance()
    }
  }
}
```

### 2. 블록체인 명령어 확장
```typescript
// BlockchainChatProcessor.ts에 추가
const walletCommands = [
  { pattern: /지갑.*연결/, action: 'connect_wallet' },
  { pattern: /CrossX.*연결/, action: 'connect_crossx' },
  { pattern: /지갑.*해제/, action: 'disconnect_wallet' },
  { pattern: /잔액.*확인/, action: 'check_balance' },
  { pattern: /네트워크.*전환/, action: 'switch_network' }
]
```

## 🛡️ 보안 및 에러 처리

### 1. 연결 실패 처리
```typescript
const handleConnectionError = (error: any) => {
  if (error.code === 4001) {
    showToast('사용자가 연결을 거부했습니다.', 'warning')
  } else if (error.code === -32002) {
    showToast('이미 연결 요청이 진행 중입니다.', 'info')
  } else {
    showToast('월렛 연결에 실패했습니다.', 'error')
  }
}
```

### 2. 네트워크 검증
```typescript
const validateNetwork = async () => {
  const supportedChains = [crossMainnet.chainId, crossTestnet.chainId]
  if (!supportedChains.includes(network.chainId)) {
    await switchToMainnet()
  }
}
```

### 3. 잔액 검증
```typescript
const validateBalance = (amount: string, balance: string) => {
  const amountBN = parseUnits(amount, 18)
  const balanceBN = parseUnits(balance, 18)
  return balanceBN >= amountBN
}
```

## 🧪 테스트 전략

### 1. Unit Tests
- 각 훅의 기능 테스트
- 에러 처리 로직 테스트
- 상태 변화 테스트

### 2. Integration Tests
- 월렛 연결 플로우 테스트
- 네트워크 전환 테스트
- 에러 시나리오 테스트

### 3. E2E Tests
- 사용자 시나리오 테스트
- 다양한 월렛과의 호환성 테스트

## 📈 성능 최적화

### 1. 상태 최적화
- 불필요한 리렌더링 방지
- 메모이제이션 활용
- 상태 구독 최적화

### 2. 네트워크 최적화
- 요청 배칭
- 캐싱 전략
- 에러 재시도 로직

## 🎯 Success Metrics

### 1. 기능 완성도
- ✅ 기본 연결/해제 기능
- ✅ CrossX 직접 연결
- ✅ 네트워크 전환
- ✅ 잔액 표시
- ✅ 에러 처리

### 2. 사용자 경험
- 연결 성공률 > 95%
- 에러 발생 시 명확한 피드백
- 빠른 응답 시간 (< 3초)

### 3. 코드 품질
- 타입 안전성 100%
- 테스트 커버리지 > 80%
- 코드 재사용성 최대화

---

이 설계서를 기반으로 체계적이고 완벽한 월렛 연동 기능을 구현하겠습니다.