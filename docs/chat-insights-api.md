# Chat Insights API 설계 명세서

## 🚀 API 엔드포인트 구조

### Base URL
```
/api/chat-insights/
```

### Authentication
- 현재는 인증 없음 (내부 관리용)
- 추후 관리자 인증 추가 예정

---

## 📊 1. Chat Metrics API

### `GET /api/chat-insights/metrics`
**목적**: 핵심 채팅 지표 조회

#### Query Parameters
```typescript
interface MetricsParams {
  startDate?: string;     // ISO 8601 (기본: 30일 전)
  endDate?: string;       // ISO 8601 (기본: 오늘)
  granularity?: 'day' | 'week' | 'month'; // 기본: day
}
```

#### Response
```typescript
interface ChatMetricsResponse {
  success: boolean;
  data: {
    totalChats: number;
    totalMessages: number;
    activeUsers: number;
    newUsers: number;
    avgResponseTime: number; // 초 단위
    avgSatisfaction: number; // 1-5점
    walletConnectedRate: number; // 백분율
    completionRate: number; // 백분율
    trends: {
      chatsChange: number; // 전기간 대비 증감률
      usersChange: number;
      satisfactionChange: number;
      responseTimeChange: number;
    }
  };
  cache: {
    timestamp: string;
    expiresIn: number; // 초
  };
}
```

#### Example Request
```bash
GET /api/chat-insights/metrics?startDate=2024-01-01&endDate=2024-01-31&granularity=day
```

#### Example Response
```json
{
  "success": true,
  "data": {
    "totalChats": 1234,
    "totalMessages": 3456,
    "activeUsers": 567,
    "newUsers": 123,
    "avgResponseTime": 2.3,
    "avgSatisfaction": 4.2,
    "walletConnectedRate": 34.5,
    "completionRate": 87.2,
    "trends": {
      "chatsChange": 12.5,
      "usersChange": 8.3,
      "satisfactionChange": 2.1,
      "responseTimeChange": -5.4
    }
  },
  "cache": {
    "timestamp": "2024-01-31T09:00:00Z",
    "expiresIn": 300
  }
}
```

---

## 📈 2. Chat Activity API

### `GET /api/chat-insights/activity`
**목적**: 시간별/일별 채팅 활동 패턴 조회

#### Query Parameters
```typescript
interface ActivityParams {
  startDate?: string;
  endDate?: string;
  type?: 'hourly' | 'daily' | 'weekly'; // 기본: daily
  timezone?: string; // 기본: UTC
}
```

#### Response
```typescript
interface ChatActivityResponse {
  success: boolean;
  data: {
    daily: Array<{
      date: string;
      totalChats: number;
      totalMessages: number;
      activeUsers: number;
      newUsers: number;
      avgSatisfaction: number;
      walletConnectedUsers: number;
    }>;
    hourlyHeatmap: number[][]; // [day][hour] = messageCount
    weeklyPattern: Array<{
      dayOfWeek: number; // 0=일요일, 6=토요일
      avgActivity: number;
      peakHour: number;
    }>;
    summary: {
      peakDay: string;
      peakHour: number;
      averageDaily: number;
      weekendRatio: number; // 주말 대비 평일 활동비
    };
  };
}
```

#### Example Request
```bash
GET /api/chat-insights/activity?startDate=2024-01-01&endDate=2024-01-31&type=daily
```

---

## 🏷 3. Topic Analysis API

### `GET /api/chat-insights/topics`
**목적**: 대화 주제 및 카테고리 분석

#### Query Parameters
```typescript
interface TopicsParams {
  startDate?: string;
  endDate?: string;
  limit?: number; // 키워드 개수 제한 (기본: 50)
  language?: 'ko' | 'en' | 'all'; // 기본: all
}
```

#### Response
```typescript
interface TopicAnalysisResponse {
  success: boolean;
  data: {
    categories: Array<{
      name: 'price' | 'dex' | 'bridge' | 'general' | 'wallet' | 'support';
      count: number;
      percentage: number;
      avgSatisfaction: number;
      trendChange: number; // 전기간 대비 증감률
    }>;
    keywords: Array<{
      word: string;
      frequency: number;
      category: string;
      sentiment: number; // -1 ~ 1
      trendChange: number;
      relatedKeywords: string[];
    }>;
    languages: {
      korean: {
        count: number;
        percentage: number;
        avgSatisfaction: number;
      };
      english: {
        count: number;
        percentage: number;
        avgSatisfaction: number;
      };
    };
    emergingTopics: Array<{
      topic: string;
      frequency: number;
      growthRate: number;
      firstSeen: string;
    }>;
  };
}
```

---

## 👥 4. User Behavior API

### `GET /api/chat-insights/user-behavior`
**목적**: 사용자 행동 패턴 및 참여도 분석

