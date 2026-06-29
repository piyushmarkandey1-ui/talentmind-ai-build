'use client'

import { motion } from 'motion/react'
import { CheckCircle2, Sparkles, TrendingUp } from 'lucide-react'

const scores = [
  { label: 'Technical', value: 95, color: 'oklch(0.65 0.2 258)' },
  { label: 'Experience', value: 90, color: 'oklch(0.62 0.23 300)' },
  { label: 'Leadership', value: 87, color: 'oklch(0.78 0.14 200)' },
  { label: 'Learning', value: 96, color: 'oklch(0.72 0.16 162)' },
]

export function AnalysisPreview() {
  return (
    <div className="glass relative overflow-hidden rounded-3xl p-1.5 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.8)]">
      {/* glowing top border */}
      <div
        className="absolute inset-x-10 top-0 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent, oklch(0.65 0.2 258), transparent)',
        }}
      />
      <div className="rounded-[1.4rem] bg-[#0a0a0f]/80 p-5 text-left sm:p-7">
        {/* header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-blue/30 to-purple/30 text-base font-semibold text-foreground">
              AR
            </div>
            <div>
              <p className="text-sm font-semibold">Amara Reyes</p>
              <p className="text-xs text-muted-foreground">
                Senior Frontend Engineer · 6 yrs
              </p>
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald/30 bg-emerald/10 px-3 py-1 text-xs font-medium text-emerald">
            <CheckCircle2 className="size-3.5" /> Strong recommend
          </div>
        </div>

        {/* overall match */}
        <div className="mt-6 flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Overall match
            </p>
            <p className="mt-1 text-5xl font-semibold tracking-tight">
              94<span className="text-2xl text-muted-foreground">%</span>
            </p>
          </div>
          <div className="inline-flex items-center gap-1 text-xs text-emerald">
            <TrendingUp className="size-3.5" /> Top 3% for this role
          </div>
        </div>

        {/* score bars */}
        <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4">
          {scores.map((s, i) => (
            <div key={s.label}>
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{s.label}</span>
                <span className="font-medium text-foreground">{s.value}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/8">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: s.color }}
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

        {/* AI thinking line */}
        <div className="mt-6 flex items-center gap-2 rounded-2xl border border-border bg-white/[0.03] px-4 py-3">
          <Sparkles className="size-4 shrink-0 text-cyan" />
          <p className="text-xs text-muted-foreground">
            <span className="text-foreground">Gemini:</span> Deep React + design
            systems expertise; led a 5-person platform team. Watch for limited
            backend exposure.
          </p>
          <span className="ml-auto flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="size-1.5 rounded-full bg-cyan"
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
