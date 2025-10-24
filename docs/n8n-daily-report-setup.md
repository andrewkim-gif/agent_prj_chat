# N8N Daily Report Integration Guide

ARA AI 일일 리포트를 N8N 워크플로우에서 자동으로 생성하고 전송하는 방법에 대한 설명서입니다.

## 🚀 주요 기능

### 기존 Insight 시스템 완전 통합
- **실제 ARA Insight 데이터 사용**: 기존 daily insights 시스템(`InsightQueries.getDailyInsights()`)과 완전 통합
- **AI 생성 인사이트**: 실제 AI가 분석한 summaryText, aiInsight, recommendations 사용
- **풍부한 비디오 컨텐츠**: 채널별 상세 분석, 감정 점수, 유해 콘텐츠 분석
- **실시간 메트릭스**: 조회수, 좋아요, 댓글 등 소셜 미디어 지표 포함

### 한국어 최적화
- **완전한 한국어 지원**: 모든 텍스트와 인터페이스 한국어 제공
- **한국 날짜 형식**: 년월일 표기법 및 요일 표시
- **문화적 적응**: 한국 비즈니스 환경에 맞는 리포트 구성

## API 엔드포인트

### Base URL
```
http://localhost:3009/api/daily-report
```

## GET 요청 - 리포트 조회

### 기본 사용법
```http
GET /api/daily-report?format=html&date=2024-10-17
```

### 쿼리 파라미터

| 파라미터 | 타입 | 기본값 | 설명 |
|---------|------|--------|------|
| `date` | string | yesterday | 리포트 날짜 (YYYY-MM-DD 형식) |
| `format` | string | `html` | 출력 형식 (`html`, `json`, `both`) |
| `type` | string | `standard` | 리포트 타입 (`standard`, `executive`, `detailed`) |
| `includeCharts` | boolean | `false` | 차트 포함 여부 |
| `includeTrendAnalysis` | boolean | `true` | 트렌드 분석 포함 여부 |

## POST 요청 - 이메일 리포트 생성 (미구현)

⚠️ **현재 상태**: POST 엔드포인트는 아직 구현되지 않았습니다. GET 엔드포인트를 사용해주세요.

### 향후 구현 예정
```http
POST /api/daily-report
Content-Type: application/json

{
  "date": "2024-10-17",
  "format": "html",
  "type": "standard",
  "recipients": ["manager@company.com", "team@company.com"],
  "includeCharts": false,
  "includeTrendAnalysis": true
}
```

### 요청 Body 타입

```typescript
interface N8NReportRequest {
  date?: string; // YYYY-MM-DD 형식 (기본: 어제)
  type?: 'standard' | 'executive' | 'detailed'; // 기본: 'standard'
  format?: 'html' | 'json' | 'both'; // 기본: 'html'
  recipients?: string[]; // 이메일 주소 배열
  includeCharts?: boolean; // 기본: false
  includeTrendAnalysis?: boolean; // 기본: true
}
```

### N8N HTTP Request 노드 설정 (GET 방식 사용)

1. **Method**: GET
2. **URL**: `http://localhost:3009/api/daily-report`
3. **Query Parameters**:
   ```json
   {
     "date": "{{ $now.format('yyyy-MM-dd') }}",
     "format": "html",
     "type": "standard",
     "includeTrendAnalysis": "true"
   }
   ```

### 향후 POST 방식 (구현 후 사용 예정):
1. **Method**: POST
2. **URL**: `http://localhost:3009/api/daily-report`
3. **Headers**:
   ```json
   {
     "Content-Type": "application/json"
   }
   ```
4. **Body**:
   ```json
   {
     "date": "{{ $now.format('yyyy-MM-dd') }}",
     "format": "html",
     "type": "standard",
     "recipients": [
       "{{ $node['Set Recipients'].json.emails }}"
     ],
     "includeTrendAnalysis": true
   }
   ```

