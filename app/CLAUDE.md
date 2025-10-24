# ARA Chat 프로젝트 규칙

## 아이콘 시스템
- **필수**: 모든 아이콘은 @mynaui/icons-react 패키지 사용
- **금지**: lucide-react 및 기타 아이콘 패키지 사용 금지
- **참고**: https://mynaui.com/icons

### 주요 아이콘 매핑
- Bot → Robot
- Gamepad/Game → Controller
- MessageCircle → Message
- DollarSign → Dollar
- Twitter → BrandX
- Loader/Loader2 → Spinner
- Clock → ClockTwo
- Wallet → CreditCard
- BarChart → ChartBar
- ShoppingBag → ShoppingBag (사용 가능)

## 디자인 시스템
- **깔끔한 디자인**: 복잡한 그라데이션 배경 사용 금지
- **단순 배경**: bg-card, bg-muted, bg-background 사용
- **테두리**: border border-border 사용
- **glass-effect**: 제거하고 bg-background 사용

## 컴포넌트 스타일링 가이드
- 그라데이션 제거: `from-card/50 to-card/30 bg-gradient-to-b backdrop-blur-sm` → `bg-card`
- 아이콘 배경: `bg-gradient-to-r from-primary to-accent` → `bg-primary`
- 테두리: `border-border/40` → `border-border`

## 레이아웃 시스템
### 채팅 모드 레이아웃
- **전체 화면 사용**: 채팅 모드에서는 max-width 제한 없이 전체 화면 사용
- **헤더 통합**: 채팅 모드에서는 ChatHeader만 사용 (Header + ChatHeader 중복 제거)
- **독립적 스크롤**: ChatSidebar와 ChatInterface는 각각 독립적인 스크롤 영역
- **스크롤 제어**: 채팅 모드 시 body 스크롤 비활성화
- **위치 배치**: ChatSidebar(좌측), ChatInterface(우측)

### 채팅 인터페이스
- **하단 고정**: 메시지 입력창은 하단에 고정
- **너비 제한**: 채팅 콘텐츠는 최대 너비 max-w-4xl 적용 (가독성을 위해)
- **높이 최적화**: flex-1을 사용하여 전체 높이 활용

## 기능별 컴포넌트 규칙
### Quick Actions
- **위치**: ChatSidebar 최상단에 배치
- **기능**: 버튼 클릭 시 해당 질문이 실제 채팅으로 전송되어야 함
- **연동**: onSendMessage prop을 통해 채팅 시스템과 연결

### 아바타 시스템
- **사용자 아바타**: `/ara2.png` 사용
- **어시스턴트 아바타**: `/assets/imgs/ara_emoji_01.svg` ~ `/assets/imgs/ara_emoji_10.svg` 중 랜덤 선택
- **타이핑 인디케이터**: 정적 아바타 `/ara.png` 사용 (랜덤 아바타 사용 금지)

### 애니메이션 시스템
- **타이핑 효과**: 영어로 감성적인 메시지를 타이핑 애니메이션으로 표시
- **커서 애니메이션**: `animate-blink` 클래스 사용
- **메시지 예시**:
  - "ARA is searching through data to find the perfect answer for you..."
  - "Analyzing your question with care and attention..."
  - "Gathering insights to provide you with helpful information..."
  - "Working hard to give you the best response possible..."

## 콘텐츠 관리
### Live Updates (Twitter Feed)
- **아이콘 제거**: 모든 트윗 포스트에서 HC, C 등의 아이콘 제거
- **아바타 제거**: `<AvatarImage src={tweet.avatar} alt={tweet.author} />` 제거
- **깔끔한 표시**: 텍스트 중심의 간결한 표시

## 상태 관리
### 채팅 히스토리
- **자동 리셋**: 페이지 새로고침 시 채팅 히스토리 자동 초기화
- **초기 메시지**: 항상 웰컴 메시지로 시작
- **리프레시 버튼**: 채팅 내용을 초기화하는 기능

## 파일 구조
### 정적 자산
- **이미지 경로**: `/app/public/assets/imgs/`에 ara_emoji_01.svg ~ ara_emoji_10.svg 배치
- **접근 경로**: `/assets/imgs/ara_emoji_XX.svg` 형태로 접근