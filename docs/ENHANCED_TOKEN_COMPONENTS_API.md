# Enhanced Token Components API Reference

## 개요

네트워크별 토큰 표시 및 자동 재조회 기능을 제공하는 새로운 컴포넌트들의 API 명세서입니다.

## 📦 구성 요소

### 1. NetworkTokenProvider
- **위치**: `@/providers/NetworkTokenProvider`
- **역할**: 네트워크별 토큰 데이터 상태 관리 및 Cross SDK 통합

### 2. TokenDisplayModeToggle
- **위치**: `@/components/wallet/TokenDisplayModeToggle`
- **역할**: 보유/전체 토큰 표시 모드 전환

### 3. NetworkAwareTokenList
- **위치**: `@/components/wallet/NetworkAwareTokenList`
- **역할**: 네트워크 변경에 반응하는 지능형 토큰 목록

---

## 🔧 NetworkTokenProvider

### Context Value

```typescript
interface NetworkTokenContextValue {
  // 상태
  allSupportedTokens: TokenWithChainInfo[]    // 네트워크의 모든 지원 토큰
  ownedTokens: TokenWithChainInfo[]           // 사용자 보유 토큰
  displayMode: 'owned' | 'all'                // 현재 표시 모드
  isRefreshing: boolean                       // 새로고침 상태
  lastRefresh: number                         // 마지막 업데이트 시간
  currentChainId: number                      // 현재 네트워크 체인 ID

  // 액션
  setDisplayMode: (mode: 'owned' | 'all') => void
  refreshTokens: () => Promise<void>
  refreshTokensForNetwork: (chainId: number) => Promise<void>
  getDisplayTokens: () => TokenWithChainInfo[]
}
```

### Hooks

#### useNetworkTokens()
전체 컨텍스트 값에 접근
```typescript
const {
  allSupportedTokens,
  ownedTokens,
  displayMode,
  setDisplayMode,
  refreshTokens
} = useNetworkTokens();
```

#### useDisplayTokens()
표시할 토큰 목록만 필요한 경우
```typescript
const {
  tokens,        // 현재 모드에 따른 토큰 목록
  displayMode,   // 현재 표시 모드
  isRefreshing   // 새로고침 상태
} = useDisplayTokens();
```

#### useTokenCounts()
토큰 개수 정보만 필요한 경우
```typescript
const {
  totalCount,  // 전체 지원 토큰 수
  ownedCount   // 보유 토큰 수
} = useTokenCounts();
```

#### useTokenRefresh()
새로고침 기능만 필요한 경우
```typescript
const {
  refreshTokens,
  refreshTokensForNetwork,
  isRefreshing,
  lastRefresh
} = useTokenRefresh();
```

### 사용법

```tsx
// 1. 앱 최상위에 Provider 설정
<NetworkTokenProvider>
  <YourApp />
</NetworkTokenProvider>

// 2. 컴포넌트에서 사용
function TokenComponent() {
  const { tokens, displayMode } = useDisplayTokens();
  const { refreshTokens } = useTokenRefresh();

  return (
    <div>
      <button onClick={refreshTokens}>새로고침</button>
      {tokens.map(token => (
        <div key={token.id}>{token.name}</div>
      ))}
    </div>
  );
}
```

---

## 🎛️ TokenDisplayModeToggle

### Props

```typescript
interface TokenDisplayModeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';                    // 크기 설정
  showCounts?: boolean;                         // 토큰 개수 표시 여부
  orientation?: 'horizontal' | 'vertical';     // 버튼 배치 방향
}
```

### Variants

#### 1. TokenDisplayModeToggle (기본)
완전한 기능을 가진 토글 버튼
```tsx
<TokenDisplayModeToggle
  size="md"
  showCounts={true}
  orientation="horizontal"
/>
```

#### 2. TokenDisplayModeToggleCompact
컴팩트한 버전
```tsx
<TokenDisplayModeToggleCompact
  showLabels={true}  // 라벨 표시 여부
/>
```

#### 3. TokenDisplayModeToggleMini
최소한의 미니 버전
```tsx
<TokenDisplayModeToggleMini />
```

### 예시

