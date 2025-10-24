# ARA Chat E2E Testing Setup

이 문서는 ARA Chat 프로젝트의 Playwright E2E 테스트 환경 설정에 대한 가이드입니다.

## 📁 프로젝트 구조

```
tests/e2e/
├── config/               # 테스트 환경 설정
│   ├── global-setup.ts   # 전역 설정 (실행 전)
│   ├── global-teardown.ts # 전역 정리 (실행 후)
│   └── test-environment.ts # 환경별 설정
├── fixtures/             # 테스트 데이터 및 목 객체
│   ├── test-data.json    # 정적 테스트 데이터
│   └── wallet-mocks.ts   # 지갑 목킹 유틸리티
├── pages/               # Page Object Model
│   ├── BasePage.ts      # 공통 페이지 기능
│   ├── ChatPage.ts      # 채팅 페이지 객체
│   ├── WalletPage.ts    # 지갑 페이지 객체
│   └── InsightsPage.ts  # 인사이트 페이지 객체
├── components/          # 컴포넌트별 테스트 객체
│   ├── ChatComponents.ts
│   ├── WalletComponents.ts
│   └── UIComponents.ts
├── utils/               # 테스트 유틸리티
│   ├── test-helpers.ts  # 공통 헬퍼 함수
│   └── api-mocks.ts     # API 목킹 유틸리티
├── specs/               # 실제 테스트 파일들
│   ├── chat/           # 채팅 관련 테스트
│   ├── wallet/         # 지갑 관련 테스트
│   ├── insights/       # 인사이트 관련 테스트
│   └── integration/    # 통합 테스트
└── scripts/            # 설정 및 유틸리티 스크립트
    └── test-setup.sh   # 환경 설정 스크립트
```

## 🚀 설정 및 실행

### 1. 초기 설정

```bash
# 프로젝트 루트에서 실행
cd app
npm install

# E2E 테스트 환경 설정
npm run test:e2e:setup
```

### 2. 주요 npm Scripts

#### 기본 테스트 실행
```bash
npm run test:e2e              # 모든 E2E 테스트 실행
npm run test:e2e:ui           # UI 모드로 테스트 실행
npm run test:e2e:headed       # 브라우저를 보면서 테스트 실행
npm run test:e2e:debug        # 디버그 모드로 테스트 실행
```

#### 카테고리별 테스트
```bash
npm run test:e2e:chat         # 채팅 테스트만 실행
npm run test:e2e:wallet       # 지갑 테스트만 실행
npm run test:e2e:insights     # 인사이트 테스트만 실행
npm run test:e2e:integration  # 통합 테스트만 실행
```

#### 브라우저별 테스트
```bash
npm run test:e2e:chrome       # Chrome에서만 실행
npm run test:e2e:firefox      # Firefox에서만 실행
npm run test:e2e:safari       # Safari에서만 실행
npm run test:e2e:mobile       # 모바일 브라우저에서 실행
```

#### 특수 테스트
```bash
npm run test:e2e:smoke        # 스모크 테스트 (@smoke 태그)
npm run test:e2e:critical     # 핵심 기능 테스트 (@critical 태그)
npm run test:e2e:performance  # 성능 테스트 (@performance 태그)
```

#### 리포트 및 디버깅
```bash
npm run test:e2e:report       # 테스트 리포트 보기
npm run test:e2e:trace        # 트레이스 기록과 함께 실행
npm run test:e2e:video        # 비디오 녹화와 함께 실행
```

## 🎯 테스트 작성 가이드

### 테스트 태그 시스템

```typescript
// 스모크 테스트 (기본 기능 확인)
test('기본 채팅 기능 @smoke @critical', async ({ page }) => {
  // 테스트 코드
});

// 성능 테스트
test('페이지 로딩 성능 @performance', async ({ page }) => {
  // 성능 측정 코드
});

// 회귀 테스트
test('지갑 연결 기능 @regression @wallet', async ({ page }) => {
  // 회귀 테스트 코드
});
```

### Page Object Model 사용

```typescript
import { test, expect } from '@playwright/test';
import { ChatPage } from '../pages/ChatPage';

test('채팅 메시지 전송', async ({ page }) => {
  const chatPage = new ChatPage(page);

  await chatPage.navigate();
  await chatPage.sendMessage('안녕하세요');
  await chatPage.verifyMessageAppeared('안녕하세요');
  await chatPage.waitForResponse();
});
```

## 🔧 환경 설정

### 환경별 설정

```typescript
// development 환경
TEST_ENV=development
TEST_BASE_URL=http://localhost:3009
MOCK_API=true

// staging 환경
TEST_ENV=staging
TEST_BASE_URL=https://staging.arachat.io
MOCK_API=false

// production 환경
TEST_ENV=production
TEST_BASE_URL=https://arachat.io
MOCK_API=false
```

### 브라우저 설정

- **Desktop**: Chrome, Firefox, Safari
- **Mobile**: Chrome Mobile, Safari Mobile
- **Tablet**: iPad Pro

## 📊 CI/CD 통합

### GitHub Actions

- **트리거**: Push, PR, 스케줄 (매일 2AM UTC)
- **병렬 실행**: 브라우저별 매트릭스
- **아티팩트**: 스크린샷, 비디오, 트레이스, 리포트
- **알림**: 실패 시 Slack 알림

### 실행 전략

- **로컬**: 개발 중 빠른 피드백
- **CI**: 모든 브라우저에서 전체 테스트
- **나이틀리**: 성능 및 회귀 테스트

## 🐛 디버깅 및 문제 해결

### 일반적인 문제들

1. **포트 충돌**: 3009 포트가 사용 중인 경우
2. **브라우저 설치**: `npx playwright install` 실행
3. **권한 문제**: Linux에서 `npx playwright install-deps` 실행

### 디버깅 도구

- **Playwright Inspector**: `--debug` 플래그
- **트레이스 뷰어**: `--trace=on` 플래그
- **스크린샷**: 실패 시 자동 캡처
- **비디오 녹화**: 실패 시 자동 녹화

## 📈 성능 및 최적화

### 테스트 최적화

- **병렬 실행**: `fullyParallel: true`
- **재시도**: CI에서 최대 2회
- **타임아웃**: 작업별 적절한 설정
- **셀렉터 최적화**: `data-testid` 속성 사용

### 리소스 관리

- **메모리**: 브라우저 컨텍스트 재사용
- **네트워크**: API 목킹으로 속도 향상
- **저장소**: 테스트 결과 자동 정리

## 🔐 보안 고려사항

- **민감한 데이터**: 환경변수 및 시크릿 사용
- **API 키**: 테스트용 별도 키 사용
- **데이터베이스**: 테스트용 격리된 인스턴스
- **권한**: 최소 필요 권한 원칙

## 📚 추가 자료

- [Playwright 공식 문서](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [ARA Chat 개발 가이드](../../../CLAUDE.md)