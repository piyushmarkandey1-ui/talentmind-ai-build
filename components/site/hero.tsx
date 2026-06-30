'use client'

import { Button } from '@/components/ui/button'
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import { ArrowRight, Sparkles, Star } from 'lucide-react'
import Link from 'next/link'
import type { PointerEvent } from 'react'
import { AnalysisPreview } from './analysis-preview'
import { useTheme } from './theme-provider'
import { cn } from '@/lib/utils'

const easing = [0.21, 0.47, 0.32, 0.98] as const

export function Hero() {
  const { theme } = useTheme()
  const isLight = theme === 'light'

  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [6, -6]), {
    stiffness: 120,
    damping: 18,
  })
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-6, 6]), {
    stiffness: 120,
    damping: 18,
  })

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    mx.set((e.clientX - rect.left) / rect.width - 0.5)
    my.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  return (
    <section className="relative mx-auto flex max-w-6xl flex-col items-center px-6 pb-20 pt-36 text-center sm:pt-44">
      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: easing }}
        className={cn(
          'inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs',
          isLight
            ? 'bg-white text-gray-500 shadow-[4px_4px_12px_rgba(163,177,198,0.4),-4px_-4px_12px_rgba(255,255,255,0.9)] border border-white/90'
            : 'glass text-muted-foreground',
        )}
      >
        <Sparkles className={cn('size-3.5', isLight ? 'text-blue-500' : 'text-cyan')} aria-hidden="true" />
        Powered by Google Gemini
        <span className={isLight ? 'text-gray-300' : 'text-foreground/30'} aria-hidden="true">·</span>
        <span className={cn('inline-flex items-center gap-1', isLight ? 'text-blue-600 font-medium' : 'text-foreground')}>
          Now in beta
        </span>
      </motion.div>

      {/* Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 24, filter: 'blur(10px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.8, delay: 0.08, ease: easing }}
        className="mt-7 max-w-4xl text-balance text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
      >
        The AI hiring operating
        <br className="hidden sm:block" /> system for{' '}
        <span className="text-gradient">modern recruiters</span>
      </motion.h1>

      {/* Sub */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.16, ease: easing }}
        className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg"
      >
        TalentMind reads resumes the way your best recruiter does — understanding
        context, comparing candidates to the role, ranking by true fit, and
        explaining every recommendation.
      </motion.p>

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.24, ease: easing }}
        className="mt-9 flex flex-col items-center gap-3 sm:flex-row"
      >
        <Button
          asChild
          size="lg"
          className={cn(
            'group h-12 rounded-xl px-6 transition-all duration-200',
            isLight
              ? 'bg-[#2563EB] text-white hover:bg-[#1D4ED8] shadow-[0_4px_14px_rgba(37,99,235,0.4)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.5)] hover:-translate-y-px'
              : 'bg-foreground text-background hover:bg-foreground/90',
          )}
        >
          <Link href="/workspace">
            Analyze your first candidate
            <ArrowRight className="ml-1 size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </Button>
      </motion.div>

      {/* Social proof */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.32 }}
        className="mt-6 flex items-center gap-2 text-sm text-muted-foreground"
      >
        <div className="flex" aria-hidden="true">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn('size-3.5', isLight ? 'fill-amber-400 text-amber-400' : 'fill-cyan text-cyan')}
            />
          ))}
        </div>
        Trusted by talent teams evaluating 100k+ candidates
      </motion.div>

      {/* Floating preview with 3D tilt */}
      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1, delay: 0.4, ease: easing }}
        onPointerMove={onMove}
        onPointerLeave={() => {
          mx.set(0)
          my.set(0)
        }}
        style={{ perspective: 1200 }}
        className="mt-16 w-full max-w-4xl"
      >
        <motion.div style={{ rotateX: rx, rotateY: ry }}>
          <AnalysisPreview />
        </motion.div>
      </motion.div>
    </section>
  )
}