### 응답 예시
```json
{
  "success": true,
  "data": {
    "html": "<!DOCTYPE html>...",
    "json": {
      "reportData": {
        "date": "2025-10-16",
        "totalVideos": 27,
        "totalChannels": 19,
        "languageStats": [
          {
            "language": "언어-1",
            "videoCount": 2,
            "avgSentiment": 0,
            "avgHarm": 0
          }
        ],
        "topChannels": [
          {
            "name": "WIZME",
            "videoCount": 2,
            "avgSentiment": 0
          }
        ],
        "trends": [
          {
            "metric": "비디오 수",
            "change": 5.2,
            "timeframe": "7일간"
          }
        ],
        "insights": [
          {
            "id": "daily-summary",
            "type": "summary",
            "priority": "high",
            "title": "일일 콘텐츠 분석 요약",
            "description": "2025-10-16 일일 분석 결과...",
            "confidence": 90,
            "supportingData": [
              {
                "metric": "총 비디오",
                "value": "27개"
              }
            ],
            "timestamp": "2025-10-17T06:32:57.828Z"
          }
        ],
        "summary": {
          "keyFindings": ["주요 발견사항..."],
          "recommendations": ["콘텐츠 품질 모니터링 지속"],
          "overallSentiment": "중립"
        }
      },
      "insight": {
        "_id": "generated-2025-10-16",
        "date": "2025-10-16",
        "lang": "all",
        "totalVideos": 27,
        "avgSentiment": 0.69,
        "summaryText": "일일 분석 결과...",
        "aiInsight": "AI 분석 인사이트...",
        "recommendations": ["추천사항 목록"],
        "keyTopics": ["데일리 리포트", "콘텐츠 분석"],
        "topChannels": [
          {
            "name": "WIZME",
            "videoCount": 2,
            "avgSentiment": 0.0
          }
        ]
      },
      "config": {
        "reportType": "standard",
        "includeCharts": false,
        "includeTrendAnalysis": true,
        "dateRange": {
          "days": 1
        }
      }
    },
    "metadata": {
      "reportDate": "2025-10-16",
      "generatedAt": "2025-10-17T06:32:57.828Z",
      "reportType": "standard",
      "recipientCount": 0
    }
  }
}
```

## N8N 워크플로우 예시

### 1. 매일 아침 9시 자동 리포트 생성

```json
{
  "nodes": [
    {
      "name": "Schedule Trigger",
      "type": "@n8n/n8n-nodes-schedule",
      "position": [250, 300],
      "parameters": {
        "rule": {
          "interval": [
            {
              "field": "hours",
              "value": 9
            }
          ]
        }
      }
    },
    {
      "name": "Generate Report",
      "type": "@n8n/n8n-nodes-httprequest",
      "position": [450, 300],
      "parameters": {
        "method": "POST",
        "url": "http://localhost:3009/api/daily-report",
        "options": {},
        "bodyParameters": {
          "date": "={{ $now.format('yyyy-MM-dd') }}",
          "format": "html",
          "type": "executive",
          "recipients": ["management@company.com"],
          "includeTrendAnalysis": true
        }
      }
    },
    {
      "name": "Send Email",
      "type": "@n8n/n8n-nodes-emailsend",
      "position": [650, 300],
      "parameters": {
        "fromEmail": "ara-ai@company.com",
        "toEmail": "={{ $node['Generate Report'].json.data.metadata.recipients }}",
        "subject": "🤖 ARA AI Daily Report - {{ $now.format('yyyy-MM-dd') }}",
        "emailFormat": "html",
        "message": "={{ $node['Generate Report'].json.data.html }}"
      }
    }
  ]
}
```

## 고급 설정

### 1. 조건부 이메일 발송
중요한 인사이트가 있을 때만 이메일을 발송하려면:

1. **IF** 노드 추가
2. 조건 설정:
   ```javascript
   {{ $json.data.report.insights.some(insight => insight.priority === 'high') }}
   ```

### 2. 다중 수신자 설정
```json
{
  "recipients": [
    "admin@example.com",
    "manager@example.com",
    "analyst@example.com"
  ]
}
```

### 3. 커스텀 이메일 템플릿
이메일 본문을 커스터마이징하려면:

