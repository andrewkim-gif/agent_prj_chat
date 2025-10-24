"use client"

import { useRive } from '@rive-app/react-webgl2'
import { useEffect, useRef } from 'react'

interface RiveARAIntroSimpleProps {
  width?: number
  height?: number
  className?: string
}

export function RiveARAIntroSimple({
  width = 200,
  height = 200,
  className = ""
}: RiveARAIntroSimpleProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const { RiveComponent, rive } = useRive({
    src: "/assets/ani/araintro.riv",
    autoplay: true,
    // 최소한의 설정만 사용
    onLoad: () => {
      console.log('Rive loaded')
      // 로드 후 간단한 리사이즈만 수행
      if (rive) {
        setTimeout(() => {
          rive.resizeDrawingSurfaceToCanvas()
        }, 100)
      }
    }
  })

  // 단순한 리사이즈 처리
  useEffect(() => {
    if (!rive) return

    const handleResize = () => {
      rive.resizeDrawingSurfaceToCanvas()
    }

    // 초기 리사이즈
    setTimeout(handleResize, 200)

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [rive])

  return (
    <div
      ref={containerRef}
      className={`rive-intro-simple ${className}`}
      style={{
        width,
        height,
        // 캔버스 품질을 위한 최소 CSS
        imageRendering: 'auto'
      }}
    >
      <RiveComponent
        style={{
          width: '100%',
          height: '100%'
        }}
      />
    </div>
  )
}