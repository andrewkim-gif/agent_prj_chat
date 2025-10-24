"use client"

import { useEffect, useRef } from 'react'

interface RiveARAIntroAlternativeProps {
  width?: number
  height?: number
  className?: string
}

export function RiveARAIntroAlternative({
  width = 200,
  height = 200,
  className = ""
}: RiveARAIntroAlternativeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    let riveInstance: any = null

    const loadRive = async () => {
      try {
        // 동적으로 Rive 로드
        const { Rive } = await import('@rive-app/canvas-advanced')

        const canvas = canvasRef.current!
        const rect = canvas.getBoundingClientRect()
        const dpr = window.devicePixelRatio || 1

        // 고해상도 캔버스 설정
        canvas.width = width * dpr * 2
        canvas.height = height * dpr * 2
        canvas.style.width = `${width}px`
        canvas.style.height = `${height}px`

        // Rive 인스턴스 생성
        riveInstance = new Rive({
          src: "/assets/ani/araintro.riv",
          canvas: canvas,
          autoplay: true,
          fit: "contain",
          alignment: "center",
          onLoad: () => {
            console.log('Rive loaded with high resolution')
            // 로드 후 추가 해상도 보정
            canvas.width = width * dpr * 2
            canvas.height = height * dpr * 2
            riveInstance.resizeDrawingSurfaceToCanvas()
          },
          onLoadError: (error: any) => {
            console.error('Rive load error:', error)
          }
        })

      } catch (error) {
        console.error('Failed to load Rive:', error)
      }
    }

    loadRive()

    return () => {
      if (riveInstance) {
        riveInstance.cleanup()
      }
    }
  }, [width, height])

  return (
    <div
      className={`rive-intro-alternative ${className}`}
      style={{
        width,
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          imageRendering: 'pixelated',
          imageRendering: '-moz-crisp-edges',
          imageRendering: 'crisp-edges',
          transform: 'translateZ(0)',
          willChange: 'transform'
        }}
      />
    </div>
  )
}