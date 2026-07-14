import type { LucideIcon } from 'lucide-react'
import { motion } from 'motion/react'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { Skeleton } from '@/components/ui/Skeleton'
import { AnimatedNumber } from '@/components/common/AnimatedNumber'
import { cn } from '@/utils/cn'

type Tone = 'brand' | 'orange' | 'blue' | 'rose' | 'emerald'

const toneClasses: Record<Tone, string> = {
  brand: 'bg-gradient-brand text-white',
  orange: 'bg-orange-500/10 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400',
  blue: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400',
  rose: 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400',
  emerald: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400',
}

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  tone?: Tone
  trend?: { value: number; label?: string }
  isLoading?: boolean
  index?: number
}

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = 'brand',
  trend,
  isLoading,
  index = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      className="panel p-5"
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
            toneClasses[tone],
          )}
        >
          <Icon className="h-5 w-5" />
        </div>

        {isLoading ? (
          <Skeleton className="h-7 w-16" />
        ) : typeof value === 'number' ? (
          <AnimatedNumber
            value={value}
            className="font-display text-2xl font-semibold text-slate-900 dark:text-slate-100"
          />
        ) : (
          <p className="font-display text-2xl font-semibold text-slate-900 dark:text-slate-100">
            {value}
          </p>
        )}

        {trend && !isLoading && (
          <span
            className={cn(
              'ml-auto flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium',
              trend.value >= 0
                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
            )}
          >
            {trend.value >= 0 ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            {Math.abs(trend.value)}%
          </span>
        )}
      </div>

      <p className="mt-3 text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
    </motion.div>
  )
}
