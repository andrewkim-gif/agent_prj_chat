# Cross Wallet 통합 구현 계획서

## 🚀 구현 로드맵

### Phase 1: 기본 통합 (Week 1-2)

#### 목표
Cross Wallet의 핵심 기능을 ARA Chat 사이드바에 기본적으로 통합

#### 주요 작업

##### 1.1 개발 환경 설정
```bash
# Cross Wallet 종속성 설치 및 설정
npm install zustand decimal.js
npm install @radix-ui/react-tabs @radix-ui/react-avatar
npm install recharts react-qr-code
```

##### 1.2 CrossWalletProvider 구현
**파일**: `app/src/providers/CrossWalletProvider.tsx`

**기능**:
- Cross Wallet 상태 관리 연결
- ARA Chat 기존 블록체인 상태와 통합
- 토큰 잔액 정보 제공
- 계정 관리 기능

**구현 구조**:
```typescript
interface CrossWalletState {
  accounts: Account[];
  currentAccount: Account | null;
  tokens: TokenWithChainInfo[];
  totalAssets: string;
  currency: Currency;
  isLoading: boolean;
  error: string | null;
}

interface CrossWalletActions {
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  selectAccount: (accountId: string) => void;
  refreshBalance: () => Promise<void>;
  setCurrency: (currency: Currency) => void;
}
```

##### 1.3 Zustand Store 어댑터 구현
**파일**: `app/src/stores/crossWalletStore.ts`

**기능**:
- Cross Wallet의 config-store 로직 이식
- 지속성 스토리지 연동
- ARA Chat 기존 상태와 동기화

##### 1.4 CompactTotalAssets 컴포넌트
**파일**: `app/src/components/wallet/CompactTotalAssets.tsx`

**기능**:
- 전체 자산 가치 표시 (축소형)
- 자산 숨기기/보이기 토글
- 송금 버튼 (간소화)

**디자인**:
```typescript
interface CompactTotalAssetsProps {
  className?: string;
  onSendClick?: () => void;
  showSendButton?: boolean;
  compact?: boolean; // 더 작은 버전
}
```

##### 1.5 기존 ChatSidebar 통합
**파일**: `app/src/components/chat/ChatSidebar.tsx`

**변경사항**:
- CompactTotalAssets 추가
- 기존 WalletDashboard와 조화롭게 배치
- 레이아웃 최적화

#### 예상 결과물
- 사이드바에 전체 자산 정보 표시
- 기본적인 지갑 연결/해제 기능
- 자산 숨기기/보이기 토글

---

### Phase 2: 토큰 목록 및 기본 액션 (Week 3-4)

#### 목표
토큰 목록 표시 및 기본적인 지갑 액션 구현

#### 주요 작업

##### 2.1 CompactTokenList 컴포넌트
**파일**: `app/src/components/wallet/CompactTokenList.tsx`

**기능**:
- 상위 5개 토큰 표시
- 토큰별 잔액, 가격, 변동률
- 더보기 기능
- 가상화 스크롤 (대량 토큰 대응)

**구조**:
```typescript
interface CompactTokenListProps {
  maxItems?: number;
  showMore?: boolean;
  onTokenClick?: (token: TokenData) => void;
  onViewAll?: () => void;
}
```

##### 2.2 CompactTokenItem 컴포넌트
**파일**: `app/src/components/wallet/CompactTokenItem.tsx`

**기능**:
- 토큰 아이콘, 이름, 심볼
- 잔액 및 USD 가치
- 24시간 변동률 (색상 구분)
- 클릭 인터랙션

##### 2.3 WalletQuickActions 컴포넌트
**파일**: `app/src/components/wallet/WalletQuickActions.tsx`

**기능**:
- Send (송금)
- Receive (받기)
- Swap (교환)
- History (내역)

**디자인**:
```typescript
interface QuickAction {
  id: 'send' | 'receive' | 'swap' | 'history';
  label: string;
  icon: string;
  enabled: boolean;
}
```

##### 2.4 토큰 잔액 조회 Hook
**파일**: `app/src/hooks/useCrossWalletBalance.ts`

**기능**:
- Cross Wallet의 use-balance 로직 이식
- React Query 캐싱 전략
- 에러 처리 및 재시도

