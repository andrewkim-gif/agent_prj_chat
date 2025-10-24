"use client"

import { ReactNode, forwardRef } from 'react'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'

interface ScrollAnimatedProps {
  children: ReactNode
  animation?: 'fade-up' | 'fade-left' | 'fade-right' | 'scale-in' | 'slide-up' | 'bounce-in' | 'flip-in' | 'zoom-rotate' | 'elastic-in'
  delay?: 100 | 200 | 300 | 400 | 500
  className?: string
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
}

export const ScrollAnimated = forwardRef<HTMLDivElement, ScrollAnimatedProps>(
  ({
    children,
    animation = 'fade-up',
    delay,
    className = '',
    threshold = 0.1,
    rootMargin = '0px 0px -50px 0px',
    triggerOnce = true
  }, ref) => {
    const { elementRef, isVisible } = useScrollAnimation({
      threshold,
      rootMargin,
      triggerOnce
    })

    const animationClass = `animate-${animation}`
    const delayClass = delay ? `delay-${delay}` : ''

    const classes = [
      'scroll-animate',
      isVisible ? animationClass : '',
      delayClass,
      className
    ].filter(Boolean).join(' ')

    return (
      <div
        ref={(el) => {
          elementRef.current = el
          if (ref && typeof ref === 'function') {
            ref(el)
          } else if (ref) {
            ref.current = el
          }
        }}
        className={classes}
      >
        {children}
      </div>
    )
  }
)

ScrollAnimated.displayName = 'ScrollAnimated'