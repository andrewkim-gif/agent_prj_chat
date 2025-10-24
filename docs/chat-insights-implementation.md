# Chat Insights 구현 계획서

## 🎯 프로젝트 개요

### 목표
기존 ARA Insights에 Chat Insights 탭을 추가하여 사용자와 ARA의 채팅 데이터를 분석하고 시각화하는 기능 구현

### 예상 개발 기간
- **전체**: 3-4주
- **Phase 1**: 1주 (기본 구조)
- **Phase 2**: 1주 (데이터 수집)
- **Phase 3**: 1주 (API 개발)
- **Phase 4**: 1주 (UI 구현)

---

## 📋 Phase 1: 기본 인프라 구축 (1주)

### 1.1 라우팅 및 탭 시스템 개선
#### 파일 수정 목록
```
app/src/components/layout/Header.tsx
app/src/app/insights/page.tsx
app/src/components/insight/InsightDashboard.tsx
```

#### 구현 단계
1. **Header.tsx 수정**: ARA Insight 버튼을 두 개의 탭으로 분리
2. **URL 파라미터 추가**: `/insights?tab=content` | `/insights?tab=chat`
3. **조건부 렌더링**: 탭에 따른 대시보드 전환

### 1.2 타입 정의 추가
#### 새 파일 생성
```
app/src/types/chat-insight.ts
```

#### 타입 정의
```typescript
// Chat-specific data types
export interface ChatMessage {
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
  satisfaction?: number;
}

export interface DailyChatSummary {
  _id: string;
  date: string;
  type: 'daily';
  totalMessages: number;
  totalChats: number;
  activeUsers: number;
  newUsers: number;
  avgResponseTime: number;
  avgSatisfaction: number;
  categoryDistribution: Record<string, number>;
  languageDistribution: { ko: number; en: number };
  hourlyActivity: number[];
  topKeywords: string[];
  walletConnectedUsers: number;
  createdAt: Date;
}

export interface ChatMetrics {
  totalChats: number;
  totalMessages: number;
  activeUsers: number;
  avgResponseTime: number;
  satisfaction: number;
  walletConnectedRate: number;
  completionRate: number;
}

// ... 추가 타입들
```

### 1.3 기본 컴포넌트 구조 생성
#### 새 디렉토리 생성
```
app/src/components/chat-insight/
├── ChatInsightsDashboard.tsx
├── ChatMetricsGrid.tsx
├── ChatActivityChart.tsx
├── TopicAnalysisChart.tsx
├── UserBehaviorChart.tsx
├── RecentConversationsFeed.tsx
└── SatisfactionTrendsChart.tsx
```

### 1.4 Mock 데이터 생성
#### 파일 생성
```
app/src/lib/mock-chat-data.ts
```

---

## 📊 Phase 2: 데이터 수집 시스템 (1주)

### 2.1 Chat API 수정 - 데이터 로깅 추가
#### 파일 수정
```
app/src/app/api/chat/route.ts
app/src/app/api/chat/stream/route.ts
```

#### 구현 내용
1. **채팅 메시지 저장**: MongoDB에 개별 메시지 저장
2. **세션 추적**: chatId 기반 세션 관리
3. **카테고리 분류**: 메시지 내용 기반 자동 분류
4. **언어 감지**: 한국어/영어 자동 감지

#### 데이터 저장 로직
```typescript
// 채팅 메시지 저장
const chatMessage = {
  chatId,
  userId: walletAddress || generateAnonymousId(),
  type: 'user',
  message,
  timestamp: new Date(),
  messageLength: message.length,
  language: detectLanguage(message),
  category: classifyMessage(message),
  sessionStart: isNewSession,
};

await db.collection('chat').insertOne(chatMessage);

// ARA 응답 저장
const araResponse = {
  chatId,
  type: 'assistant',
  message: responseText,
  timestamp: new Date(),
  responseTime: calculateResponseTime(requestStart),
};

await db.collection('chat').insertOne(araResponse);
```

### 2.2 일별 집계 스케줄러 구현
#### 새 파일 생성
```
app/src/lib/chat-aggregator.ts
scripts/daily-chat-aggregation.js
```

