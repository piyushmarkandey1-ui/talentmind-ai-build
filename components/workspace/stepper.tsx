'use client'

import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'
import { motion } from 'motion/react'

export type Step = {
  id: string
  label: string
  description: string
}

export function Stepper({
  steps,
  current,
  onStepClick,
}: {
  steps: Step[]
  current: number
  onStepClick?: (index: number) => void
}) {
  return (
    <ol className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-0">
      {steps.map((step, i) => {
        const state =
          i < current ? 'complete' : i === current ? 'active' : 'upcoming'
        const reachable = i <= current
        return (
          <li key={step.id} className="flex flex-1 items-center gap-2 sm:gap-3">
            <button
              type="button"
              disabled={!reachable || !onStepClick}
              onClick={() => reachable && onStepClick?.(i)}
              className={cn(
                'group flex items-center gap-2 sm:gap-3 rounded-2xl px-2 py-2 text-left transition-colors w-full sm:w-auto',
                reachable && onStepClick && 'hover:bg-white/5',
                !reachable && 'cursor-not-allowed',
              )}
            >
              <span
                className={cn(
                  'relative grid size-8 shrink-0 place-items-center rounded-xl border text-xs sm:size-9 sm:text-sm font-semibold transition-colors',
                  state === 'complete' &&
                    'border-transparent bg-emerald/20 text-emerald',
                  state === 'active' &&
                    'border-blue/50 bg-blue/15 text-foreground',
                  state === 'upcoming' &&
                    'border-border bg-white/[0.03] text-muted-foreground',
                )}
              >
                {state === 'complete' ? (
                  <Check className="size-3 sm:size-4" />
                ) : (
                  i + 1
                )}
                {state === 'active' && (
                  <motion.span
                    layoutId="step-glow"
                    className="absolute inset-0 -z-10 rounded-xl shadow-[0_0_24px_-4px] shadow-blue/60"
                  />
                )}
              </span>
              <span className="flex flex-col sm:flex min-w-0">
                <span
                  className={cn(
                    'text-xs font-medium sm:text-sm truncate',
                    state === 'upcoming'
                      ? 'text-muted-foreground'
                      : 'text-foreground',
                  )}
                >
                  {step.label}
                </span>
                <span className="hidden text-xs text-muted-foreground sm:block">
                  {step.description}
                </span>
              </span>
            </button>

            {i < steps.length - 1 && (
              <span className="hidden h-px flex-1 bg-gradient-to-r from-border to-transparent sm:block" />
            )}
          </li>
        )
      })}
    </ol>
  )
}
