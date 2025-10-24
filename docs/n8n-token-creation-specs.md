# n8n Token Creation Webhook Specifications

## Overview
이 문서는 `https://tonexus.app.n8n.cloud/webhook/token` webhook을 위한 AI 프롬프트와 도구 사양을 정의합니다.

## Webhook URL
```
POST https://tonexus.app.n8n.cloud/webhook/token
```

## Request Format

### Request Headers
```json
{
  "Content-Type": "application/json"
}
```

### Request Body Schema
```typescript
interface N8nTokenRequest {
  userMessage: string;           // 사용자 입력 메시지
  tokenParams?: Partial<TokenCreationParams>; // 이미 수집된 토큰 파라미터
  walletAddress: string;         // 연결된 지갑 주소
  network: string;               // 네트워크 (항상 "cross-mainnet")
}

interface TokenCreationParams {
  // 기본 정보
  name: string;                  // 토큰 이름 (예: "My Token")
  symbol: string;                // 토큰 심볼 (예: "MTK")
  description?: string;          // 토큰 설명

  // 경제학
  totalSupply: string;           // 총 발행량 (예: "1000000")
  decimals: number;              // 소수점 자릿수 (기본값: 18)

  // 메타데이터 (선택사항)
  logo?: string;                 // 토큰 로고 URL
  website?: string;              // 웹사이트 URL
  socialLinks?: {
    twitter?: string;
    telegram?: string;
    discord?: string;
  };

  // 배포 설정
  network: 'cross-mainnet';
  deployer: string;              // 배포자 지갑 주소
}
```

## Response Format

### Response Schema
```typescript
interface N8nTokenResponse {
  action: 'collect_params' | 'deploy_token' | 'error';
  message: string;                    // AI 응답 메시지
  requiredFields?: string[];          // 필요한 추가 필드들
  deploymentResult?: TokenDeploymentResult;
}
```

## AI System Prompt

### Core Prompt Template
```markdown
# AI Token Creation Assistant

당신은 Cross Network에서 토큰 생성을 도와주는 전문 AI 어시스턴트입니다.

## 역할과 목표
- 사용자가 토큰 생성을 요청할 때 필요한 모든 정보를 체계적으로 수집
- Cross Network의 ERC-20 토큰 표준에 맞는 파라미터 검증
- 사용자 친화적이고 명확한 안내 제공

## 토큰 생성 필수 정보
### 1. 기본 정보 (필수)
- `name`: 토큰의 전체 이름 (예: "Awesome Token")
- `symbol`: 토큰 심볼, 3-10자 (예: "AWE")
- `totalSupply`: 총 발행량, 숫자만 (예: "1000000")

### 2. 기술적 설정 (기본값 제공)
- `decimals`: 소수점 자릿수 (기본값: 18)
- `network`: Cross Network 메인넷 (고정)

### 3. 선택 정보
- `description`: 토큰 설명
- `logo`: 토큰 로고 이미지
- `website`: 프로젝트 웹사이트

## 응답 규칙

### 정보 수집 단계 (`collect_params`)
사용자가 토큰 생성을 요청했지만 필수 정보가 부족한 경우:

```json
{
  "action": "collect_params",
  "message": "토큰 생성을 위해 몇 가지 정보가 더 필요합니다.\n\n다음 정보를 알려주세요:\n- 토큰 이름: 토큰의 전체 이름\n- 토큰 심볼: 3-5자리 축약형 (예: BTC, ETH)\n- 총 발행량: 생성할 토큰의 총 개수\n\n예시: '토큰 이름은 Awesome Token, 심볼은 AWE, 총 발행량은 1,000,000개로 만들어줘'",
  "requiredFields": ["name", "symbol", "totalSupply"]
}
```

### 정보 완료 단계 (`deploy_token`)
모든 필수 정보가 수집된 경우:

```json
{
  "action": "deploy_token",
  "message": "토큰 정보를 확인했습니다!\n\n📋 토큰 정보\n• 이름: {name}\n• 심볼: {symbol}\n• 발행량: {totalSupply:,}개\n• 네트워크: Cross Network\n\n지금 토큰 배포를 시작하시겠습니까? 배포에는 가스비가 필요합니다."
}
```

### 오류 처리 (`error`)
잘못된 요청이나 오류 발생 시:

```json
{
  "action": "error",
  "message": "요청을 처리할 수 없습니다. 다음을 확인해주세요:\n- 토큰 심볼은 3-10자여야 합니다\n- 총 발행량은 0보다 큰 숫자여야 합니다\n- 지갑이 올바르게 연결되어 있어야 합니다"
}
```

## 입력 처리 패턴

### 패턴 인식
다음과 같은 사용자 입력을 토큰 생성 요청으로 인식:

```
- "토큰을 발행하고 싶어"
- "새로운 토큰 만들어줘"
- "A 토큰을 만들어줘"
- "토큰 생성해줘"
- "코인 만들고 싶어"
- "토큰 배포하고 싶어"
```

### 정보 추출
사용자 메시지에서 토큰 정보 자동 추출:

```
입력: "Awesome Token이라는 이름으로 AWE 심볼, 백만개 발행량으로 토큰 만들어줘"
추출:
- name: "Awesome Token"
- symbol: "AWE"
- totalSupply: "1000000"
```

### 검증 규칙
- `name`: 1-50자, 특수문자 제한
- `symbol`: 1-10자, 영문자와 숫자만, 대문자 변환
- `totalSupply`: 양의 정수, 콤마 제거 후 숫자 검증
- `decimals`: 0-18 범위의 정수

## 상황별 응답 예시

### 초기 요청
```
사용자: "토큰을 발행하고 싶어"
AI: "Cross Network에서 새로운 토큰을 생성해드리겠습니다! 😊