```html
<div style="font-family: Arial, sans-serif;">
  <h2>Ara Insight 데일리 리포트</h2>
  <p>안녕하세요,</p>
  <p>{{ $json.data.metadata.reportDate }}의 Ara Insight 리포트를 첨부합니다.</p>
  
  <h3>주요 통계</h3>
  <ul>
    <li>총 비디오 수: {{ $json.data.report.totalVideos }}</li>
    <li>활성 채널 수: {{ $json.data.report.totalChannels }}</li>
    <li>발견된 인사이트: {{ $json.data.report.insights.length }}개</li>
  </ul>
  
  <div style="margin-top: 20px;">
    {{ $json.data.html }}
  </div>
</div>
```

## 테스트 방법

### 1. 수동 테스트
```bash
# JSON 형태로 테스트
curl -X GET "http://localhost:3009/api/daily-report?format=json"

# HTML 형태로 테스트
curl -X GET "http://localhost:3009/api/daily-report?format=html"

# n8n API 테스트
curl -X POST "http://localhost:3009/api/n8n/daily-report" \
  -H "Content-Type: application/json" \
  -d '{"date": "2025-10-17", "format": "html", "recipients": ["test@example.com"]}'
```

### 2. n8n에서 테스트
1. 워크플로우에서 **Execute Workflow** 클릭
2. 각 노드의 출력 데이터 확인
3. 이메일 발송 테스트

## 문제 해결

### 1. API 연결 오류
- Ara Insight 서버가 실행 중인지 확인
- 포트 3009가 열려있는지 확인
- 방화벽 설정 확인

### 2. 이메일 발송 실패
- 이메일 서비스 계정 설정 확인
- SMTP 설정 확인
- 수신자 이메일 주소 유효성 확인

### 3. 데이터 없음
- MongoDB 연결 상태 확인
- 데이터베이스에 데이터가 있는지 확인
- 날짜 파라미터가 올바른지 확인

## 보안 고려사항

1. **API 접근 제한**: n8n 서버에서만 접근 가능하도록 설정
2. **이메일 인증**: 이메일 서비스의 2단계 인증 활성화
3. **로그 모니터링**: API 호출 및 이메일 발송 로그 모니터링

## 확장 가능성

### 1. 다국어 지원
- 언어별 리포트 생성
- 수신자별 언어 설정

### 2. 커스텀 리포트
- 사용자 정의 필터링
- 특정 채널/언어 집중 분석

### 3. 실시간 알림
- 중요 인사이트 발생 시 즉시 알림
- Slack, Discord 등 다른 플랫폼 연동

## 예제 워크플로우 JSON

```json
{
  "name": "Ara Insight Daily Report",
  "nodes": [
    {
      "parameters": {
        "rule": {
          "interval": [
            {
              "field": "cronExpression",
              "expression": "0 9 * * *"
            }
          ]
        }
      },
      "name": "Schedule Trigger",
      "type": "n8n-nodes-base.scheduleTrigger",
      "typeVersion": 1.1,
      "position": [240, 300]
    },
    {
      "parameters": {
        "url": "http://localhost:3009/api/n8n/daily-report",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "Content-Type",
              "value": "application/json"
            }
          ]
        },
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "date",
              "value": "={{ $now.format('YYYY-MM-DD') }}"
            },
            {
              "name": "format",
              "value": "html"
            },
            {
              "name": "recipients",
              "value": "[\"admin@example.com\"]"
            }
          ]
        },
        "options": {}
      },
      "name": "Get Daily Report",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.1,
      "position": [460, 300]
    },
    {
      "parameters": {
        "fromEmail": "noreply@ara-insight.com",
        "toEmail": "={{ $json.data.recipients.join(',') }}",
        "subject": "Ara Insight 데일리 리포트 - {{ $json.data.metadata.reportDate }}",
        "emailType": "html",
        "message": "={{ $json.data.html }}"
      },
      "name": "Send Email",
      "type": "n8n-nodes-base.emailSend",
      "typeVersion": 2,
      "position": [680, 300]
    }
  ],
  "connections": {
    "Schedule Trigger": {
      "main": [
        [
          {
            "node": "Get Daily Report",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Get Daily Report": {
      "main": [
        [
          {
            "node": "Send Email",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

이 가이드를 따라하면 Ara Insight의 데일리 리포트를 자동으로 생성하고 이메일로 발송하는 시스템을 구축할 수 있습니다.
