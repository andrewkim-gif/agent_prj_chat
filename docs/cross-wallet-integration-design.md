# Cross Wallet Desktop 통합 설계서

## 📋 개요

Cross Wallet Desktop 앱의 핵심 지갑 기능들을 ARA Chat의 사이드바에 통합하여 사용자가 채팅하면서 지갑 관리를 할 수 있는 통합 환경을 구축합니다.

## 🎯 분석 결과

### Cross Wallet Desktop 주요 기능 분석

#### 1. 핵심 UI 컴포넌트
- **TotalAssets**: 전체 자산 가치 표시 및 송금 버튼
- **TokenList**: 토큰 목록 표시 (잔액, 가격 변동률 포함)
- **TokenListItem**: 개별 토큰 아이템 (아이콘, 이름, 잔액, 가치)
- **AccountHeader**: 계정 정보 헤더
- **TransferConfirmDrawer**: 송금 확인 드로어
- **ReceiveModal**: 받기 모달 (QR 코드)

#### 2. 상태 관리 시스템
- **Zustand**: 전역 상태 관리
- **config-store**: 계정, 테마, 통화 설정
- **Persistent Storage**: 로컬 스토리지를 통한 상태 유지

#### 3. 핵심 Hooks
- **use-balance**: 토큰 잔액 및 가격 정보 조회
- **use-transfer**: 송금 기능
- **use-wallet-handle**: 지갑 연결/해제 관리

#### 4. 기술 스택
- React 19 + TypeScript
- Zustand (상태 관리)
- TanStack Query (서버 상태)
- Radix UI + Tailwind CSS
- Ethers.js, Viem, Web3.js (블록체인)

## 🏗️ 통합 아키텍처 설계

### 1. 컴포넌트 계층 구조

```
ChatSidebar (기존)
├── WalletDashboard (기존 - 확장)
├── CompactTotalAssets (신규 - Cross Wallet 기반)
├── CompactTokenList (신규 - Cross Wallet 기반)
│   └── CompactTokenItem (신규)
├── QuickActions (신규 - 지갑 전용)
│   ├── SendAction
│   ├── ReceiveAction
│   ├── SwapAction
│   └── HistoryAction
└── WalletSelector (기존 - 유지)
```

### 2. 데이터 흐름 아키텍처

```
Cross Wallet Stores (Zustand)
├── config-store (계정, 설정)
├── balance-store (잔액, 가격 정보)
└── transfer-store (송금 상태)
     ↓
Cross Wallet Hooks
├── use-balance
├── use-transfer
└── use-wallet-handle
     ↓
ARA Chat Providers
├── BlockchainStateProvider (기존)
└── CrossWalletProvider (신규)
     ↓
Chat Sidebar Components
```

## 📦 신규 컴포넌트 설계

### 1. CompactTotalAssets
**목적**: Cross Wallet의 TotalAssets를 사이드바에 맞게 축소된 형태로 구현

**주요 기능**:
- 전체 자산 가치 표시 (USD/KRW 선택 가능)
- 자산 숨기기/보이기 토글
- 송금 버튼 (간소화된 형태)

**Props**:
```typescript
interface CompactTotalAssetsProps {
  className?: string;
  onSendClick?: () => void;
  showSendButton?: boolean;
}
```

### 2. CompactTokenList
**목적**: 사이드바에 맞는 간소화된 토큰 목록

**주요 기능**:
- 상위 5개 토큰만 표시 (더보기 버튼)
- 토큰별 잔액, 가격, 변동률 표시
- 클릭 시 토큰 상세 정보 표시

**Props**:
```typescript
interface CompactTokenListProps {
  className?: string;
  maxItems?: number;
  onTokenClick?: (token: TokenData) => void;
  showMore?: boolean;
}
```

### 3. WalletQuickActions
**목적**: 지갑 관련 빠른 액션 버튼들

**액션 목록**:
- **Send**: 송금하기
- **Receive**: 받기 (QR 코드)
- **Swap**: 토큰 교환
- **History**: 거래 내역

**Props**:
```typescript
interface WalletQuickActionsProps {
  onActionClick: (action: 'send' | 'receive' | 'swap' | 'history') => void;
  disabled?: boolean;
}
```

### 4. CrossWalletProvider
**목적**: Cross Wallet 상태를 ARA Chat에서 사용할 수 있도록 연결

**제공 기능**:
- Cross Wallet 스토어 상태 연결
- 토큰 잔액 정보 제공
- 계정 정보 관리
- 송금/받기 기능 인터페이스

## 🔄 상태 관리 통합 전략

### 1. Store 통합
```typescript
// 새로운 크로스 월렛 스토어 어댑터
interface CrossWalletState {
  // Cross Wallet 스토어 상태 매핑
  accounts: Account[];
  currentAccount: Account;
  tokens: TokenWithChainInfo[];
  totalAssets: string;
  currency: Currency;

  // ARA Chat 연동 기능
  isConnected: boolean;
  connectionStatus: 'connected' | 'disconnected' | 'connecting';

  // 액션들
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  sendToken: (params: SendTokenParams) => Promise<void>;
  getTokenBalance: (address: string) => Promise<string>;
}
```