#### 집계 로직
1. **일별 요약**: 매일 자정에 전날 데이터 집계
2. **실시간 업데이트**: 5분마다 현재 시간 기준 집계
3. **메트릭스 계산**: 평균 응답시간, 만족도, 카테고리 분포 등

### 2.3 MongoDB 스키마 최적화
#### 인덱스 생성
```javascript
// chat 컬렉션 인덱스
db.chat.createIndex({ "timestamp": 1 });
db.chat.createIndex({ "chatId": 1 });
db.chat.createIndex({ "type": 1, "timestamp": 1 });
db.chat.createIndex({ "category": 1, "timestamp": 1 });
db.chat.createIndex({ "language": 1, "timestamp": 1 });

// 복합 인덱스
db.chat.createIndex({
  "type": 1,
  "timestamp": 1,
  "category": 1
});
```

---

## 🔧 Phase 3: API 개발 (1주)

### 3.1 Chat Insights API 구현
#### 새 파일 생성
```
app/src/app/api/chat-insights/
├── metrics/route.ts
├── activity/route.ts
├── topics/route.ts
├── user-behavior/route.ts
├── conversations/route.ts
├── satisfaction/route.ts
└── stream/route.ts
```

### 3.2 데이터베이스 유틸리티 함수
#### 새 파일 생성
```
app/src/lib/chat-analytics.ts
```

#### 주요 함수들
```typescript
// 메트릭스 계산
export async function calculateChatMetrics(startDate: Date, endDate: Date) {
  const pipeline = [
    { $match: { timestamp: { $gte: startDate, $lte: endDate } } },
    { $group: {
      _id: null,
      totalChats: { $addToSet: "$chatId" },
      totalMessages: { $sum: 1 },
      avgResponseTime: { $avg: "$responseTime" },
      // ... 추가 집계
    }},
  ];

  return await db.collection('chat').aggregate(pipeline).toArray();
}

// 주제 분석
export async function analyzeTopics(startDate: Date, endDate: Date) {
  // 카테고리별 분포 계산
  // 키워드 추출 및 빈도 분석
  // 언어별 분포 계산
}

// 사용자 행동 분석
export async function analyzeUserBehavior(startDate: Date, endDate: Date) {
  // 세션 지속 시간 분석
  // 대화 턴 수 분석
  // 재방문율 계산
}
```

### 3.3 실시간 스트리밍 구현
#### Server-Sent Events 구현
```typescript
// app/src/app/api/chat-insights/stream/route.ts
export async function GET(request: NextRequest) {
  const stream = new ReadableStream({
    start(controller) {
      // 실시간 채팅 이벤트 스트림
      const interval = setInterval(async () => {
        const recentActivity = await getRecentActivity();
        const data = `data: ${JSON.stringify(recentActivity)}\n\n`;
        controller.enqueue(new TextEncoder().encode(data));
      }, 5000);

      // 정리 함수
      return () => clearInterval(interval);
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

---

## 🎨 Phase 4: UI 컴포넌트 구현 (1주)

### 4.1 ChatInsightsDashboard 메인 컴포넌트
#### 구조
```typescript
export function ChatInsightsDashboard() {
  const [dateRange, setDateRange] = useState(defaultDateRange);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // 데이터 페칭
  const { data: metrics } = useChatMetrics(dateRange);
  const { data: activity } = useChatActivity(dateRange);
  const { data: topics } = useTopicAnalysis(dateRange);

  return (
    <div className="space-y-6">
      {/* 날짜 선택 및 필터 */}
      <ChatFilters
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        category={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      {/* 메트릭스 그리드 */}
      <ChatMetricsGrid metrics={metrics} loading={!metrics} />

      {/* 차트 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChatActivityChart data={activity} />
        <TopicAnalysisChart data={topics} />
        <UserBehaviorChart data={userBehavior} />
        <SatisfactionTrendsChart data={satisfaction} />
      </div>

      {/* 최근 대화 피드 */}
      <RecentConversationsFeed />
    </div>
  );
}
```

### 4.2 개별 차트 컴포넌트 구현
#### ChatMetricsGrid.tsx
```typescript
export function ChatMetricsGrid({ metrics, loading }: Props) {
  const metricCards = [
    {
      title: "Total Chats",
      value: metrics?.totalChats || 0,
      icon: "message-circle",
      trend: metrics?.trends?.chatsChange,
      format: "number"
    },
    {
      title: "Active Users",
      value: metrics?.activeUsers || 0,
      icon: "users",
      trend: metrics?.trends?.usersChange,
      format: "number"
    },
    // ... 추가 메트릭스
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metricCards.map((metric) => (
        <MetricCard key={metric.title} {...metric} loading={loading} />
      ))}
    </div>
  );
}
```

#### ChatActivityChart.tsx
```typescript
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function ChatActivityChart({ data }: Props) {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Chat Activity</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data?.daily || []}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="totalChats"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="activeUsers"
            stroke="hsl(var(--secondary))"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

