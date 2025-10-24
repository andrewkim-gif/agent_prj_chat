# Chat Insights - 컴포넌트 설계 명세서

## 📊 데이터 시각화 컴포넌트 계획

### 1. ChatMetricsGrid (메트릭스 그리드)
#### 기능
- 일별/주별/월별 핵심 지표 표시
- 실시간 업데이트 지원
- 클릭 시 상세 차트로 드릴다운

#### 표시 메트릭스
```typescript
interface ChatMetrics {
  totalChats: number;        // 총 대화 수
  activeUsers: number;       // 활성 사용자
  avgResponseTime: number;   // 평균 응답 시간 (초)
  satisfaction: number;      // 만족도 (%)
  walletConnected: number;   // 지갑 연동률 (%)
  completionRate: number;    // 대화 완료율 (%)
}
```

#### 디자인 스타일
- 기존 MetricsGrid와 동일한 카드 스타일
- 아이콘: message-circle, users, clock, star, wallet, check-circle
- 색상: 기본 primary/muted 컬러 시스템 유지

### 2. ChatActivityChart (활동량 차트)
#### 기능
- 시간대별 채팅 활동량 히트맵
- 일별 대화량 라인 차트
- 주간/월간 패턴 분석

#### 차트 타입
1. **시간대별 히트맵** (24시간 x 7일)
   - X축: 시간 (0-23시)
   - Y축: 요일 (월-일)
   - 색상 강도: 대화량 비례

2. **일별 활동량 라인 차트**
   - X축: 날짜
   - Y축: 대화 수
   - 라인: 총 대화량, 신규 사용자

#### 데이터 구조
```typescript
interface ChatActivity {
  hourlyHeatmap: number[][]; // [day][hour] = count
  dailyActivity: Array<{
    date: string;
    totalChats: number;
    newUsers: number;
    activeUsers: number;
  }>;
}
```

### 3. TopicAnalysisChart (주제 분석 차트)
#### 기능
- 대화 카테고리별 분포 파이차트
- 인기 키워드 워드클라우드
- 트렌딩 토픽 순위

#### 차트 구성
1. **카테고리 분포** (도넛 차트)
   - 가격 문의 (Price)
   - DEX 관련 (DEX)
   - 브릿지 사용 (Bridge)
   - 일반 질문 (General)
   - 기타 (Others)

2. **키워드 트렌드** (막대 차트)
   - 상위 10개 키워드
   - 전주 대비 증감률 표시

3. **언어 분포** (게이지 차트)
   - 한국어 vs 영어 비율

#### 데이터 구조
```typescript
interface TopicAnalysis {
  categories: Array<{
    name: string;
    count: number;
    percentage: number;
    color: string;
  }>;
  keywords: Array<{
    word: string;
    frequency: number;
    trend: number; // +/-% 변화율
  }>;
  languages: {
    korean: number;
    english: number;
  };
}
```

### 4. UserEngagementChart (사용자 참여도 차트)
#### 기능
- 세션 지속 시간 분포
- 대화 턴 수 분포
- 재방문 패턴 분석

#### 차트 타입
1. **세션 시간 분포** (히스토그램)
   - X축: 세션 시간 (분)
   - Y축: 사용자 수
   - 구간: <1분, 1-5분, 5-15분, 15-30분, 30분+

2. **대화 턴 분포** (막대 차트)
   - X축: 대화 턴 수 (1, 2-3, 4-7, 8-15, 16+)
   - Y축: 대화 수

3. **재방문 패턴** (라인 차트)
   - X축: 일차 (1일차, 7일차, 30일차)
   - Y축: 재방문률 (%)

### 5. RecentConversationsFeed (최근 대화 피드)
#### 기능
- 실시간 대화 스트림
- 카테고리별 필터링
- 대화 상세 모달

#### 표시 정보
```typescript
interface ConversationItem {
  chatId: string;
  timestamp: Date;
  category: string;
  preview: {
    userMessage: string;
    araResponse: string;
  };
  satisfaction?: number;
  walletConnected: boolean;
  language: 'ko' | 'en';
}
```

