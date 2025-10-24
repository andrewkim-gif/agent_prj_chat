"use client"

import { useRef, useEffect, useState, useCallback } from 'react'

interface UseAutoScrollOptions {
  threshold?: number // 하단에서 얼마나 떨어져야 자동 스크롤을 멈출지 (px)
  enableOnMount?: boolean
}

export function useAutoScroll({
  threshold = 100,
  enableOnMount = true
}: UseAutoScrollOptions = {}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(enableOnMount)
  const [isUserScrolling, setIsUserScrolling] = useState(false)
  const lastScrollTopRef = useRef(0)
  const scrollTimeoutRef = useRef<NodeJS.Timeout>()
  const isAutoScrollingRef = useRef(false) // 자동 스크롤 실행 중 플래그

  // 사용자가 하단 근처에 있는지 확인
  const isNearBottom = useCallback(() => {
    const container = scrollContainerRef.current
    if (!container) return false

    const { scrollTop, scrollHeight, clientHeight } = container
    return scrollHeight - scrollTop - clientHeight <= threshold
  }, [threshold])

  // 부드럽게 하단으로 스크롤
  const scrollToBottom = useCallback((behavior: 'smooth' | 'auto' = 'smooth') => {
    const container = scrollContainerRef.current
    if (!container) {
      console.log('❌ scrollToBottom: no container')
      return
    }

    console.log('⬇️ scrollToBottom called:', { behavior, scrollHeight: container.scrollHeight })

    // 자동 스크롤 실행 중 플래그 설정
    isAutoScrollingRef.current = true

    container.scrollTo({
      top: container.scrollHeight,
      behavior
    })

    // 스크롤 완료 후 플래그 해제
    setTimeout(() => {
      isAutoScrollingRef.current = false
    }, behavior === 'smooth' ? 500 : 100)
  }, [])

  // 자동 스크롤 강제 활성화 (새 메시지 전송 시 등)
  const enableAutoScroll = useCallback(() => {
    console.log('🔄 enableAutoScroll called')
    setIsAutoScrollEnabled(true)
    setIsUserScrolling(false) // 사용자 스크롤 상태도 리셋
    scrollToBottom('smooth')
  }, [scrollToBottom])

  // 스크롤 이벤트 핸들러
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current
    if (!container) return

    // 자동 스크롤 실행 중일 때는 스크롤 이벤트를 무시
    if (isAutoScrollingRef.current) return

    const currentScrollTop = container.scrollTop
    const isScrollingUp = currentScrollTop < lastScrollTopRef.current

    // 사용자 스크롤 상태를 즉시 설정
    setIsUserScrolling(true)
    clearTimeout(scrollTimeoutRef.current)

    // 사용자가 위로 스크롤하고 있으면 자동 스크롤 비활성화
    if (isScrollingUp && !isNearBottom()) {
      setIsAutoScrollEnabled(false)
    }
    // 사용자가 하단 근처로 스크롤하면 자동 스크롤 재활성화
    else if (isNearBottom()) {
      setIsAutoScrollEnabled(true)
    }

    lastScrollTopRef.current = currentScrollTop

    // 스크롤이 멈춘 후 일정 시간 후에 사용자 스크롤 상태 해제
    scrollTimeoutRef.current = setTimeout(() => {
      setIsUserScrolling(false)
    }, 300) // 300ms로 늘려서 더 안정적으로
  }, [isNearBottom])

  // 스크롤 컨테이너에 이벤트 리스너 등록
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    // passive: false로 설정하여 더 즉각적으로 반응하도록 함
    container.addEventListener('scroll', handleScroll, { passive: false })

    return () => {
      container.removeEventListener('scroll', handleScroll)
      clearTimeout(scrollTimeoutRef.current)
    }
  }, [handleScroll])

  // 컨텐츠 변경 시 자동 스크롤 (메시지 추가, 스트리밍 등)
  const handleContentChange = useCallback(() => {
    if (isAutoScrollEnabled && !isUserScrolling) {
      // 스트리밍 중에는 부드러운 스크롤 대신 즉시 스크롤
      scrollToBottom('auto')
    }
  }, [isAutoScrollEnabled, isUserScrolling, scrollToBottom])

  return {
    scrollContainerRef,
    isAutoScrollEnabled,
    isUserScrolling,
    scrollToBottom,
    enableAutoScroll,
    handleContentChange,
    isNearBottom
  }
}