import { cn } from '@/lib/utils'

export function Logo({
  className,
  showWordmark = true,
}: {
  className?: string
  showWordmark?: boolean
}) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div className="relative grid size-9 place-items-center rounded-xl border border-white/15 bg-white/5 shadow-[0_0_24px_-6px] shadow-blue/40">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="size-5"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="tm-logo" x1="0" y1="0" x2="24" y2="24">
              <stop offset="0%" stopColor="oklch(0.65 0.2 258)" />
              <stop offset="50%" stopColor="oklch(0.62 0.23 300)" />
              <stop offset="100%" stopColor="oklch(0.78 0.14 200)" />
            </linearGradient>
          </defs>
          <path
            d="M12 2c1.6 2.4 3.4 3.6 6 4-2.6.4-4.4 1.6-6 4-1.6-2.4-3.4-3.6-6-4 2.6-.4 4.4-1.6 6-4Z"
            fill="url(#tm-logo)"
          />
          <path
            d="M12 14c1 1.5 2.1 2.3 3.8 2.6-1.7.3-2.8 1.1-3.8 2.6-1-1.5-2.1-2.3-3.8-2.6 1.7-.3 2.8-1.1 3.8-2.6Z"
            fill="url(#tm-logo)"
            opacity="0.7"
          />
        </svg>
      </div>
      {showWordmark && (
        <span className="text-[15px] font-semibold tracking-tight text-foreground">
          TalentMind<span className="text-muted-foreground"> AI</span>
        </span>
      )}
    </div>
  )
}
