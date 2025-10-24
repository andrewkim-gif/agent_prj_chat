# ARA Chat Insights - 시스템 설계 문서

## 📋 프로젝트 개요

### 현재 상황
- **기존**: ARA Insights는 YouTube 동영상 분석만 제공 (Content Trend)
- **추가**: 사용자와 ARA의 채팅 데이터를 기반으로 한 Chat Insights 탭 추가
- **목표**: 채팅 패턴, 사용자 행동, 인기 주제 등을 시각화하여 인사이트 제공

### 데이터베이스 구조
```
MongoDB: mongodb://ara:dkfkakstp~!23@10.100.100.10:3004/
Database: ara
Collection: chat
Documents:
  - type: "daily" (일별 채팅 요약 데이터)
  - type: "history" (개별 채팅 메시지 히스토리)
```

## 🎯 Chat Insights 기능 설계

### 1. 탭 구조 개선
```
기존: [ARA Insight]
개선: [Content Trend] | [Chat Insights]
```

### 2. Chat Insights 메인 기능

#### 2.1 일별 채팅 인사이트 (Daily Chat Analytics)
- **대화량 통계**: 일별/시간별 메시지 수
- **활성 사용자**: 일별 활성 사용자 수, 신규 사용자 수
- **응답 시간**: ARA 평균 응답 시간
- **만족도 분석**: 대화 완료율, 재질문 비율

#### 2.2 대화 주제 분석 (Topic Analysis)
- **인기 키워드**: 자주 언급되는 단어/구문
- **카테고리별 분포**: CrossToken, DEX, Bridge, 가격 문의 등
- **트렌드 변화**: 시간에 따른 관심사 변화
- **언어 분포**: 한국어/영어 사용 비율

#### 2.3 사용자 행동 패턴 (User Behavior)
- **대화 길이**: 평균 대화 턴 수
- **시간대별 패턴**: 활성 시간대 분석
- **세션 지속도**: 사용자 세션 평균 길이
- **재방문율**: 사용자 재방문 패턴

#### 2.4 지갑 연동 인사이트 (Wallet Integration)
- **연동률**: 지갑 주소 연동 사용자 비율
- **토큰 관련 질문**: 지갑 연동 사용자의 질문 패턴
- **서비스 사용 패턴**: DEX/Bridge 관련 문의 비율

## 🎨 UI/UX 설계

### 1. 헤더 네비게이션 수정
```tsx
// Header.tsx 수정사항
<Button onClick={handleContentTrendClick}>
  <Icon name="chart-bar" size={16} className="mr-2" />
  Content Trend
</Button>
<Button onClick={handleChatInsightsClick}>
  <Icon name="message-circle" size={16} className="mr-2" />
  Chat Insights
</Button>
```

### 2. Chat Insights 대시보드 레이아웃

