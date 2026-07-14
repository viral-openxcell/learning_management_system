import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

type Variant = 'default' | 'success' | 'warning' | 'danger' | 'info'

const variantClasses: Record<Variant, string> = {
  default: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
  danger: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
  info: 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-400',
}

export function Badge({
  variant = 'default',
  children,
}: {
  variant?: Variant
  children: ReactNode
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variantClasses[variant],
      )}
    >
      {children}
    </span>
  )
}