```tsx
// 기본 사용
<TokenDisplayModeToggle />

// 커스터마이징
<TokenDisplayModeToggle
  size="lg"
  showCounts={false}
  orientation="vertical"
  className="custom-spacing"
/>

// 사이드바용 컴팩트 버전
<TokenDisplayModeToggleCompact showLabels={false} />
```

---

## 📋 NetworkAwareTokenList

### Props

```typescript
interface NetworkAwareTokenListProps {
  className?: string;

  // 표시 옵션
  compact?: boolean;                    // 컴팩트 모드
  maxItems?: number;                    // 최대 표시 항목 수
  showSearch?: boolean;                 // 검색 기능 표시
  showModeToggle?: boolean;             // 모드 토글 표시
  showRefreshButton?: boolean;          // 새로고침 버튼 표시
  showPercentChange?: boolean;          // 가격 변동률 표시
  showSendButtons?: boolean;            // 송금 버튼 표시

  // 검색 옵션
  searchPlaceholder?: string;           // 검색창 플레이스홀더

  // 레이아웃 옵션
  togglePosition?: 'top' | 'bottom' | 'none';  // 토글 위치
  toggleVariant?: 'full' | 'compact' | 'mini'; // 토글 변형

  // 이벤트 핸들러
  onTokenClick?: (token: TokenWithChainInfo) => void;
  onSendClick?: (token: TokenWithChainInfo) => void;

  // 자동 새로고침 옵션
  autoRefreshOnNetworkChange?: boolean; // 네트워크 변경 시 자동 새로고침
  refreshInterval?: number;             // 새로고침 간격 (밀리초)
}
```

### Variants

#### 1. NetworkAwareTokenList (기본)
모든 기능을 포함한 완전한 토큰 목록
```tsx
<NetworkAwareTokenList
  showSearch={true}
  showModeToggle={true}
  showRefreshButton={true}
  onTokenClick={handleTokenClick}
  onSendClick={handleSendClick}
/>
```

#### 2. NetworkAwareTokenListCompact
사이드바에 최적화된 컴팩트 버전
```tsx
<NetworkAwareTokenListCompact
  maxItems={5}
  onTokenClick={handleTokenClick}
  onSendClick={handleSendClick}
/>
```

#### 3. NetworkAwareTokenListMinimal
매우 제한된 공간에 적합한 미니멀 버전
```tsx
<NetworkAwareTokenListMinimal
  maxItems={3}
  onTokenClick={handleTokenClick}
/>
```

### 사용 예시

```tsx
// 전체 기능 토큰 목록
<NetworkAwareTokenList
  className="w-full"
  maxItems={20}
  showSearch={true}
  showModeToggle={true}
  showRefreshButton={true}
  showPercentChange={true}
  showSendButtons={true}
  togglePosition="top"
  toggleVariant="full"
  onTokenClick={(token) => {
    console.log('Token clicked:', token.symbol);
  }}
  onSendClick={(token) => {
    openSendModal(token);
  }}
/>

// 채팅 사이드바용
<NetworkAwareTokenListCompact
  maxItems={10}
  onTokenClick={(token) => {
    sendChatMessage(`Tell me about ${token.name}`);
  }}
  onSendClick={(token) => {
    sendChatMessage(`I want to send ${token.symbol}`);
  }}
/>

// 미니멀 위젯
<NetworkAwareTokenListMinimal
  maxItems={3}
  onTokenClick={showTokenDetails}
/>
```

---

## 🔄 동작 방식

### 네트워크 변경 플로우

1. **네트워크 변경 감지**
   ```
   networkStore 변경 → useCurrentNetwork 업데이트
   ```

2. **즉시 정적 토큰 표시**
   ```
   getTokensByChainId(chainId) → 즉시 UI 업데이트
   ```

3. **백그라운드 잔액 조회**
   ```
   AccountController.fetchTokenBalance() → 사용자 잔액 조회
   ```

4. **데이터 병합 및 최종 업데이트**
   ```
   mergeTokenData() → 최종 토큰 목록 업데이트
   ```

### 데이터 우선순위

1. **정적 토큰 설정** (`tokens.ts`)
   - 네트워크별 지원 토큰 목록
   - 로고, 이름, 기본 정보