#### Query Parameters
```typescript
interface UserBehaviorParams {
  startDate?: string;
  endDate?: string;
  cohort?: 'new' | 'returning' | 'all'; // 기본: all
}
```

#### Response
```typescript
interface UserBehaviorResponse {
  success: boolean;
  data: {
    sessionDuration: {
      bins: Array<{
        range: string; // "0-1min", "1-5min", etc.
        count: number;
        percentage: number;
      }>;
      average: number; // 초 단위
      median: number;
    };
    conversationLength: {
      bins: Array<{
        turnCount: string; // "1", "2-3", "4-7", etc.
        count: number;
        percentage: number;
      }>;
      average: number;
    };
    retentionRates: {
      day1: number;
      day7: number;
      day30: number;
    };
    userJourney: Array<{
      step: number;
      action: string;
      userCount: number;
      dropoffRate: number;
    }>;
    engagementScore: {
      high: number; // 3+ 대화
      medium: number; // 2 대화
      low: number; // 1 대화
    };
  };
}
```

---

## 💬 5. Recent Conversations API

### `GET /api/chat-insights/conversations`
**목적**: 최근 대화 피드 조회

#### Query Parameters
```typescript
interface ConversationsParams {
  limit?: number; // 기본: 20, 최대: 100
  offset?: number; // 페이징용
  category?: string; // 카테고리 필터
  language?: 'ko' | 'en' | 'all';
  satisfaction?: number; // 최소 만족도 필터
  walletConnected?: boolean;
  search?: string; // 메시지 내용 검색
}
```

#### Response
```typescript
interface ConversationsResponse {
  success: boolean;
  data: {
    conversations: Array<{
      chatId: string;
      timestamp: string;
      category: string;
      language: 'ko' | 'en';
      duration: number; // 초
      messageCount: number;
      satisfaction?: number;
      walletConnected: boolean;
      preview: {
        userMessage: string; // 첫 번째 사용자 메시지
        araResponse: string; // 첫 번째 ARA 응답
      };
      summary?: string; // AI 생성 요약
    }>;
    pagination: {
      total: number;
      limit: number;
      offset: number;
      hasMore: boolean;
    };
  };
}
```

---

## 📊 6. Satisfaction Trends API

### `GET /api/chat-insights/satisfaction`
**목적**: 만족도 트렌드 및 분석

#### Response
```typescript
interface SatisfactionResponse {
  success: boolean;
  data: {
    trends: Array<{
      date: string;
      avgSatisfaction: number;
      responseCount: number;
      distribution: {
        excellent: number; // 5점
        good: number; // 4점
        average: number; // 3점
        poor: number; // 2점
        terrible: number; // 1점
      };
    }>;
    byCategory: Array<{
      category: string;
      avgSatisfaction: number;
      responseCount: number;
      improvement: number; // 전기간 대비 개선도
    }>;
    topIssues: Array<{
      issue: string;
      frequency: number;
      avgSatisfaction: number;
      category: string;
    }>;
    recommendations: Array<{
      priority: 'high' | 'medium' | 'low';
      area: string;
      description: string;
      potentialImpact: number; // 예상 만족도 개선치
    }>;
  };
}
```

---

## 🔄 7. Real-time Updates API

### `GET /api/chat-insights/stream` (Server-Sent Events)
**목적**: 실시간 채팅 활동 스트림

#### Response Stream
```typescript
// Event Types
type StreamEvent =
  | 'new-conversation'
  | 'conversation-ended'
  | 'metrics-update'
  | 'satisfaction-update';

interface StreamData {
  event: StreamEvent;
  timestamp: string;
  data: any; // 이벤트 타입별 데이터
}
```

#### Example Stream Events
```javascript
// New conversation started
data: {
  "event": "new-conversation",
  "timestamp": "2024-01-31T10:15:30Z",
  "data": {
    "chatId": "chat_123",
    "category": "price",
    "language": "ko",
    "walletConnected": false
  }
}

// Metrics updated
data: {
  "event": "metrics-update",
  "timestamp": "2024-01-31T10:16:00Z",
  "data": {
    "totalChats": 1235,
    "activeUsers": 568,
    "avgResponseTime": 2.2
  }
}
```

---

## 🛠 구현 고려사항

### 1. 성능 최적화
- **캐싱**: Redis 캐시 (5분 TTL)
- **인덱싱**: MongoDB 복합 인덱스
- **페이징**: 커서 기반 페이징
- **압축**: gzip 응답 압축

### 2. 에러 처리
```typescript
interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}
```

### 3. Rate Limiting
- **관리자**: 1000 req/min
- **일반**: 100 req/min
- **실시간**: 연결당 1개

### 4. 모니터링
- **응답 시간**: < 500ms 목표
- **에러율**: < 1% 유지
- **캐시 히트율**: > 80% 목표

---

이 API 설계는 확장 가능하고 성능을 고려한 채팅 인사이트 시스템의 백엔드 아키텍처를 제공합니다.