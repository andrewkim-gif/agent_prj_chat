"use client"

import { ReactNode, CSSProperties } from 'react'
import { useParallax, useMouseParallax } from '@/hooks/useScrollAnimation'

interface ParallaxElementProps {
  children: ReactNode
  className?: string
  speed?: number
  enableMouseParallax?: boolean
  mouseIntensity?: number
}

export function ParallaxElement({
  children,
  className = '',
  speed = 0.5,
  enableMouseParallax = false,
  mouseIntensity = 0.1
}: ParallaxElementProps) {
  const { elementRef: scrollRef, offset } = useParallax()
  const { elementRef: mouseRef, transform } = useMouseParallax(mouseIntensity)

  const scrollStyle: CSSProperties = {
    transform: `translate3d(0, ${offset * speed}px, 0)`
  }

  const mouseStyle: CSSProperties = enableMouseParallax ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0) translate3d(0, ${offset * speed}px, 0)`
  } : scrollStyle

  return (
    <div
      ref={(el) => {
        scrollRef.current = el
        if (enableMouseParallax) {
          mouseRef.current = el
        }
      }}
      className={`parallax-element ${className}`}
      style={mouseStyle}
    >
      {children}
    </div>
  )
}