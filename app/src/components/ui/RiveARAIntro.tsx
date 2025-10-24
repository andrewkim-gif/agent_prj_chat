"use client"

import { useRive, Fit, Alignment } from '@rive-app/react-webgl2'
import { useEffect, useRef, useState, useCallback } from 'react'

interface RiveARAIntroProps {
  width?: number
  height?: number
  className?: string
}

export function RiveARAIntro({
  width = 200,
  height = 200,
  className = ""
}: RiveARAIntroProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isResized, setIsResized] = useState(false)

  const { RiveComponent, rive } = useRive({
    src: "/assets/ani/araintro.riv",
    autoplay: true,
    fit: Fit.Contain,
    alignment: Alignment.Center,
    devicePixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1,
    onLoad: () => {
      setIsLoaded(true)
    }
  })

  // 강제 고해상도 렌더링 함수
  const forceHighResolution = () => {
    if (!rive || !containerRef.current) return

    const canvas = containerRef.current.querySelector('canvas')
    if (!canvas) return

    const rect = containerRef.current.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1

    // 캔버스 실제 해상도를 높게 설정 (2배 확대)
    canvas.width = rect.width * dpr * 2
    canvas.height = rect.height * dpr * 2

    // CSS 표시 크기는 원래대로 유지
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`

    // WebGL 컨텍스트 뷰포트 조정
    const gl = canvas.getContext('webgl2')
    if (gl) {
      gl.viewport(0, 0, canvas.width, canvas.height)
    }

    // Rive 캔버스 리사이즈
    rive.resizeDrawingSurfaceToCanvas()

    // 리사이즈 완료 표시
    setTimeout(() => {
      setIsResized(true)
    }, 50)
  }

  // 해상도 최적화를 위한 리사이즈 처리
  useEffect(() => {
    if (!isLoaded || !rive) return

    // 컴포넌트를 일시적으로 숨김
    setIsResized(false)

    // 초기 로드 후 강제 고해상도 적용
    setTimeout(() => {
      forceHighResolution()
    }, 100)

    // 추가 보정을 위해 조금 더 기다린 후 한 번 더
    setTimeout(() => {
      forceHighResolution()
    }, 500)

    const handleResize = () => {
      forceHighResolution()
    }

    // 윈도우 리사이즈 이벤트 처리
    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [isLoaded, rive])

  // 컨테이너 크기 변경 감지
  useEffect(() => {
    if (!containerRef.current || !isLoaded || !rive) return

    const resizeObserver = new ResizeObserver(() => {
      // 컨테이너 크기가 변경될 때마다 강제 고해상도 적용
      setTimeout(() => {
        forceHighResolution()
      }, 50)
    })

    resizeObserver.observe(containerRef.current)

    return () => resizeObserver.disconnect()
  }, [isLoaded, rive])

  // 추가: Mutation Observer로 캔버스 변경 감지
  useEffect(() => {
    if (!containerRef.current || !isLoaded) return

    const mutationObserver = new MutationObserver(() => {
      // DOM 변경 시 고해상도 적용
      setTimeout(() => {
        forceHighResolution()
      }, 100)
    })

    mutationObserver.observe(containerRef.current, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'width', 'height']
    })

    return () => mutationObserver.disconnect()
  }, [isLoaded])

  return (
    <div
      ref={containerRef}
      className={`rive-intro-container ${className}`}
      style={{
        width,
        height,
        // 하드웨어 가속 및 안티앨리어싱 최적화
        transform: 'translateZ(0)',
        willChange: 'transform'
      }}
    >
      <RiveComponent
        style={{
          width: '100%',
          height: '100%',
          // 캔버스 렌더링 품질 최적화
          imageRendering: 'auto',
          // 리사이즈 완료될 때까지 투명하게 처리
          opacity: isLoaded && isResized ? 1 : 0
        }}
      />
    </div>
  )
}