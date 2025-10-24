# Enhanced Token Display Design

## 🎯 목표
채팅 사이드바에서 네트워크별 지원하는 전체 토큰을 표시하고, 네트워크 변경 시 자동으로 토큰 목록을 재조회하는 시스템 설계

## 📊 현재 상황 분석

### 기존 구현
- `AllTokensList`: 잔액 있는 토큰만 표시 (`showOnlyOwned=false` 옵션 있지만 기본은 잔액 있는 토큰)
- `SimpleCrossWalletProvider`: Cross SDK와 연동하여 사용자 잔액 조회
- 네트워크 변경 시 토큰 재조회는 일부만 구현됨

### 참조 코드 분석
- **cross-wallet-desktop**: `useBalance` 훅으로 모든 토큰 조회
- **sdk-react**: `AccountController.fetchTokenBalance()` 활용

## 🏗️ 설계 아키텍처

### 1. Enhanced Token Display Component
```
EnhancedAllTokensList
├── NetworkAwareTokenDisplay (새로 생성)
│   ├── NetworkTokenProvider (새로 생성)
│   ├── TokenDisplayMode (보유/전체 토글)
│   └── TokenRefreshManager (새로 생성)
└── Existing Components
    ├── AllTokensList (기존)
    ├── CompactTokenList (기존)
    └── CompactTokenListItem (기존)
```

### 2. Token Data Flow
```
Network Change Event
↓
NetworkTokenProvider.refreshForNetwork()
↓
Cross SDK TokenBalance Fetch
↓
Merge with Static Token Config
↓
Update Token Display
```

### 3. State Management Structure
```typescript
interface EnhancedTokenState {
  // 현재 네트워크의 모든 지원 토큰 (잔액 0 포함)
  allSupportedTokens: TokenWithChainInfo[]

  // 사용자가 실제 보유한 토큰
  ownedTokens: TokenWithChainInfo[]

  // 표시 모드
  displayMode: 'owned' | 'all'

  // 로딩 상태
  isRefreshing: boolean

  // 마지막 업데이트 시간
  lastRefresh: number
}
```

## 🔧 구현 계획

### Phase 1: NetworkTokenProvider 생성
새로운 컨텍스트 프로바이더로 네트워크별 토큰 관리를 담당

### Phase 2: Enhanced Token Display
기존 `AllTokensList`를 확장하여 전체 토큰 표시 모드 추가

### Phase 3: Network Change Integration
네트워크 변경 시 자동 토큰 재조회 시스템 구현

### Phase 4: UI Enhancement
토큰 표시 모드 토글 및 새로고침 버튼 추가

## 🎨 UI 컴포넌트 설계

### TokenDisplayModeToggle
```typescript
interface TokenDisplayModeToggleProps {
  mode: 'owned' | 'all'
  onModeChange: (mode: 'owned' | 'all') => void
  ownedCount: number
  totalCount: number
}
```

### NetworkAwareTokenList
```typescript
interface NetworkAwareTokenListProps {
  displayMode: 'owned' | 'all'
  autoRefreshOnNetworkChange: boolean
  refreshInterval?: number
  onTokenClick?: (token: TokenWithChainInfo) => void
  onSendClick?: (token: TokenWithChainInfo) => void
}
```

## 🔄 Network Change Refresh System

### 1. Event-Driven Refresh
```typescript
useEffect(() => {
  const handleNetworkChange = (newNetwork: NetworkConfig) => {
    refreshTokensForNetwork(newNetwork.chainId)
  }

  // 네트워크 변경 이벤트 리스너
  networkStore.subscribe(handleNetworkChange)
}, [])
```

### 2. Smart Refresh Strategy
```typescript
const refreshTokensForNetwork = async (chainId: number) => {
  // 1. 정적 토큰 목록 로드 (즉시 표시)
  const staticTokens = getTokensByChainId(chainId)
  setAllSupportedTokens(staticTokens.map(t => ({ ...t, balance: '0' })))

  // 2. 사용자 잔액 조회 (백그라운드)
  if (isConnected) {
    const userBalances = await fetchUserTokenBalances(chainId)
    mergeUserBalancesWithStaticTokens(staticTokens, userBalances)
  }
}
```