#### 디자인 요소
- 사용자 메시지: 오른쪽 정렬, 파란색 말풍선
- ARA 응답: 왼쪽 정렬, 회색 말풍선
- 카테고리 태그: 색상 구분
- 시간 스탬프: 상대 시간 표시

### 6. SatisfactionTrendsChart (만족도 트렌드)
#### 기능
- 시간별 만족도 변화 추이
- 카테고리별 만족도 비교
- 불만족 요인 분석

#### 차트 타입
1. **만족도 트렌드** (라인 차트)
   - X축: 날짜
   - Y축: 평균 만족도 (1-5점)
   - 목표선: 4.0점

2. **카테고리별 만족도** (레이더 차트)
   - 각 꼭짓점: 카테고리 (Price, DEX, Bridge, General)
   - 반지름: 만족도 점수

## 🎨 UI/UX 설계 세부사항

### 1. 색상 시스템
```typescript
const chatInsightsColors = {
  primary: 'hsl(var(--primary))',
  secondary: 'hsl(var(--secondary))',
  accent: 'hsl(var(--accent))',
  categories: {
    price: '#3B82F6',      // Blue
    dex: '#10B981',        // Green
    bridge: '#F59E0B',     // Yellow
    general: '#8B5CF6',    // Purple
    others: '#6B7280'      // Gray
  },
  satisfaction: {
    excellent: '#10B981',   // Green
    good: '#84CC16',       // Lime
    average: '#F59E0B',    // Yellow
    poor: '#EF4444',       // Red
    terrible: '#DC2626'    // Dark Red
  }
}
```

### 2. 애니메이션 및 인터랙션
```typescript
// 차트 애니메이션 설정
const chartAnimations = {
  duration: 1000,
  easing: 'ease-in-out',
  delay: (index: number) => index * 100,
  hover: {
    scale: 1.05,
    duration: 200
  }
}

// 실시간 업데이트 애니메이션
const realTimeEffects = {
  newMessage: 'slide-in-bottom',
  metricUpdate: 'bounce-subtle',
  chartUpdate: 'fade-transition'
}
```

### 3. 반응형 디자인
```typescript
// 브레이크포인트별 레이아웃
const responsiveLayout = {
  mobile: {
    cols: 1,
    chartHeight: 250,
    feedItems: 3
  },
  tablet: {
    cols: 2,
    chartHeight: 300,
    feedItems: 5
  },
  desktop: {
    cols: 3,
    chartHeight: 350,
    feedItems: 10
  }
}
```

### 4. 접근성 고려사항
- **키보드 내비게이션**: 모든 차트 요소 Tab 접근 가능
- **스크린 리더**: ARIA 라벨 및 설명 제공
- **색상 대비**: WCAG 2.1 AA 기준 준수
- **대체 텍스트**: 차트 데이터의 텍스트 요약 제공

## 📱 모바일 최적화

### 1. 터치 인터랙션
- **차트 줌**: 핀치 줌 지원
- **스와이프**: 시간 범위 변경
- **탭**: 데이터 포인트 상세 정보

### 2. 성능 최적화
- **레이지 로딩**: 뷰포트 내 차트만 렌더링
- **데이터 페이징**: 대화 피드 무한 스크롤
- **메모이제이션**: 차트 컴포넌트 React.memo 적용

### 3. 네트워크 최적화
- **데이터 압축**: API 응답 gzip 압축
- **캐싱**: 1분간 메트릭스 캐시
- **프리로딩**: 다음 시간 범위 데이터 미리 로드

## 🔧 기술 스택

### 1. 차트 라이브러리
- **Primary**: Recharts (React 최적화)
- **Alternative**: Chart.js (고급 차트 타입)
- **특수 용도**: D3.js (워드클라우드, 히트맵)

### 2. 상태 관리
- **로컬 상태**: React useState/useReducer
- **서버 상태**: TanStack Query (구 React Query)
- **글로벌 상태**: Zustand (필요시)

### 3. 스타일링
- **CSS Framework**: Tailwind CSS
- **컴포넌트**: shadcn/ui 확장
- **아이콘**: @mynaui/icons-react

---

이 컴포넌트 설계는 기존 ARA Insights의 디자인 시스템과 일관성을 유지하면서, 채팅 데이터의 특성에 맞는 시각화를 제공합니다.