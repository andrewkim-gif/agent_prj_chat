"use client"

import { useRive } from '@rive-app/react-webgl2'

interface RiveARALogoProps {
  width?: number
  height?: number
  className?: string
}

export function RiveARALogo({
  width = 48,
  height = 48,
  className = ""
}: RiveARALogoProps) {

  const { RiveComponent } = useRive({
    src: "/assets/ani/aralogo.riv",
    autoplay: true,
    onLoad: () => {
      // Animation loaded successfully
    }
  })

  return (
    <div
      className={`rive-container ${className}`}
      style={{ width, height }}
    >
      <RiveComponent style={{ width: '100%', height: '100%' }} />
    </div>
  )
}