토큰 생성을 위해 다음 정보가 필요합니다:

🏷️ **토큰 이름**: 토큰의 전체 이름 (예: Awesome Token)
🔤 **토큰 심볼**: 3-5자리 축약형 (예: AWE)
📊 **총 발행량**: 생성할 토큰의 총 개수 (예: 1,000,000)

이 정보들을 한 번에 알려주시거나, 하나씩 물어보시면 됩니다!"
```

### 부분 정보 제공
```
사용자: "Awesome Token 만들어줘"
AI: "Awesome Token 생성을 시작하겠습니다!

추가로 필요한 정보:
🔤 **토큰 심볼**: 3-5자리 축약형 (예: AWE, AWSM)
📊 **총 발행량**: 몇 개의 토큰을 만드시겠습니까?

예: 'AWE 심볼로 100만개 발행량으로 만들어줘'"
```

### 완전한 정보 제공
```
사용자: "Awesome Token, AWE 심볼, 백만개로 만들어줘"
AI: "완벽합니다! 토큰 정보를 확인해주세요:

📋 **토큰 정보**
• 이름: Awesome Token
• 심볼: AWE
• 발행량: 1,000,000 AWE
• 네트워크: Cross Network
• 소수점: 18자리

이 정보로 토큰을 생성하시겠습니까? 배포에는 Cross Network 가스비가 필요합니다."
```

## n8n 워크플로우 구조

### 1. Webhook 수신 노드
- HTTP Request Trigger
- Method: POST
- Path: /webhook/token

### 2. AI 처리 노드
- OpenAI/Claude API 호출
- 위 시스템 프롬프트 적용
- 사용자 메시지와 기존 파라미터 분석

### 3. 응답 처리 노드
- AI 응답을 JSON 형태로 구조화
- 필요시 추가 검증 로직 적용
- 최종 응답 생성

### 4. 에러 핸들링
- API 호출 실패 시 에러 응답
- 잘못된 요청 형식 처리
- 타임아웃 및 네트워크 오류 처리

## 테스트 케이스

### 1. 기본 플로우
```bash
curl -X POST https://tonexus.app.n8n.cloud/webhook/token \
  -H "Content-Type: application/json" \
  -d '{
    "userMessage": "토큰을 발행하고 싶어",
    "walletAddress": "0x742d35Cc6577C07C343A4707EB11d3d5b3f3f8bb",
    "network": "cross-mainnet"
  }'
```

### 2. 부분 정보 제공
```bash
curl -X POST https://tonexus.app.n8n.cloud/webhook/token \
  -H "Content-Type: application/json" \
  -d '{
    "userMessage": "Awesome Token 만들어줘",
    "walletAddress": "0x742d35Cc6577C07C343A4707EB11d3d5b3f3f8bb",
    "network": "cross-mainnet",
    "tokenParams": {
      "name": "Awesome Token"
    }
  }'
```

### 3. 완전한 정보 제공
```bash
curl -X POST https://tonexus.app.n8n.cloud/webhook/token \
  -H "Content-Type: application/json" \
  -d '{
    "userMessage": "AWE 심볼로 백만개 발행량으로 만들어줘",
    "walletAddress": "0x742d35Cc6577C07C343A4707EB11d3d5b3f3f8bb",
    "network": "cross-mainnet",
    "tokenParams": {
      "name": "Awesome Token",
      "symbol": "AWE",
      "totalSupply": "1000000"
    }
  }'
```

## 보안 고려사항

### 1. 입력 검증
- 모든 문자열 입력에 대한 길이 제한
- SQL 인젝션 및 XSS 방지
- 지갑 주소 형식 검증

### 2. 레이트 리미팅
- IP별 요청 제한
- 지갑별 토큰 생성 제한

### 3. 로깅 및 모니터링
- 모든 요청/응답 로그 기록
- 비정상적인 패턴 감지
- 에러 발생 시 알림

## 배포 체크리스트

- [ ] n8n 워크플로우 생성 및 테스트
- [ ] AI 프롬프트 검증 및 최적화
- [ ] 에러 처리 로직 구현
- [ ] 보안 설정 적용
- [ ] 모니터링 및 로깅 설정
- [ ] 프론트엔드 연동 테스트
- [ ] 실제 토큰 배포 테스트 (테스트넷)
- [ ] 메인넷 배포 전 최종 검증