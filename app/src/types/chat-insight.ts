// Chat Insights 관련 타입 정의

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
  category?: 'price' | 'dex' | 'bridge' | 'wallet' | 'general' | 'support';
  satisfaction?: number; // 1-5 별점
  responseTime?: number; // ms (assistant 메시지인 경우)
  platform?: 'web' | 'mobile' | 'api';
  browser?: string;
  deviceType?: 'desktop' | 'mobile' | 'tablet';
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
  categoryDistribution: {
    price: number;
    dex: number;
    bridge: number;
    wallet: number;
    general: number;
    support: number;
  };
  languageDistribution: {
    ko: number;
    en: number;
  };
  platformDistribution: {
    web: number;
    mobile: number;
    api: number;
  };
  hourlyActivity: number[]; // 24시간 배열
  topKeywords: string[];
  topQuestions: string[];
  walletConnectedUsers: number;
  completionRate: number; // 대화 완료율
  createdAt: Date;
}

export interface ChatMetrics {
  totalChats: number;
  totalRecords: number;
  dateRange: string;
  platformDistribution: {
    web: number;
    mobile: number;
    api: number;
  };
  languageDistribution: {
    korean: number;
    english: number;
  };
  dailyAverage: number;
  recentActivity: {
    last7Days: number;
    last30Days: number;
  };
  topCategories: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
}

export interface ChatActivity {
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
}

export interface TopicAnalysis {
  categories: Array<{
    name: 'price' | 'dex' | 'bridge' | 'wallet' | 'general' | 'support';
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
}

export interface PlatformAnalysis {
  platforms: {
    web: {
      desktop: number;
      tablet: number;
    };
    mobile: {
      ios: number;
      android: number;
      pwa: number;
    };
    api: {
      direct: number;
      webhook: number;
      integration: number;
    };
  };
  browsers: {
    chrome: number;
    firefox: number;
    safari: number;
    edge: number;
    others: number;
  };
  deviceTypes: {
    desktop: number;
    mobile: number;
    tablet: number;
    bot: number;
  };
  timePatterns: {
    mobileHours: number[]; // 모바일 선호 시간대
    desktopHours: number[]; // 데스크톱 선호 시간대
    weekendMobileRatio: number;
  };
}

export interface QuestionAnalysis {
  topQuestions: Array<{
    question: string;
    frequency: number;
    category: 'price' | 'dex' | 'bridge' | 'wallet' | 'general' | 'support';
    language: 'ko' | 'en';
    avgSatisfaction: number;
    responseTime: number;
    variants: string[]; // 유사한 질문들
    trend: 'rising' | 'stable' | 'declining';
  }>;
  categories: {
    price: {
      count: number;
      examples: string[];
      satisfaction: number;
    };
    dex: {
      count: number;
      examples: string[];
      satisfaction: number;
    };
    bridge: {
      count: number;
      examples: string[];
      satisfaction: number;
    };
    wallet: {
      count: number;
      examples: string[];
      satisfaction: number;
    };
    general: {
      count: number;
      examples: string[];
      satisfaction: number;
    };
    support: {
      count: number;
      examples: string[];
      satisfaction: number;
    };
  };
  patterns: {
    questionLength: {
      short: number; // <10 words
      medium: number; // 10-25 words
      long: number; // >25 words
    };
    complexity: {
      simple: number; // 단일 주제
      complex: number; // 복합 질문
      followUp: number; // 후속 질문
    };
  };
  trending: {
    rising: string[];
    declining: string[];
    new: string[];
  };
}

export interface ResponseAnalysis {
  responsePatterns: Array<{
    category: string;
    avgLength: number; // 평균 답변 길이
    avgResponseTime: number;
    satisfaction: number;
    commonPhrases: string[]; // 자주 사용되는 문구
    successRate: number; // 문제 해결률
  }>;
  templates: Array<{
    template: string;
    usage: number;
    satisfaction: number;
    category: string;
  }>;
  effectiveness: {
    withLinks: number; // 링크 포함 답변 만족도
    withExamples: number; // 예시 포함 답변 만족도
    stepByStep: number; // 단계별 설명 만족도
    withImages: number; // 이미지 포함 답변 만족도
  };
  improvements: Array<{
    area: string;
    currentSatisfaction: number;
    targetSatisfaction: number;
    suggestions: string[];
  }>;
}

export interface UserBehavior {
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
}

export interface ConversationFeed {
  conversations: Array<{
    chatId: string;
    timestamp: string;
    category: string;
    language: 'ko' | 'en';
    duration: number; // 초
    messageCount: number;
    satisfaction?: number;
    walletConnected: boolean;
    platform: 'web' | 'mobile' | 'api';
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
}

export interface SatisfactionAnalysis {
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
  correlations: {
    responseTimeVsSatisfaction: number;
    answerLengthVsSatisfaction: number;
    timeOfDayVsSatisfaction: Array<{ hour: number; satisfaction: number }>;
    platformVsSatisfaction: Record<string, number>;
  };
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
}

// API Response 타입들
export interface ChatInsightsApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  cache?: {
    timestamp: string;
    expiresIn: number;
  };
}

export interface ChatInsightsPaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

// 필터 및 설정 타입들
export interface ChatInsightsFilters {
  dateRange: {
    start: Date;
    end: Date;
  };
  categories: string[];
  languages: ('ko' | 'en')[];
  platforms: ('web' | 'mobile' | 'api')[];
  satisfactionRange: {
    min: number;
    max: number;
  };
  walletConnected?: boolean;
}

// 실시간 스트림 타입들
export type ChatStreamEvent =
  | 'new-conversation'
  | 'conversation-ended'
  | 'metrics-update'
  | 'satisfaction-update'
  | 'trending-topic';

export interface ChatStreamData {
  event: ChatStreamEvent;
  timestamp: string;
  data: any; // 이벤트 타입별 데이터
}

// 차트 데이터 타입들
export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
  category?: string;
}

export interface HeatmapData {
  x: number; // 시간 (0-23)
  y: number; // 요일 (0-6)
  value: number; // 활동량
}

export interface PieChartData {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

// MongoDB 실제 데이터 구조에 맞는 타입
export interface ChatConversation {
  id: string;
  userId?: string;
  question: string;
  response: string;
  timestamp: Date;
  platform: 'web' | 'mobile' | 'api' | 'extension' | 'crossx';
  language: 'ko' | 'en';
  satisfaction?: number;
  responseTime?: number;
  category?: 'price' | 'dex' | 'bridge' | 'wallet' | 'general' | 'support';
}