#### 예상 결과물
- 토큰 목록 표시 기능
- 기본적인 빠른 액션 버튼
- 토큰 클릭 시 상세 정보 표시

---

### Phase 3: 고급 기능 및 모달 (Week 5-6)

#### 목표
송금, 받기 등 고급 지갑 기능 구현

#### 주요 작업

##### 3.1 SendTokenModal 구현
**파일**: `app/src/components/wallet/SendTokenModal.tsx`

**기능**:
- 수신자 주소 입력
- 토큰 선택
- 금액 입력 및 검증
- 수수료 계산
- 트랜잭션 확인

##### 3.2 ReceiveModal 구현
**파일**: `app/src/components/wallet/ReceiveModal.tsx`

**기능**:
- 지갑 주소 QR 코드
- 주소 복사 기능
- 네트워크별 주소 표시

##### 3.3 TokenDetailDrawer 구현
**파일**: `app/src/components/wallet/TokenDetailDrawer.tsx`

**기능**:
- 토큰 상세 정보
- 가격 차트 (간소화)
- 거래 내역
- 빠른 액션 (송금/교환)

##### 3.4 TransactionHistory 컴포넌트
**파일**: `app/src/components/wallet/TransactionHistory.tsx`

**기능**:
- 최근 거래 내역 (10개)
- 거래 상태 표시
- 블록 익스플로러 링크

#### 예상 결과물
- 완전한 송금 기능
- QR 코드 기반 받기 기능
- 토큰 상세 정보 및 차트
- 거래 내역 조회

---

### Phase 4: 최적화 및 UX 개선 (Week 7-8)

#### 목표
성능 최적화 및 사용자 경험 향상

#### 주요 작업

##### 4.1 성능 최적화
- **가상화 스크롤**: 대량 토큰 목록 처리
- **이미지 최적화**: 토큰 아이콘 lazy loading
- **메모화**: 비싼 계산 캐싱
- **배치 요청**: 토큰 가격 정보 일괄 조회

##### 4.2 애니메이션 및 인터랙션
- **마이크로 인터랙션**: 버튼 호버/클릭 효과
- **로딩 애니메이션**: 스켈레톤 UI
- **트랜지션**: 모달/드로어 애니메이션
- **피드백**: 성공/오류 토스트

##### 4.3 접근성 개선
- **키보드 내비게이션**: 모든 기능 키보드 접근 가능
- **스크린 리더**: ARIA 라벨 및 설명
- **고대비 모드**: 다크/라이트 테마 최적화
- **폰트 크기**: 사용자 설정 반영

##### 4.4 에러 처리 강화
- **네트워크 오류**: 재시도 로직
- **트랜잭션 실패**: 명확한 오류 메시지
- **연결 끊김**: 자동 재연결
- **폴백 UI**: 데이터 로딩 실패 시 대체 UI

#### 예상 결과물
- 부드러운 사용자 경험
- 안정적인 에러 처리
- 접근성 준수
- 빠른 응답 속도

---

## 🛠️ 기술적 구현 상세

### 1. 상태 관리 아키텍처

#### Zustand Store 구조
```typescript
// app/src/stores/crossWalletStore.ts
export interface CrossWalletStore {
  // 계정 관리
  accounts: Account[];
  currentAccount: Account | null;

  // 토큰 및 잔액
  tokens: TokenWithChainInfo[];
  isLoadingBalance: boolean;
  lastBalanceUpdate: number;

  // UI 상태
  isShowTotalAssets: boolean;
  currency: Currency;
  theme: 'light' | 'dark';

  // 액션
  setCurrentAccount: (account: Account) => void;
  updateTokenBalance: (tokens: TokenWithChainInfo[]) => void;
  toggleShowTotalAssets: () => void;
  setCurrency: (currency: Currency) => void;
}
```

#### Hook 통합 전략
```typescript
// app/src/hooks/useCrossWallet.ts
export function useCrossWallet() {
  // Cross Wallet 상태
  const crossWalletState = useCrossWalletStore();

  // ARA Chat 기존 상태
  const { wallet, crossAccount } = useBlockchainWallet();

  // 통합된 상태 반환
  return {
    // 연결 상태
    isConnected: crossWalletState.currentAccount !== null || wallet.isConnected,
    account: crossWalletState.currentAccount || crossAccount,

    // 토큰 정보
    tokens: crossWalletState.tokens,
    totalAssets: calculateTotalAssets(crossWalletState.tokens),

    // 액션
    connect: async () => { /* 통합 연결 로직 */ },
    disconnect: () => { /* 통합 해제 로직 */ },

    // 기존 ARA 기능 유지
    sendMessage: wallet.sendMessage,
  };
}
```

