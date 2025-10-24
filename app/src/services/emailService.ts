// Email service for daily report generation and sending

import { DailyInsight } from '@/types/insight';
import { EmailRequest, EmailResponse, EmailTemplate, DailyReportConfig } from '@/types/email';

export class EmailService {

  /**
   * Generate HTML email template for daily report using exact insights page data structure
   */
  static generateDailyReportHTML(
    insight: DailyInsight
  ): string {
    const reportDate = new Date(insight.date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });

    // Calculate total active channels from topChannels
    const totalActiveChannels = insight.topChannels?.length || 0;

    // Calculate harmful content percentage
    const harmContentPercentage = insight.totalVideos > 0
      ? ((insight.harmContentCount || 0) / insight.totalVideos * 100).toFixed(1)
      : '0.0';

    return `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ARA AI 일일 리포트 - ${reportDate}</title>
    <style>
        /* Design Guide inspired styles - Modern & Clean */
        :root {
            --background: rgb(255, 255, 255);
            --foreground: rgb(10, 10, 10);
            --primary: rgb(23, 23, 23);
            --primary-foreground: rgb(250, 250, 250);
            --secondary: rgb(245, 245, 245);
            --secondary-foreground: rgb(23, 23, 23);
            --muted: rgb(245, 245, 245);
            --muted-foreground: rgb(115, 115, 115);
            --border: rgb(229, 229, 229);
            --card: rgb(255, 255, 255);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            line-height: 1.6;
            background-color: var(--background);
            color: var(--foreground);
            margin: 0;
            padding: 20px;
        }

        .container {
            max-width: 800px;
            margin: 0 auto;
            background: var(--card);
            border: 1px solid var(--border);
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
        }

        /* Header - Clean minimal design */
        .header {
            background: var(--primary);
            color: var(--primary-foreground);
            padding: 40px 24px;
            text-align: center;
        }

        .header h1 {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
            letter-spacing: -0.025em;
        }

        .header p {
            opacity: 0.9;
            font-size: 16px;
            font-weight: 500;
        }

        .content {
            padding: 32px 24px;
        }

        /* Section styling - Clean & minimal */
        .section {
            margin-bottom: 48px;
        }

        .section:last-child {
            margin-bottom: 0;
        }

        .section-title {
            font-size: 24px;
            font-weight: 600;
            color: var(--foreground);
            margin-bottom: 24px;
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .section-title::before {
            content: '';
            width: 3px;
            height: 24px;
            background: var(--primary);
            border-radius: 2px;
        }

        /* ARA Message - shadcn/ui card style */
        .ara-message {
            background: var(--card);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 32px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .ara-message-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 16px;
        }

        .ara-avatar {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: var(--secondary);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            color: var(--primary);
            font-size: 18px;
        }

        .ara-info h3 {
            font-size: 16px;
            font-weight: 600;
            color: var(--foreground);
            margin-bottom: 4px;
        }

        .ara-date {
            font-size: 14px;
            color: var(--muted-foreground);
        }

        .ara-message-content {
            background: var(--muted);
            border-radius: 8px;
            padding: 20px;
            font-size: 16px;
            color: var(--foreground);
            line-height: 1.6;
            font-weight: 500;
        }

        /* Metrics Grid - Clean card design */
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 20px;
            margin-bottom: 32px;
        }

        .metric-card {
            background: var(--card);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 24px;
            text-align: center;
            transition: all 0.2s ease;
        }

        .metric-card:hover {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            transform: translateY(-1px);
        }

        .metric-value {
            font-size: 36px;
            font-weight: 700;
            color: var(--primary);
            margin-bottom: 8px;
            letter-spacing: -0.025em;
        }

        .metric-label {
            font-size: 14px;
            color: var(--muted-foreground);
            text-transform: uppercase;
            letter-spacing: 0.05em;
            font-weight: 500;
        }

        /* Summary text - Clean design */
        .summary-text {
            background: var(--muted);
            border-radius: 12px;
            padding: 24px;
            font-size: 16px;
            line-height: 1.7;
            color: var(--foreground);
            font-weight: 500;
        }

        /* Lists - Modern minimal */
        .concerns-list {
            list-style: none;
            margin-top: 20px;
            display: grid;
            gap: 12px;
        }

        .concerns-list li {
            background: var(--card);
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 16px 20px;
            font-size: 14px;
            font-weight: 500;
            line-height: 1.5;
            border-left: 4px solid #ef4444;
        }

        .concerns-list li[style*="22c55e"] {
            border-left-color: #22c55e;
        }

        .channels-list {
            list-style: none;
            margin-top: 20px;
            display: grid;
            gap: 12px;
        }

        .channels-list li {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 20px;
            background: var(--card);
            border: 1px solid var(--border);
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
        }

        /* Tag grid - Clean layout */
        .language-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 12px;
            margin-top: 20px;
        }

        .language-item {
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 12px 16px;
            background: var(--secondary);
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            color: var(--secondary-foreground);
            text-align: center;
        }

        /* Player concerns - Modern design */
        .player-concern-item {
            display: flex;
            align-items: center;
            margin-bottom: 12px;
            padding: 16px;
            background: var(--card);
            border: 1px solid var(--border);
            border-radius: 8px;
            transition: all 0.2s ease;
        }

        .player-concern-item:hover {
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .concern-percentage {
            margin-right: 16px;
            font-weight: 700;
            color: #ef4444;
            font-size: 16px;
            min-width: 50px;
        }

        .concern-text {
            font-size: 14px;
            font-weight: 500;
            color: var(--foreground);
        }

        /* Footer - Minimal design */
        .footer {
            background: var(--muted);
            padding: 32px;
            text-align: center;
            border-top: 1px solid var(--border);
        }

        .footer p {
            font-size: 14px;
            color: var(--muted-foreground);
            margin-bottom: 8px;
            font-weight: 500;
        }

        .footer a {
            color: var(--primary);
            text-decoration: none;
            font-weight: 600;
        }

        /* Responsive design */
        @media (max-width: 768px) {
            .container {
                margin: 0;
                border-radius: 0;
            }

            .header {
                padding: 32px 20px;
            }

            .content {
                padding: 32px 20px;
            }

            .metrics-grid {
                grid-template-columns: repeat(2, 1fr);
                gap: 16px;
            }

            .language-stats {
                grid-template-columns: 1fr;
            }

            .section-title {
                font-size: 20px;
            }

            .metric-value {
                font-size: 28px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>🤖 ARA AI 일일 리포트</h1>
            <p>${reportDate}</p>
        </div>

        <!-- Content -->
        <div class="content">
            <!-- ARA Chat 스타일 daily insight 메시지 -->
            <div class="section">
                <div class="ara-message">
                    <div class="ara-message-header">
                        <div class="ara-avatar">ARA</div>
                        <div class="ara-info">
                            <div class="ara-name">ARA</div>
                            <div class="ara-date">${reportDate}</div>
                        </div>
                    </div>
                    <div class="ara-message-content">
                        <div class="ara-message-text">
                            ${insight.aiInsight}
                        </div>
                    </div>
                </div>
            </div>

            <!-- 핵심 지표 - Match insights page exactly -->
            <div class="section">
                <h2 class="section-title">📊 Quick Stats</h2>
                <div class="metrics-grid">
                    <div class="metric-card">
                        <div class="metric-value">${insight.totalVideos.toLocaleString()}</div>
                        <div class="metric-label">Total Videos</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${(insight.avgSentiment * 100).toFixed(1)}%</div>
                        <div class="metric-label">Avg Sentiment</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${harmContentPercentage}%</div>
                        <div class="metric-label">Harmful Content</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${totalActiveChannels}</div>
                        <div class="metric-label">Active Channels</div>
                    </div>
                </div>
            </div>

            <!-- Daily Summary -->
            <div class="section">
                <h3 class="section-title">Daily Summary</h3>
                <div class="summary-text">
                    ${insight.summaryText}
                </div>
            </div>

            <!-- Positive Highlights -->
            ${insight.positiveHighlights && insight.positiveHighlights.length > 0 ? `
            <div class="section">
                <h2 class="section-title">✅ Positive Highlights</h2>
                <ul class="concerns-list">
                    ${insight.positiveHighlights.map(highlight =>
                        `<li style="border-left-color: #22c55e;">${highlight}</li>`
                    ).join('')}
                </ul>
            </div>
            ` : ''}

            <!-- Negative Issues -->
            ${insight.negativeIssues && insight.negativeIssues.length > 0 ? `
            <div class="section">
                <h2 class="section-title">⚠️ Negative Issues</h2>
                <ul class="concerns-list">
                    ${insight.negativeIssues.map(issue =>
                        `<li style="border-left-color: #ef4444;">${issue}</li>`
                    ).join('')}
                </ul>
            </div>
            ` : ''}

            <!-- Key Topics -->
            <div class="section">
                <h2 class="section-title">🏷️ Key Topics</h2>
                <div class="language-stats">
                    ${insight.keyTopics.map(topic => `
                        <div class="language-item">
                            <span>${topic}</span>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Recommendations -->
            ${insight.recommendations.length > 0 ? `
            <div class="section">
                <h2 class="section-title">💡 Recommendations</h2>
                <ul class="concerns-list">
                    ${insight.recommendations.map(rec =>
                        `<li style="border-left-color: #22c55e;">${rec}</li>`
                    ).join('')}
                </ul>
            </div>
            ` : ''}