### 3. Cross SDK Integration
```typescript
const fetchUserTokenBalances = async (chainId: number) => {
  try {
    // Cross SDK를 통한 토큰 잔액 조회
    await AccountController.fetchTokenBalance()

    // SDK에서 제공하는 tokenBalance 활용
    const tokenBalances = account.tokenBalance

    return processTokenBalances(tokenBalances, chainId)
  } catch (error) {
    console.error('Failed to fetch token balances:', error)
    return []
  }
}
```

## 📱 User Experience

### Display Modes
1. **보유 토큰 모드**: 잔액이 있는 토큰만 표시 (기본)
2. **전체 토큰 모드**: 네트워크에서 지원하는 모든 토큰 표시

### Network Change Behavior
1. 네트워크 변경 즉시 → 정적 토큰 목록 표시
2. 백그라운드에서 사용자 잔액 조회
3. 조회 완료 후 실제 잔액으로 업데이트

### Loading States
1. **즉시 로딩**: 정적 토큰 목록으로 빠른 표시
2. **백그라운드 로딩**: 잔액 조회 중 스피너 표시
3. **오류 처리**: 네트워크 오류 시 재시도 버튼

## 🔗 Integration Points

### With Existing Components
- `ChatSidebar`: Enhanced token display 통합
- `UnifiedWalletDashboard`: 토큰 표시 모드 연동
- `NetworkSelector`: 네트워크 변경 이벤트 연동

### With Cross SDK
- `useAppKitAccount`: 사용자 계정 정보
- `AccountController.fetchTokenBalance()`: 토큰 잔액 조회
- `useAppKitNetwork`: 네트워크 변경 감지

### With Store Systems
- `networkStore`: 현재 네트워크 상태
- `crossWalletStore`: 토큰 및 잔액 상태

## 🎯 성능 최적화

### Caching Strategy
- 네트워크별 토큰 목록 캐싱
- 사용자 잔액 정보 캐싱 (30초 TTL)
- 정적 토큰 설정 메모이제이션

### Lazy Loading
- 토큰 이미지 지연 로딩
- 가격 정보 백그라운드 로딩
- 대용량 토큰 목록 가상화

### Smart Updates
- 변경된 토큰만 업데이트
- Diff 기반 상태 업데이트
- 불필요한 리렌더링 방지

## 📋 Implementation Checklist

### Core Components
- [ ] NetworkTokenProvider 생성
- [ ] TokenDisplayModeToggle 컴포넌트
- [ ] NetworkAwareTokenList 컴포넌트
- [ ] TokenRefreshManager 유틸리티

### Integration
- [ ] 네트워크 변경 이벤트 연동
- [ ] Cross SDK 토큰 조회 연동
- [ ] 기존 토큰 컴포넌트 확장

### UX Enhancements
- [ ] 로딩 상태 개선
- [ ] 오류 처리 및 재시도
- [ ] 토큰 표시 모드 토글

### Testing & Optimization
- [ ] 네트워크 변경 시나리오 테스트
- [ ] 성능 최적화 적용
- [ ] 접근성 개선

## 🎨 UI 구조도

```
ChatSidebar
├── WalletConnection Status
├── TokenDisplayModeToggle [보유 토큰 | 전체 토큰]
├── NetworkAwareTokenList
│   ├── Loading State (네트워크 변경 시)
│   ├── Token Items (정렬: 보유량 → 이름순)
│   │   ├── Token Icon + Name + Symbol
│   │   ├── Balance + Value (보유 시)
│   │   └── Action Buttons (보유 시만)
│   └── Empty State (검색 결과 없음)
└── Quick Actions
```

이 설계에 따라 단계별로 구현을 진행하겠습니다.