### 2. 컴포넌트 구조

#### 사이드바 레이아웃
```typescript
// app/src/components/chat/ChatSidebar.tsx
export function ChatSidebar({ onSendMessage }: Props) {
  return (
    <div className="w-80 bg-card border-r border-border h-full flex flex-col pt-16">
      {/* 기존 WalletDashboard (간소화) */}
      <WalletDashboard compact />

      {/* 새로운 Cross Wallet 통합 섹션 */}
      <div className="flex-1 overflow-y-auto">
        <CompactTotalAssets />
        <CompactTokenList maxItems={5} />
        <WalletQuickActions />
      </div>

      {/* 기존 WalletSelector 유지 */}
      <WalletSelector />
    </div>
  );
}
```

### 3. 데이터 플로우

#### 토큰 정보 업데이트 플로우
```
1. 사용자 지갑 연결
   ↓
2. CrossWalletProvider에서 계정 정보 획득
   ↓
3. useCrossWalletBalance Hook에서 토큰 목록 조회
   ↓
4. TanStack Query를 통한 캐싱 및 백그라운드 업데이트
   ↓
5. Zustand Store에 상태 저장
   ↓
6. 컴포넌트 자동 리렌더링
```

#### 송금 트랜잭션 플로우
```
1. SendTokenModal에서 송금 정보 입력
   ↓
2. 트랜잭션 데이터 생성 및 검증
   ↓
3. 사용자 확인 (비밀번호/서명)
   ↓
4. 블록체인 네트워크에 트랜잭션 전송
   ↓
5. 트랜잭션 해시 반환 및 상태 추적
   ↓
6. 성공/실패 피드백 및 잔액 업데이트
```

## 📋 체크리스트

### Phase 1 완료 기준
- [ ] CrossWalletProvider 구현 완료
- [ ] CompactTotalAssets 컴포넌트 작동
- [ ] 기존 ChatSidebar에 성공적으로 통합
- [ ] 지갑 연결/해제 기능 정상 작동
- [ ] 자산 숨기기/보이기 토글 작동

### Phase 2 완료 기준
- [ ] CompactTokenList 컴포넌트 구현
- [ ] 토큰 목록 정상 표시 (잔액, 가격, 변동률)
- [ ] WalletQuickActions 버튼 구현
- [ ] 토큰 클릭 시 상세 정보 모달
- [ ] 더보기 기능 구현

### Phase 3 완료 기준
- [ ] SendTokenModal 완전 구현
- [ ] ReceiveModal (QR 코드 포함) 구현
- [ ] TokenDetailDrawer 구현
- [ ] TransactionHistory 조회 기능
- [ ] 모든 모달의 반응형 디자인

### Phase 4 완료 기준
- [ ] 성능 최적화 완료 (가상화 스크롤 등)
- [ ] 애니메이션 및 마이크로 인터랙션
- [ ] 접근성 테스트 통과
- [ ] 에러 처리 및 폴백 UI
- [ ] 전체 기능 QA 테스트 완료

## 🎯 성공 지표

### 성능 지표
- **초기 로딩**: 3초 이내
- **토큰 목록 로딩**: 1초 이내
- **송금 트랜잭션**: 30초 이내 처리

### 기능 지표
- **지갑 연결 성공률**: 95% 이상
- **토큰 정보 조회 성공률**: 98% 이상
- **송금 성공률**: 99% 이상

### UX 지표
- **인터페이스 직관성**: 신규 사용자 10분 이내 주요 기능 사용
- **에러 발생률**: 1% 이하
- **사용자 만족도**: 4.5/5 이상

이 구현 계획을 통해 Cross Wallet Desktop의 핵심 기능들을 ARA Chat 사이드바에 단계적으로 통합하여 완성도 높은 지갑 통합 환경을 구축할 수 있습니다.