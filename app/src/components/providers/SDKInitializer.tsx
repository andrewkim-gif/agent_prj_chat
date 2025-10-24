/**
 * Cross SDK 초기화 컴포넌트
 * 클라이언트 사이드에서 SDK를 초기화함
 */

'use client'

import { useEffect } from 'react'
import { initializeWalletSDK } from '@/lib/wallet/sdk-setup'

export const SDKInitializer: React.FC = () => {
  useEffect(() => {
    // 클라이언트 사이드에서만 SDK 초기화
    if (typeof window !== 'undefined') {
      initializeWalletSDK()
    }
  }, [])

  // 이 컴포넌트는 UI를 렌더링하지 않음
  return null
}

export default SDKInitializer