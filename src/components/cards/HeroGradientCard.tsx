import type { LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AnimatedNumber } from '@/components/common/AnimatedNumber'
import { cn } from '@/utils/cn'

interface HeroGradientCardProps {
  variant: 'rose' | 'sky' | 'gold' | 'mint'
  label: string
  value: string | number
  icon?: LucideIcon
  description?: string
  viewAllHref?: string
  certificateStyle?: boolean
  code?: string
  holderName?: string
  issuedLabel?: string
}

const variantBg = {
  rose: 'bg-gradient-rose',
  sky: 'bg-gradient-sky',
  gold: 'bg-gradient-gold',
  mint: 'bg-gradient-mint',
}

export function HeroGradientCard({
  variant,
  label,
  value,
  icon: Icon,
  description,
  viewAllHref,
  certificateStyle,
  code,
  holderName,
  issuedLabel,
}: HeroGradientCardProps) {
  if (certificateStyle) {
    return (
      <div className={cn('rounded-card p-4 text-slate-900', variantBg[variant])}>
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-slate-700/80">{label}</p>
          <span className="flex h-5 w-9 shrink-0 items-center rounded-full bg-black/10 p-0.5">
            <span className="h-4 w-4 rounded-full bg-ink" />
          </span>
        </div>
        <p className="mt-4 font-display text-base font-semibold tracking-[0.15em]">{code}</p>
        <div className="mt-3 flex items-end justify-between text-xs">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-slate-700/60">
              Card Holder Name
            </p>
            <p className="font-medium">{holderName}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wide text-slate-700/60">Valid Thru</p>
            <p className="font-medium">{issuedLabel}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('rounded-card p-4', variantBg[variant])}>
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-slate-700/80">{label}</p>
        {viewAllHref && (
          <Link
            to={viewAllHref}
            className="text-[11px] font-medium text-slate-600 hover:text-slate-900 hover:underline"
          >
            View all
          </Link>
        )}
      </div>
      <div className="mt-2 flex items-center gap-2.5">
        {Icon && (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-ink text-white">
            <Icon className="h-4 w-4" />
          </span>
        )}
        {typeof value === 'number' ? (
          <AnimatedNumber
            value={value}
            className="font-display text-xl font-semibold text-slate-900"
          />
        ) : (
          <p className="font-display text-xl font-semibold text-slate-900">{value}</p>
        )}
      </div>
      {description && <p className="mt-1.5 text-xs font-medium text-slate-700/70">{description}</p>}
    </div>
  )
}
