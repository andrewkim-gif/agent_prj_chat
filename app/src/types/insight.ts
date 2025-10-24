// Real data types based on actual MongoDB structure

export interface VideoData {
  _id: string;
  createdat: Date;
  lang: string; // Changed from location to lang
  summary?: string;
  title: string;
  channel: string;
  link: string;
  relevance: number;
  sentiment: number;
  sentiment_text: string;
  harm: number;
  harm_text: string;
  length: string;
  source: string;
  script?: string;
  script_kr?: string;
  isscript: boolean;
  snippet?: string;
  // New social media metrics
  views: number;
  likes: number;
  comment: number;
  streamer_nickname: string;
  thumbnail_url: string;
  description: string;
}

export interface SentimentDistribution {
  veryPositive: number;
  positive: number;
  neutral: number;
  negative: number;
  veryNegative: number;
}

export interface TopChannel {
  name: string;
  videoCount: number;
  avgSentiment: number;
}

export interface TopStreamer {
  name: string;
  videoCount: number;
  avgSentiment: number;
  totalViews: number;
  totalLikes: number;
  avgEngagementRate: number;
}

export interface SocialMediaMetrics {
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  avgEngagementRate: number;
  topPerformingVideos: {
    title: string;
    views: number;
    likes: number;
    engagementRate: number;
  }[];
}

export interface CreatorAnalytics {
  totalCreators: number;
  topCreators: TopStreamer[];
  creatorsByLanguage: {
    lang: string;
    creatorCount: number;
    avgViewsPerCreator: number;
  }[];
}

export interface EngagementAnalytics {
  avgViewsPerVideo: number;
  avgLikesPerVideo: number;
  avgCommentsPerVideo: number;
  engagementTrends: {
    date: string;
    avgEngagementRate: number;
  }[];
  topEngagementVideos: {
    title: string;
    views: number;
    likes: number;
    comments: number;
    engagementRate: number;
  }[];
}

export interface VideoContent {
  _id: string;
  title: string;
  channel: string;
  streamer_nickname?: string;
  url?: string;
  views?: number;
  likes?: number;
  comment?: number;
  sentiment: number;
  harm: number;
  createdat: string;
  relevance?: number;
  summary?: string; // 비디오 요약
  description?: string; // 비디오 설명
  thumbnail_url?: string; // 썸네일 URL
  script?: string; // 스크립트
  script_kr?: string; // 한국어 스크립트
}

export interface DailyInsight {
  _id: string;
  date: string;
  lang: string; // Changed from location to lang
  totalVideos: number;
  avgSentiment: number;
  sentimentDistribution: SentimentDistribution;
  relevanceScore?: number;
  harmContentCount: number;
  scriptsAvailable?: number;
  topChannels: TopChannel[];
  totalActiveChannels: number; // 실제 활성 채널 수 (상위 5개가 아닌 전체)
  contentCategories?: any;
  keyTopics: string[];
  keyTerms?: any;
  positiveHighlights?: string[];
  negativeIssues?: string[];
  summaryText: string;
  aiInsight: string;
  trendAnalysis?: {
    playerConcerns?: string[];
    popularFeatures?: string[];
    suggestedImprovements?: string[];
  };
  metrics?: Record<string, any>;
  recommendations: string[];
  createdAt?: string;
  updatedAt?: string;
  contentDate?: string;
  // New social media metrics aggregations
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  avgEngagementRate: number;
  topStreamers: TopStreamer[];
  videoContent?: VideoContent[]; // 해당 날짜의 비디오 컨텐츠
  displayedVideos?: number; // 화면에 실제 표시되는 비디오 수 (최대 20개)
}

// Dashboard specific interfaces
export interface DashboardMetrics {
  totalVideos: number;
  totalChannels: number;
  avgSentiment: number;
  harmContentPercentage: number;
  scriptsAvailable: number;
  topLanguages: string[]; // Changed from topLocations to topLanguages
  // New social media metrics
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  avgEngagementRate: number;
  totalCreators: number;
}

export interface TrendData {
  date: string;
  sentiment: number;
  videoCount: number;
  harmContent: number;
}

export interface LanguageStats {
  lang: string; // Changed from location to lang
  videoCount: number;
  avgSentiment: number;
  harmContent: number;
  topChannels: string[];
  // New social media metrics
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  avgEngagementRate: number;
  topStreamers: string[];
}

// Keep LocationStats for backward compatibility during migration
export interface LocationStats {
  location?: string; // Made optional for migration
  lang?: string; // New field
  videoCount: number;
  avgSentiment: number;
  harmContent: number;
  topChannels: string[];
}

export interface InsightFilters {
  dateRange: {
    start: Date;
    end: Date;
  };
  languages: string[]; // Changed from locations to languages
  sentimentRange: {
    min: number;
    max: number;
  };
  harmFilter: 'all' | 'low' | 'medium' | 'high';
  // New social media filters
  engagementRange?: {
    min: number;
    max: number;
  };
  viewsRange?: {
    min: number;
    max: number;
  };
  creatorFilter?: string[];
}

export type AlertType = 'positive' | 'warning' | 'negative';

export interface Alert {
  id: string;
  type: AlertType;
  title: string;
  message: string;
  lang?: string; // Changed from location to lang
  timestamp: Date;
  severity: 'low' | 'medium' | 'high';
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}