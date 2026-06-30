'use client'

import { AnimatedCounter } from './animated-counter'
import { Reveal } from './reveal'
import { useTheme } from './theme-provider'
import { cn } from '@/lib/utils'

const stats = [
  { value: 94, suffix: '%', label: 'Match accuracy vs. hires' },
  { value: 11, suffix: '', label: 'Evaluation dimensions' },
  { value: 8, suffix: 'x', label: 'Faster shortlisting' },
  { value: 100, suffix: 'k+', label: 'Candidates analyzed' },
]

export function Stats() {
  const { theme } = useTheme()
  const isLight = theme === 'light'

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.08}>
            <div
              className={cn(
                'rounded-3xl p-6 text-center transition-all duration-300',
                isLight
                  ? 'bg-white shadow-[8px_8px_20px_rgba(163,177,198,0.5),-8px_-8px_20px_rgba(255,255,255,0.9)] border border-white/80 hover:shadow-[12px_12px_28px_rgba(163,177,198,0.55),-12px_-12px_28px_rgba(255,255,255,0.95)] hover:-translate-y-1'
                  : 'glass',
              )}
            >
              <p className={cn(
                'text-4xl font-semibold tracking-tight sm:text-5xl',
                isLight ? 'text-gray-900' : 'text-foreground',
              )}>
                <AnimatedCounter value={s.value} suffix={s.suffix} />
              </p>
              <p className={cn('mt-2 text-sm', isLight ? 'text-gray-500' : 'text-muted-foreground')}>
                {s.label}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