            <!-- Player Concerns - Match insights page exactly -->
            ${insight.trendAnalysis?.playerConcerns ? `
            <div class="section">
                <h2 class="section-title">⚠️ Player Concerns</h2>
                <div style="margin-top: 16px;">
                    ${insight.trendAnalysis.playerConcerns.map((concern, index) => {
                        const percentage = [100, 85, 70, 55, 40][index] || 30; // Match the percentages from insights page
                        return `
                            <div class="player-concern-item">
                                <div class="concern-percentage">${percentage}%</div>
                                <div class="concern-text">${concern}</div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
            ` : ''}

            <!-- Popular Features - Match insights page exactly -->
            ${insight.trendAnalysis?.popularFeatures ? `
            <div class="section">
                <h2 class="section-title">🎮 Popular Features</h2>
                <div class="language-stats">
                    ${insight.trendAnalysis.popularFeatures.map(feature => `
                        <div class="language-item">
                            <span>${feature}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}

            <!-- 상위 채널 -->
            <div class="section">
                <h2 class="section-title">🏆 상위 채널</h2>
                <ul class="channels-list">
                    ${insight.topChannels.slice(0, 5).map(channel => `
                        <li>
                            <span><strong>${channel.name}</strong></span>
                            <span>${channel.videoCount}개 영상 • ${(channel.avgSentiment * 100).toFixed(0)}% 감정</span>
                        </li>
                    `).join('')}
                </ul>
            </div>

            <!-- 추천사항 -->
            ${insight.recommendations.length > 0 ? `
            <div class="section">
                <h2 class="section-title">💡 추천사항</h2>
                <ul class="concerns-list">
                    ${insight.recommendations.map(rec =>
                        `<li style="border-left-color: #22c55e;">${rec}</li>`
                    ).join('')}
                </ul>
            </div>
            ` : ''}
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>🤖 <strong>ARA AI</strong>에서 자동 생성된 리포트입니다.</p>
            <p>생성 시간: ${new Date().toLocaleString('ko-KR')}</p>
            <p><a href="mailto:support@ara-ai.com">문의사항이 있으시면 연락주세요</a></p>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Get language display name (fallback for static method)
   */
  private static getLanguageDisplayName(langCode: string): string {
    const LANGUAGE_MAP: Record<string, string> = {
      'ko': '한국어',
      'en': '영어',
      'ja': '일본어',
      'zh': '중국어',
      'vi': '베트남어',
      'th': '태국어',
      'id': '인도네시아어',
      'es': '스페인어',
      'fr': '프랑스어',
      'de': '독일어',
      'pt': '포르투갈어',
      'ru': '러시아어',
      'ar': '아랍어',
      'hi': '힌디어',
      'etc': '자막없음',
      'unknown': '알 수 없음'
    };

    return LANGUAGE_MAP[langCode?.toLowerCase()] || `${langCode} (미분류)`;
  }

  /**
   * Generate text version of the email
   */
  static generateDailyReportText(
    insight: DailyInsight
  ): string {
    const reportDate = new Date(insight.date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });

    return `
🤖 ARA AI 일일 리포트 - ${reportDate}

📊 핵심 지표
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• 총 비디오 수: ${insight.totalVideos.toLocaleString()}개
• 평균 감정 점수: ${(insight.avgSentiment * 100).toFixed(1)}%
• 유해 콘텐츠: ${insight.harmContentCount}개
• 활성 채널: ${insight.totalActiveChannels}개

📝 일일 요약
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${insight.summaryText}

🧠 AI 인사이트
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${insight.aiInsight}

${insight.trendAnalysis?.playerConcerns ? `
⚠️ 플레이어 관심사
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${insight.trendAnalysis.playerConcerns.map((concern, index) => `${index + 1}. ${concern}`).join('\n')}
` : ''}

🏆 상위 채널
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${insight.topChannels.slice(0, 5).map((channel, index) =>
  `${index + 1}. ${channel.name} (${channel.videoCount}개 영상, ${(channel.avgSentiment * 100).toFixed(0)}% 감정)`
).join('\n')}

🏷️ 주요 토픽
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${insight.keyTopics.map((topic, index) => `${index + 1}. ${topic}`).join('\n')}

${insight.recommendations.length > 0 ? `
💡 추천사항
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${insight.recommendations.map((rec, index) => `${index + 1}. ${rec}`).join('\n')}
` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 ARA AI에서 자동 생성된 리포트입니다.
생성 시간: ${new Date().toLocaleString('ko-KR')}
문의: support@ara-ai.com
`;
  }

  /**
   * Generate email template
   */
  static generateEmailTemplate(
    insight: DailyInsight
  ): EmailTemplate {
    const reportDate = new Date(insight.date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return {
      subject: `🤖 ARA AI 일일 리포트 - ${reportDate}`,
      html: this.generateDailyReportHTML(insight),
      text: this.generateDailyReportText(insight)
    };
  }
}