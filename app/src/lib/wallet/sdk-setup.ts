/**
 * Cross SDK 초기화 및 설정
 */

import { initCrossSdk } from '@to-nexus/sdk/react'
import { SDK_CONFIG } from './config'

/**
 * Cross SDK 초기화 함수
 * 앱 시작 시 한 번만 호출되어야 함
 */
export const initializeWalletSDK = (): void => {
  try {
    // 브라우저 환경에서만 초기화
    if (typeof window === 'undefined') {
      console.warn('Wallet SDK는 브라우저 환경에서만 초기화됩니다.')
      return
    }

    // 필수 환경 변수 확인
    if (!SDK_CONFIG.projectId) {
      console.error('NEXT_PUBLIC_CROSS_PROJECT_ID 환경 변수가 설정되지 않았습니다.')
      return
    }

    console.log('Cross SDK 초기화 중...', {
      projectId: SDK_CONFIG.projectId?.slice(0, 8) + '...',
      redirectUrl: SDK_CONFIG.redirectUrl,
      themeMode: SDK_CONFIG.themeMode,
      defaultNetwork: SDK_CONFIG.defaultNetwork.name
    })

    // Cross SDK 초기화
    initCrossSdk(
      SDK_CONFIG.projectId,
      SDK_CONFIG.redirectUrl,
      SDK_CONFIG.metadata,
      SDK_CONFIG.themeMode,
      SDK_CONFIG.defaultNetwork
    )

    console.log('Cross SDK 초기화 완료')
  } catch (error) {
    console.error('Cross SDK 초기화 실패:', error)
  }
}

/**
 * SDK 초기화 상태 확인
 */
export const isSDKInitialized = (): boolean => {
  try {
    // SDK가 초기화되었는지 확인하는 방법
    // @to-nexus/sdk에서 제공하는 확인 방법이 있다면 사용
    return typeof window !== 'undefined' && Boolean(window)
  } catch {
    return false
  }
}

/**
 * SDK 재초기화 (필요한 경우)
 */
export const reinitializeSDK = (): void => {
  console.log('SDK 재초기화 시도...')
  initializeWalletSDK()
}