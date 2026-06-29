'use client'

import { Button } from '@/components/ui/button'
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import { ArrowRight, Sparkles, Star } from 'lucide-react'
import type { PointerEvent } from 'react'
import { AnalysisPreview } from './analysis-preview'

const easing = [0.21, 0.47, 0.32, 0.98] as const

export function Hero() {
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
      <motion.a
        href="#product"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: easing }}
        className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <Sparkles className="size-3.5 text-cyan" />
        Powered by Google Gemini
        <span className="text-foreground/30">·</span>
        <span className="inline-flex items-center gap-1 text-foreground">
          Now in beta <ArrowRight className="size-3" />
        </span>
      </motion.a>

      <motion.h1
        initial={{ opacity: 0, y: 24, filter: 'blur(10px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.8, delay: 0.08, ease: easing }}
        className="mt-7 max-w-4xl text-balance text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl"
      >
        The AI hiring operating
        <br className="hidden sm:block" /> system for{' '}
        <span className="text-gradient">modern recruiters</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.16, ease: easing }}
        className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground"
      >
        TalentMind reads resumes the way your best recruiter does — understanding
        context, comparing candidates to the role, ranking by true fit, and
        explaining every recommendation.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.24, ease: easing }}
        className="mt-9 flex flex-col items-center gap-3 sm:flex-row"
      >
        <Button
          size="lg"
          className="group h-12 rounded-xl bg-foreground px-6 text-background hover:bg-foreground/90"
        >
          Analyze your first candidate
          <ArrowRight className="ml-1 size-4 transition-transform group-hover:translate-x-0.5" />
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="h-12 rounded-xl border-border bg-white/5 px-6 hover:bg-white/10"
        >
          Watch the demo
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.32 }}
        className="mt-6 flex items-center gap-2 text-sm text-muted-foreground"
      >
        <div className="flex">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className="size-3.5 fill-cyan text-cyan"
              aria-hidden="true"
            />
          ))}
        </div>
        Trusted by talent teams evaluating 100k+ candidates
      </motion.div>

      {/* Floating preview */}
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