#### 2.1 상단 메트릭스 카드
```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│ Total Chats │ Active Users│ Avg Response│ Satisfaction│
│   1,234     │     456     │   2.3s      │    94.5%    │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

#### 2.2 차트 섹션
```
┌─────────────────────────┬─────────────────────────┐
│   Daily Chat Volume     │   Hourly Activity       │
│   (Line Chart)          │   (Heat Map)            │
├─────────────────────────┼─────────────────────────┤
│   Topic Distribution    │   User Engagement       │
│   (Pie Chart)           │   (Bar Chart)           │
└─────────────────────────┴─────────────────────────┘
```

#### 2.3 실시간 채팅 피드
```
┌─────────────────────────────────────────────────┐
│ Recent Conversations                            │
├─────────────────────────────────────────────────┤
│ 👤 User: "CROSS 토큰 가격이 어떻게 돼?"          │
│ 🤖 ARA: "현재 CROSS 토큰은 $0.89입니다..."      │
│ ⏰ 2 minutes ago                                │
├─────────────────────────────────────────────────┤
│ 👤 User: "How to use DEX?"                     │
│ 🤖 ARA: "Here's how to use CROSS DEX..."       │
│ ⏰ 5 minutes ago                                │
└─────────────────────────────────────────────────┘
```

### 3. 컴포넌트 아키텍처

```
ChatInsightsDashboard
├── ChatMetricsGrid (일별 주요 지표)
├── ChatActivityChart (활동량 차트)
├── TopicAnalysisChart (주제 분석)
├── UserBehaviorChart (사용자 행동)
├── RecentConversations (최근 대화)
└── ChatTrendsPanel (트렌드 분석)
```

## 📊 데이터 모델 설계

### 1. Chat History Schema
```typescript
interface ChatMessage {
  _id: string;
  chatId: string;
  userId?: string;
  walletAddress?: string;
  type: 'user' | 'assistant';
  message: string;
  timestamp: Date;
  messageLength: number;
  language: 'ko' | 'en';
  category?: 'price' | 'dex' | 'bridge' | 'general';
  satisfaction?: number; // 1-5 별점
}
```

### 2. Daily Chat Summary Schema
```typescript
interface DailyChatSummary {
  _id: string;
  date: string;
  type: 'daily';
  totalMessages: number;
  totalChats: number;
  activeUsers: number;
  newUsers: number;
  avgResponseTime: number;
  avgSatisfaction: number;
  categoryDistribution: {
    price: number;
    dex: number;
    bridge: number;
    general: number;
  };
  languageDistribution: {
    ko: number;
    en: number;
  };
  hourlyActivity: number[]; // 24시간 배열
  topKeywords: string[];
  walletConnectedUsers: number;
  createdAt: Date;
}
```

## 🔧 API 엔드포인트 설계

### 1. Chat Metrics API
```typescript
// GET /api/chat-insights/metrics?startDate=2024-01-01&endDate=2024-01-31
interface ChatMetricsResponse {
  totalChats: number;
  totalMessages: number;
  activeUsers: number;
  avgResponseTime: number;
  avgSatisfaction: number;
  walletConnectedRate: number;
}
```

### 2. Chat Activity API
```typescript
// GET /api/chat-insights/activity?days=30
interface ChatActivityResponse {
  daily: Array<{
    date: string;
    messageCount: number;
    userCount: number;
    satisfaction: number;
  }>;
  hourly: number[]; // 24시간 평균 활동량
}
```

### 3. Topic Analysis API
```typescript
// GET /api/chat-insights/topics?startDate=2024-01-01&endDate=2024-01-31
interface TopicAnalysisResponse {
  categories: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
  keywords: Array<{
    word: string;
    frequency: number;
    trend: 'up' | 'down' | 'stable';
  }>;
  languages: {
    ko: number;
    en: number;
  };
}
```

### 4. Recent Conversations API
```typescript
// GET /api/chat-insights/recent?limit=20
interface RecentConversationsResponse {
  conversations: Array<{
    chatId: string;
    messages: Array<{
      type: 'user' | 'assistant';
      content: string;
      timestamp: string;
    }>;
    category: string;
    satisfaction?: number;
  }>;
}
```

## 🛠 구현 계획

### Phase 1: 기본 인프라 구축
1. **헤더 탭 추가**: Content Trend | Chat Insights
2. **라우팅 설정**: `/insights?tab=content` | `/insights?tab=chat`
3. **기본 레이아웃**: ChatInsightsDashboard 컴포넌트 생성
4. **Mock 데이터**: 개발용 샘플 데이터 생성

### Phase 2: 데이터 수집 시스템
1. **Chat Logging**: 기존 chat API에 데이터 저장 로직 추가
2. **Daily Aggregation**: 일별 요약 데이터 생성 스케줄러
3. **Database Setup**: MongoDB 컬렉션 및 인덱스 최적화

### Phase 3: API 개발
1. **Chat Metrics API**: 기본 지표 API 구현
2. **Activity Analysis API**: 활동 패턴 분석 API
3. **Topic Analysis API**: 주제 및 키워드 분석 API

### Phase 4: UI 컴포넌트 개발
1. **MetricsGrid**: 주요 지표 카드 컴포넌트
2. **ActivityChart**: 활동량 차트 (Chart.js/Recharts)
3. **TopicChart**: 주제 분포 차트
4. **ConversationFeed**: 실시간 대화 피드

### Phase 5: 고급 기능
1. **실시간 업데이트**: WebSocket 또는 Server-Sent Events
2. **필터링 기능**: 날짜, 카테고리, 언어별 필터
3. **익스포트 기능**: 인사이트 데이터 CSV/PDF 내보내기
4. **알림 시스템**: 이상 패턴 감지 및 알림

## 🎯 성공 지표 (KPI)

### 1. 기술적 지표
- **페이지 로딩 시간**: < 2초
- **API 응답 시간**: < 500ms
- **데이터 정확도**: > 99%
- **시스템 안정성**: > 99.9% 가용률

### 2. 비즈니스 지표
- **사용자 인사이트 활용도**: 대시보드 체류 시간 > 3분
- **데이터 신뢰도**: 관리자 피드백 점수 > 4.5/5
- **운영 효율성**: 사용자 패턴 파악을 통한 서비스 개선

## 🔄 향후 확장 계획

### 1. AI 인사이트 강화
- **감정 분석**: 사용자 메시지 감정 분석
- **예측 분석**: 사용자 행동 패턴 예측
- **개인화**: 사용자별 맞춤 인사이트

### 2. 외부 연동
- **Discord/Telegram**: 다른 채널의 ARA 대화 데이터 통합
- **웹 분석**: Google Analytics와의 사용자 여정 연동
- **비즈니스 인텔리전스**: Tableau/PowerBI 연동

### 3. 고급 분석
- **코호트 분석**: 사용자 그룹별 행동 패턴
- **A/B 테스트**: ARA 응답 개선을 위한 실험
- **시계열 예측**: 채팅량, 사용자 증가 예측

---

이 설계 문서는 ARA Chat Insights 기능의 전체적인 아키텍처와 구현 방향을 제시합니다. 기존 Content Trend 기능과 조화롭게 통합되어 사용자들에게 포괄적인 인사이트를 제공할 것입니다.