### 4.3 React Query 훅 구현
#### 새 파일 생성
```
app/src/hooks/useChatInsights.ts
```

```typescript
export function useChatMetrics(dateRange: DateRange) {
  return useQuery({
    queryKey: ['chat-metrics', dateRange],
    queryFn: () => fetchChatMetrics(dateRange),
    staleTime: 5 * 60 * 1000, // 5분
    cacheTime: 10 * 60 * 1000, // 10분
  });
}

export function useChatActivity(dateRange: DateRange) {
  return useQuery({
    queryKey: ['chat-activity', dateRange],
    queryFn: () => fetchChatActivity(dateRange),
    staleTime: 5 * 60 * 1000,
  });
}

export function useRealtimeChatUpdates() {
  return useQuery({
    queryKey: ['realtime-chat'],
    queryFn: () => {
      // Server-Sent Events 연결
      const eventSource = new EventSource('/api/chat-insights/stream');
      return new Promise((resolve) => {
        eventSource.onmessage = (event) => {
          resolve(JSON.parse(event.data));
        };
      });
    },
    refetchInterval: 10000, // 10초마다 폴링
  });
}
```

---

## 🧪 테스트 계획

### 1. 단위 테스트
```
tests/
├── chat-insights/
│   ├── ChatMetricsGrid.test.tsx
│   ├── ChatActivityChart.test.tsx
│   ├── chat-analytics.test.ts
│   └── api-endpoints.test.ts
```

### 2. 통합 테스트
- MongoDB 데이터 집계 테스트
- API 엔드포인트 전체 플로우 테스트
- 실시간 업데이트 테스트

### 3. E2E 테스트
- 탭 전환 및 네비게이션
- 차트 인터랙션
- 반응형 디자인 검증

---

## 📱 배포 및 모니터링

### 1. 성능 모니터링
- API 응답 시간 모니터링
- 메모리 사용량 추적
- 데이터베이스 쿼리 성능

### 2. 사용자 피드백 수집
- 대시보드 사용 패턴 분석
- 로딩 시간 측정
- 오류 발생 추적

### 3. 점진적 개선
- 주간 성능 리뷰
- 사용자 요청사항 반영
- 새로운 인사이트 추가

---

## 🔧 기술 스택 요약

### Frontend
- **Framework**: Next.js 15.5.2 (App Router)
- **UI Library**: shadcn/ui + Tailwind CSS
- **Charts**: Recharts
- **State Management**: TanStack Query
- **Icons**: @mynaui/icons-react

### Backend
- **API**: Next.js API Routes
- **Database**: MongoDB
- **Caching**: In-memory (추후 Redis)
- **Real-time**: Server-Sent Events

### DevOps
- **Development**: Port 3009
- **Production**: Port 3001
- **Database**: External MongoDB instance

---

이 구현 계획을 따라 진행하면 체계적이고 확장 가능한 Chat Insights 시스템을 구축할 수 있습니다. 각 Phase별로 점진적으로 개발하여 안정성을 확보하고, 사용자 피드백을 반영해 지속적으로 개선해 나갈 수 있습니다.