### 2. Hook 통합
```typescript
// 통합된 지갑 훅
export function useCrossWallet() {
  const crossWalletBalance = useBalance(); // Cross Wallet hook
  const araWallet = useBlockchainWallet(); // ARA Chat hook

  return {
    // 통합된 상태
    isConnected: crossWalletBalance.isConnected || araWallet.wallet.isConnected,
    tokens: crossWalletBalance.tokensWithChainInfo,
    account: crossWalletBalance.currentAccount || araWallet.crossAccount,

    // 통합된 액션
    connect: async () => { /* 두 시스템 모두 연결 */ },
    disconnect: () => { /* 두 시스템 모두 해제 */ },
    sendMessage: araWallet.sendMessage, // 기존 ARA 기능 유지
  };
}
```

## 📱 UI/UX 통합 전략

### 1. 레이아웃 최적화
- **컴팩트 디자인**: 사이드바 폭(320px)에 최적화
- **스크롤 최적화**: 토큰 목록은 가상화 스크롤 적용
- **모바일 대응**: 반응형 디자인으로 모바일에서도 사용 가능

### 2. 시각적 일관성
- **디자인 토큰**: ARA Chat의 기존 디자인 시스템 활용
- **아이콘 통일**: @mynaui/icons-react 사용 (ARA Chat 기준)
- **색상 테마**: Cross Wallet의 그라데이션을 ARA Chat 스타일로 적용

### 3. 인터랙션 패턴
- **모달 대신 드로어**: 사이드바에서는 드로어 패턴 사용
- **인라인 액션**: 가능한 한 페이지 이동 없이 인라인에서 처리
- **컨텍스트 메뉴**: 우클릭으로 빠른 액션 제공

## 🛠️ 구현 계획

### Phase 1: 기본 통합 (1-2주)
1. **CrossWalletProvider** 구현
2. **CompactTotalAssets** 컴포넌트 개발
3. **CompactTokenList** 기본 기능 구현
4. **기존 ChatSidebar에 통합**

### Phase 2: 고급 기능 (2-3주)
1. **WalletQuickActions** 구현
2. **송금/받기 기능** 통합
3. **토큰 상세 정보** 모달/드로어
4. **거래 내역** 조회 기능

### Phase 3: 최적화 및 고도화 (1-2주)
1. **성능 최적화** (가상화 스크롤, 메모화)
2. **애니메이션 및 UX** 개선
3. **에러 처리 및 로딩 상태** 강화
4. **테스트 코드** 작성

### Phase 4: 고급 통합 (추가 개발)
1. **DeFi 기능** 통합 (스왑, 스테이킹)
2. **NFT 지원**
3. **다중 네트워크** 지원
4. **고급 차트 및 분석**

## 🔧 기술적 고려사항

### 1. 성능 최적화
- **지연 로딩**: 토큰 목록은 필요할 때만 로드
- **캐싱 전략**: 토큰 가격 정보는 5분 캐시
- **배치 처리**: 여러 토큰 정보를 한 번에 조회

### 2. 보안 고려사항
- **Private Key 격리**: Cross Wallet의 보안 모델 유지
- **권한 관리**: 민감한 작업은 추가 인증 요구
- **로깅 제한**: 지갑 주소 등은 로그에서 마스킹

### 3. 호환성
- **기존 기능 유지**: ARA Chat의 기존 블록체인 기능과 충돌 방지
- **점진적 전환**: 기존 사용자의 설정 및 데이터 보존
- **롤백 가능**: 문제 발생 시 이전 버전으로 복귀 가능

## 📊 성공 지표

### 1. 사용성 지표
- **지갑 연결율**: 90% 이상
- **토큰 조회 성공률**: 95% 이상
- **송금 성공률**: 98% 이상

### 2. 성능 지표
- **초기 로딩 시간**: 3초 이내
- **토큰 목록 로딩**: 1초 이내
- **송금 트랜잭션 처리**: 30초 이내

### 3. 사용자 경험
- **인터페이스 만족도**: 4.5/5 이상
- **기능 접근성**: 모든 기능 3클릭 이내 접근
- **오류 발생률**: 1% 이하

## 🎯 결론

Cross Wallet Desktop의 핵심 지갑 기능들을 ARA Chat 사이드바에 컴팩트하고 효율적으로 통합하여, 사용자가 채팅과 지갑 관리를 하나의 인터페이스에서 원활하게 수행할 수 있는 통합 환경을 제공합니다.

채팅 기능은 기존 ARA Chat 시스템을 그대로 유지하고, 지갑 기능만 Cross Wallet의 검증된 컴포넌트와 로직을 활용하여 안정적이고 사용자 친화적인 통합을 달성합니다.