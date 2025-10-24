// Email template types for daily report system

export interface EmailRecipient {
  email: string;
  name: string;
  department?: string;
  role?: string;
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

export interface DailyReportConfig {
  recipients: EmailRecipient[];
  schedule: {
    time: string; // HH:MM format (e.g., "09:00")
    timezone: string; // e.g., "Asia/Seoul"
    frequency: 'daily' | 'weekly' | 'monthly';
  };
  template: {
    type: 'standard' | 'executive' | 'detailed';
    includeCharts: boolean;
    includeTrendAnalysis: boolean;
    includePlayerConcerns: boolean;
  };
  dateRange: {
    days: number; // Number of days to include in report (default: 1 for daily)
  };
}

export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType: string;
}

export interface EmailRequest {
  to: EmailRecipient[];
  subject: string;
  html: string;
  text?: string;
  attachments?: EmailAttachment[];
  from?: {
    name: string;
    email: string;
  };
}

export interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  timestamp: Date;
}

// N8N workflow integration types
export interface N8NReportRequest {
  date?: string; // ISO date string (default: yesterday)
  type?: 'standard' | 'executive' | 'detailed';
  format?: 'html' | 'json' | 'both';
  recipients?: string[]; // Email addresses
  includeCharts?: boolean;
  includeTrendAnalysis?: boolean;
}

export interface N8NReportResponse {
  success: boolean;
  data: {
    html?: string;
    json?: any;
    metadata: {
      reportDate: string;
      generatedAt: string;
      reportType: string;
      recipientCount: number;
    };
  };
  error?: string;
}