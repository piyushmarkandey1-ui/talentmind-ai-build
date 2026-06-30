'use client'

import { useEffect, useRef } from 'react'
import { useTheme } from './theme-provider'

/**
 * Full-bleed ambient backdrop.
 * Dark mode: aurora gradient blobs, radial lighting, floating particles, noise.
 * Light mode: soft geometric mesh with gentle pastel orbs — clean & premium.
 */
export function AuroraBackground() {
  const { theme } = useTheme()
  const isLight = theme === 'light'

  if (isLight) return <LightBackground />
  return <DarkBackground />
}

function LightBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #F4F6F8 0%, #EEF2F7 50%, #F4F6F8 100%)' }}
    >
      {/* Soft pastel orb — top center */}
      <div
        className="absolute -top-24 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full"
        style={{
          background: 'radial-gradient(circle at center, rgba(37,99,235,0.06), transparent 65%)',
          animation: 'mesh-drift 20s ease-in-out infinite',
        }}
      />
      {/* Soft orb — bottom left */}
      <div
        className="absolute -bottom-32 -left-32 h-[32rem] w-[32rem] rounded-full"
        style={{
          background: 'radial-gradient(circle at center, rgba(124,58,237,0.05), transparent 60%)',
          animation: 'mesh-drift 24s ease-in-out infinite 3s',
        }}
      />
      {/* Soft orb — top right */}
      <div
        className="absolute -right-24 top-1/4 h-[28rem] w-[28rem] rounded-full"
        style={{
          background: 'radial-gradient(circle at center, rgba(8,145,178,0.04), transparent 60%)',
          animation: 'mesh-drift 18s ease-in-out infinite 1.5s',
        }}
      />

      {/* Subtle dot grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(15,25,35,0.08) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Very subtle vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(120% 80% at 50% 0%, transparent 60%, rgba(244,246,248,0.8) 100%)',
        }}
      />
    </div>
  )
}

function DarkBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background"
    >
      {/* Aurora blobs */}
      <div
        className="absolute -top-40 left-1/2 h-[42rem] w-[42rem] -translate-x-1/2 rounded-full blur-[120px]"
        style={{
          background:
            'radial-gradient(circle at center, oklch(0.62 0.21 264 / 0.45), transparent 60%)',
          animation: 'aurora 16s ease-in-out infinite',
        }}
      />
      <div
        className="absolute -left-32 top-1/3 h-[34rem] w-[34rem] rounded-full blur-[120px]"
        style={{
          background:
            'radial-gradient(circle at center, oklch(0.62 0.23 300 / 0.38), transparent 60%)',
          animation: 'aurora 20s ease-in-out infinite 2s',
        }}
      />
      <div
        className="absolute -right-32 top-1/4 h-[30rem] w-[30rem] rounded-full blur-[120px]"
        style={{
          background:
            'radial-gradient(circle at center, oklch(0.78 0.14 200 / 0.30), transparent 60%)',
          animation: 'aurora 18s ease-in-out infinite 1s',
        }}
      />

      <Particles />

      {/* Noise + vignette */}
      <div className="noise absolute inset-0 opacity-[0.04] mix-blend-overlay" />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 80% at 50% 0%, transparent 40%, #050505 100%)',
        }}
      />
    </div>
  )
}

function Particles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let w = 0
    let h = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    type P = { x: number; y: number; vx: number; vy: number; r: number; o: number }
    let particles: P[] = []

    const resize = () => {
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = Math.min(70, Math.floor((w * h) / 22000))
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.6 + 0.4,
        o: Math.random() * 0.5 + 0.1,
      }))
    }

    const tick = () => {
      ctx.clearRect(0, 0, w, h)
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > w) p.vx *= -1
        if (p.y < 0 || p.y > h) p.vy *= -1
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${p.o})`
        ctx.fill()
      }
      raf = requestAnimationFrame(tick)
    }

    resize()
    tick()
    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
}
