"use client"

import { useEffect, useRef, useState } from 'react'

interface RiveARAIntroAdvancedProps {
  width?: number
  height?: number
  className?: string
}

export function RiveARAIntroAdvanced({
  width = 200,
  height = 200,
  className = ""
}: RiveARAIntroAdvancedProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const riveInstanceRef = useRef<unknown>(null)
  const rendererRef = useRef<unknown>(null)
  const artboardRef = useRef<unknown>(null)
  const animationRef = useRef<unknown>(null)

  useEffect(() => {
    let animationId: number

    const initializeRive = async () => {
      try {

        // Dynamic import for @rive-app/webgl-advanced
        const RiveAdvanced = await import('@rive-app/webgl-advanced')

        if (!canvasRef.current) return

        const canvas = canvasRef.current
        const devicePixelRatio = window.devicePixelRatio || 1

        // Set canvas size with proper pixel ratio for high quality
        canvas.width = width * devicePixelRatio
        canvas.height = height * devicePixelRatio
        canvas.style.width = `${width}px`
        canvas.style.height = `${height}px`

        // Initialize Rive with high-quality settings
        const rive = await RiveAdvanced.default({
          locateFile: () => '/rive.wasm', // Make sure this path is correct
        })

        riveInstanceRef.current = rive

        // Load the .riv file
        const bytes = await fetch('/assets/ani/araintro.riv').then(res => res.arrayBuffer())
        const file = await rive.load(new Uint8Array(bytes))

        // Get artboard
        const artboard = file.defaultArtboard()
        artboardRef.current = artboard

        // Create renderer with high quality settings
        const renderer = rive.makeRenderer(canvas)
        rendererRef.current = renderer

        // Set up animations
        try {
          const stateMachine = artboard.stateMachineByName('State Machine 1')
          if (stateMachine) {
            animationRef.current = new rive.StateMachineInstance(stateMachine, artboard)
          } else {
            // Fallback to animations
            const appearAnim = artboard.animationByName('appear')
            const idleAnim = artboard.animationByName('idle')
            if (appearAnim) {
              animationRef.current = new rive.LinearAnimationInstance(appearAnim, artboard)
            }
          }
        } catch (error) {
        }

        // Configure layout with high quality
        // Note: Layout configuration is handled by the renderer

        setIsLoaded(true)

        // Custom render loop for maximum quality control
        const renderLoop = () => {
          if (!artboardRef.current || !rendererRef.current) return

          // Advance animation if available
          if (animationRef.current && typeof (animationRef.current as Record<string, unknown>).advance === 'function') {
            const deltaTime = 16.67 // ~60fps
            ;(animationRef.current as Record<string, unknown>).advance(deltaTime)
            if (typeof (animationRef.current as Record<string, unknown>).apply === 'function') {
              ;(animationRef.current as Record<string, unknown>).apply(1.0)
            }
          }

          // Clear and render with high quality
          rendererRef.current.clear()
          rendererRef.current.save()

          // Apply layout and render
          layout.runtimeArtboard(artboardRef.current)
          rendererRef.current.align(
            rive.Fit.contain,
            rive.Alignment.center,
            {
              minX: 0,
              minY: 0,
              maxX: canvas.width,
              maxY: canvas.height
            },
            artboardRef.current.bounds
          )

          artboardRef.current.draw(rendererRef.current)
          rendererRef.current.restore()

          animationId = requestAnimationFrame(renderLoop)
        }

        renderLoop()

      } catch (error) {
        // Initialization error - will continue without animation
      }
    }

    initializeRive()

    // Cleanup
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }

      // Cleanup Rive resources
      if (animationRef.current) {
        animationRef.current.delete()
      }
      if (artboardRef.current) {
        artboardRef.current.delete()
      }
      if (rendererRef.current) {
        rendererRef.current.delete()
      }
      if (riveInstanceRef.current) {
        riveInstanceRef.current.cleanup()
      }
    }
  }, [width, height])

  return (
    <div
      className={`rive-intro-advanced-container ${className}`}
      style={{ width, height }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          imageRendering: 'pixelated', // Prevent browser scaling blur
          transform: 'translateZ(0)', // Hardware acceleration
          willChange: 'transform'
        }}
      />
      {!isLoaded && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#666',
            fontSize: '12px'
          }}
        >
          Loading...
        </div>
      )}
    </div>
  )
}