2. **Cross SDK 데이터**
   - 사용자 실제 잔액
   - 토큰 메타데이터 (동적)

3. **서버 데이터** (기존 `useEnhancedTokenData`)
   - 가격 정보
   - 시장 데이터

### 캐싱 전략

- **정적 토큰**: 메모이제이션으로 성능 최적화
- **사용자 잔액**: 30초 간격 자동 새로고침
- **네트워크 변경**: 즉시 새로고침

---

## ⚙️ 설정 및 최적화

### 성능 최적화

```tsx
// 1. 메모이제이션 활용
const processedTokens = useMemo(() => {
  return filterAndSortTokens(tokens, searchQuery);
}, [tokens, searchQuery]);

// 2. 컴포넌트 분할
const TokenItem = memo(({ token, onTokenClick }) => {
  // 토큰 아이템 렌더링
});

// 3. 가상화 (대량 데이터 시)
import { FixedSizeList as List } from 'react-window';
```

### 에러 처리

```tsx
// 네트워크 에러 처리
try {
  await refreshTokens();
} catch (error) {
  console.error('Token refresh failed:', error);
  // 사용자에게 재시도 옵션 제공
}

// 연결 상태 확인
if (!isConnected && displayMode === 'owned') {
  return <WalletConnectionPrompt />;
}
```

### 접근성 개선

```tsx
// 키보드 네비게이션
<button
  onClick={handleTokenClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleTokenClick();
    }
  }}
  aria-label={`${token.name} 토큰 상세 보기`}
  tabIndex={0}
>
```

---

## 🚀 마이그레이션 가이드

### 기존 AllTokensList 대체

```tsx
// Before
<AllTokensList
  showOnlyOwned={false}
  onTokenClick={handleClick}
/>

// After
<NetworkAwareTokenList
  onTokenClick={handleClick}
/>
```

### 기존 CompactTokenList 대체

```tsx
// Before
<CompactTokenList
  maxItems={5}
  compact={true}
/>

// After
<NetworkAwareTokenListCompact
  maxItems={5}
/>
```

### Provider 추가

```tsx
// app/layout.tsx에 추가
<SimpleCrossWalletProvider>
  <NetworkTokenProvider>  {/* 새로 추가 */}
    {children}
  </NetworkTokenProvider>
</SimpleCrossWalletProvider>
```

---

## 🔍 디버깅 및 로깅

### 로그 확인

```typescript
// NetworkTokenProvider에서 상세 로그 제공
console.log('🔄 Refreshing tokens for network:', chainId);
console.log('📋 Loaded static tokens:', staticTokens.length);
console.log('✅ Token refresh completed for chain:', chainId);
```

### 상태 디버깅

```tsx
// 개발 환경에서 상태 확인
const { allSupportedTokens, ownedTokens, isRefreshing } = useNetworkTokens();

console.log('Token State:', {
  total: allSupportedTokens.length,
  owned: ownedTokens.length,
  refreshing: isRefreshing
});
```

### 성능 모니터링

```tsx
// 새로고침 시간 측정
const startTime = performance.now();
await refreshTokens();
const endTime = performance.now();
console.log(`Token refresh took ${endTime - startTime}ms`);
```

---

## 📚 타입 정의

### 주요 인터페이스

```typescript
// 확장된 토큰 정보
interface TokenWithChainInfo {
  id: string;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  balance: string;
  totalBalance: string;
  totalCurrencyPrice: string;
  image: string;
  chainId: number;
  deployed: boolean;
  stats?: {
    price: string;
    convertedPrice: string;
    percentChange24h: string;
  };
  currency: string;
  category?: string;
  verified?: boolean;
  isNative?: boolean;
}

// 네트워크 토큰 상태
interface NetworkTokenState {
  allSupportedTokens: TokenWithChainInfo[];
  ownedTokens: TokenWithChainInfo[];
  displayMode: 'owned' | 'all';
  isRefreshing: boolean;
  lastRefresh: number;
  currentChainId: number;
}
```

이 API 명세서를 참고하여 새로운 토큰 관리 시스템을 효과적으로 활용하시기 바랍니다.