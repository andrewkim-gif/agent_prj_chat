// CrossToken ecosystem knowledge base
export const crossTokenKnowledge = {
  services: {
    crossx: {
      name: "CROSSx",
      description: "올인원 Web3 슈퍼 앱으로 CROSS 블록체인 생태계의 모든 기능에 원활한 액세스를 제공",
      features: [
        "게임 중심 Web3 서비스",
        "사용자 친화적 인터페이스",
        "멀티체인 생태계 확장",
        "Web3 개발자를 위한 SDK 및 API"
      ]
    },
    dex: {
      name: "CROSS GameToken DEX",
      description: "게임 토큰 거래를 위한 탈중앙화 거래소",
      features: [
        "Game Token 거래",
        "지정가/시장가 주문",
        "Order book 기능",
        "실시간 가격 추적",
        "거래 수수료 및 주문 관리"
      ],
      orderTypes: ["Market", "Limit", "GTC", "IOC", "FOK"],
      supportedTokens: ["BNGO", "CROSS", "ETH"]
    },
    bridge: {
      name: "CROSS Bridge",
      description: "크로스체인 브릿지 서비스로 다양한 블록체인 간 자산 이동 지원",
      features: [
        "크로스체인 자산 이동",
        "다중 블록체인 지원",
        "안전한 브릿지 프로토콜",
        "낮은 수수료"
      ]
    }
  },

  tokenomics: {
    CROSS: {
      symbol: "CROSS",
      type: "Governance Token",
      description: "CROSS 생태계의 기본 토큰",
      utilities: ["거버넌스", "스테이킹", "수수료 할인"]
    },
    BNGO: {
      symbol: "BNGO",
      type: "Game Token",
      description: "주요 게임 토큰 중 하나",
      utilities: ["게임 내 결제", "NFT 거래", "리워드"]
    }
  },

  tradingGuide: {
    dexUsage: [
      "CROSSx 앱에서 DEX 섹션으로 이동",
      "거래하고자 하는 토큰 페어 선택",
      "주문 타입 선택 (Market/Limit)",
      "수량과 가격 입력",
      "거래 확인 및 실행"
    ],
    bridgeUsage: [
      "Bridge 섹션에서 출발/도착 체인 선택",
      "브릿지할 토큰과 수량 입력",
      "수수료 확인",
      "거래 승인 및 대기",
      "도착 체인에서 토큰 확인"
    ]
  },

  faq: {
    "CrossToken이 무엇인가요?": "CROSSx는 CROSS 블록체인 생태계의 올인원 Web3 슈퍼 앱으로, 게임 중심의 DeFi 서비스를 제공합니다.",
    "어떤 토큰을 거래할 수 있나요?": "BNGO, CROSS, ETH 등 다양한 게임 토큰과 주요 암호화폐를 거래할 수 있습니다.",
    "브릿지 수수료는 얼마인가요?": "브릿지 수수료는 네트워크 상황과 토큰에 따라 다르며, 거래 전 미리 확인할 수 있습니다.",
    "모바일에서도 사용할 수 있나요?": "네, CROSSx는 모바일 앱과 웹 버전을 모두 지원합니다.",
    "지갑 연결은 어떻게 하나요?": "MetaMask, 네이티브 CROSSx 지갑, 소셜 로그인(Google, Apple) 등을 지원합니다."
  },

  marketData: {
    BNGO: { currentPrice: 2.45, change24h: 12.5 },
    CROSS: { currentPrice: 0.89, change24h: 8.2 },
    ETH: { currentPrice: 2341, change24h: -2.1 }
  },

  socialMedia: {
    twitter: [
      "@henrychang10000",
      "@crossplay_xyz"
    ],
    updates: [
      "새로운 게임 토큰 상장",
      "브릿지 기능 업데이트",
      "커뮤니티 이벤트",
      "파트너십 발표"
    ]
  }
}