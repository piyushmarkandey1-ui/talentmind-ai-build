'use client'

import { motion } from 'motion/react'
import { CheckCircle2, Sparkles, TrendingUp } from 'lucide-react'
import { useTheme } from './theme-provider'
import { cn } from '@/lib/utils'

const scores = [
  { label: 'Technical',  value: 95, darkColor: 'oklch(0.65 0.2 258)',  lightColor: '#2563EB' },
  { label: 'Experience', value: 90, darkColor: 'oklch(0.62 0.23 300)', lightColor: '#7C3AED' },
  { label: 'Leadership', value: 87, darkColor: 'oklch(0.78 0.14 200)', lightColor: '#0891B2' },
  { label: 'Learning',   value: 96, darkColor: 'oklch(0.72 0.16 162)', lightColor: '#059669' },
]

export function AnalysisPreview() {
  const { theme } = useTheme()
  const isLight = theme === 'light'

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-3xl p-1.5',
        isLight
          ? 'bg-white shadow-[0_40px_120px_-20px_rgba(37,99,235,0.2),0_20px_60px_-10px_rgba(163,177,198,0.5)] border border-white/90'
          : 'glass shadow-[0_40px_120px_-30px_rgba(0,0,0,0.8)]',
      )}
    >
      {/* Top accent line */}
      <div
        className="absolute inset-x-10 top-0 h-px"
        style={{
          background: isLight
            ? 'linear-gradient(90deg, transparent, rgba(37,99,235,0.4), transparent)'
            : 'linear-gradient(90deg, transparent, oklch(0.65 0.2 258), transparent)',
        }}
      />

      <div
        className={cn(
          'rounded-[1.4rem] p-5 text-left sm:p-7',
          isLight ? 'bg-white' : 'bg-[#0a0a0f]/80',
        )}
      >
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'grid size-11 place-items-center rounded-2xl text-base font-semibold',
                isLight
                  ? 'bg-gradient-to-br from-blue-100 to-violet-100 text-blue-700'
                  : 'bg-gradient-to-br from-blue/30 to-purple/30 text-foreground',
              )}
            >
              AR
            </div>
            <div>
              <p className={cn('text-sm font-semibold', isLight ? 'text-gray-900' : '')}>
                Amara Reyes
              </p>
              <p className={cn('text-xs', isLight ? 'text-gray-400' : 'text-muted-foreground')}>
                Senior Frontend Engineer · 6 yrs
              </p>
            </div>
          </div>
          <div
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium',
              isLight
                ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border border-emerald/30 bg-emerald/10 text-emerald',
            )}
          >
            <CheckCircle2 className="size-3.5" /> Strong recommend
          </div>
        </div>

        {/* Overall match */}
        <div className="mt-6 flex items-end justify-between">
          <div>
            <p className={cn('text-xs uppercase tracking-wider', isLight ? 'text-gray-400' : 'text-muted-foreground')}>
              Overall match
            </p>
            <p className={cn('mt-1 text-5xl font-semibold tracking-tight', isLight ? 'text-gray-900' : '')}>
              94
              <span className={cn('text-2xl', isLight ? 'text-gray-400' : 'text-muted-foreground')}>%</span>
            </p>
          </div>
          <div className={cn('inline-flex items-center gap-1 text-xs font-medium', isLight ? 'text-emerald-600' : 'text-emerald')}>
            <TrendingUp className="size-3.5" /> Top 3% for this role
          </div>
        </div>

        {/* Score bars */}
        <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4">
          {scores.map((s, i) => (
            <div key={s.label}>
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className={isLight ? 'text-gray-500' : 'text-muted-foreground'}>{s.label}</span>
                <span className={cn('font-medium', isLight ? 'text-gray-800' : 'text-foreground')}>{s.value}</span>
              </div>
              <div
                className={cn(
                  'h-1.5 overflow-hidden rounded-full',
                  isLight ? 'bg-gray-100' : 'bg-white/8',
                )}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: isLight ? s.lightColor : s.darkColor }}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${s.value}%` }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 1,
                    delay: 0.5 + i * 0.12,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* AI thinking bar */}
        <div
          className={cn(
            'mt-6 flex items-center gap-2 rounded-2xl px-4 py-3',
            isLight
              ? 'border border-blue-100 bg-blue-50/60'
              : 'border border-border bg-white/[0.03]',
          )}
        >
          <Sparkles className={cn('size-4 shrink-0', isLight ? 'text-blue-500' : 'text-cyan')} />
          <p className={cn('text-xs', isLight ? 'text-gray-500' : 'text-muted-foreground')}>
            <span className={cn('font-semibold', isLight ? 'text-blue-600' : 'text-foreground')}>Gemini:</span>{' '}
            Deep React + design systems expertise; led a 5-person platform team. Watch for limited backend exposure.
          </p>
          <span className="ml-auto flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className={cn('size-1.5 rounded-full', isLight ? 'bg-blue-400' : 'bg-cyan')}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{
                  duration: 1.2,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: i * 0.2,
                }}
              />
            ))}
          </span>
        </div>
      </div>
    </div>
  )
}
