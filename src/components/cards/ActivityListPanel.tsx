import type { LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/utils/cn'

export interface ActivityListItem {
  icon: LucideIcon
  toneClassName: string
  title: string
  subtitle?: string
  rightLabel: string
  rightTone?: 'positive' | 'negative' | 'neutral'
  groupLabel?: string
}

interface ActivityListPanelProps {
  title: string
  items: ActivityListItem[]
  viewAllHref?: string
  emptyLabel?: string
  bare?: boolean
}

const rightToneClasses = {
  positive: 'text-emerald-600 dark:text-emerald-400',
  negative: 'text-red-500 dark:text-red-400',
  neutral: 'text-slate-500 dark:text-slate-400',
}

export function ActivityListPanel({
  title,
  items,
  viewAllHref,
  emptyLabel = 'Nothing here yet.',
  bare = false,
}: ActivityListPanelProps) {
  const rows = items.map((item, index) => ({
    item,
    showGroup: Boolean(item.groupLabel) && item.groupLabel !== items[index - 1]?.groupLabel,
  }))

  return (
    <div className={cn('p-4', !bare && 'panel')}>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</p>
        {viewAllHref && (
          <Link
            to={viewAllHref}
            className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-400"
          >
            View All
          </Link>
        )}
      </div>

      {rows.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-400">{emptyLabel}</p>
      ) : (
        <div>
          {rows.map(({ item, showGroup }, index) => {
            return (
              <div key={index}>
                {showGroup && (
                  <p className="mb-1 mt-2 text-xs font-medium text-slate-400 first:mt-0">
                    {item.groupLabel}
                  </p>
                )}
                <div className="flex items-center gap-2.5 py-1">
                  <span
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl',
                      item.toneClassName,
                    )}
                  >
                    <item.icon className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                      {item.title}
                    </p>
                    {item.subtitle && (
                      <p className="truncate text-xs text-slate-400">{item.subtitle}</p>
                    )}
                  </div>
                  <span
                    className={cn(
                      'shrink-0 text-sm font-semibold',
                      rightToneClasses[item.rightTone ?? 'neutral'],
                    )}
                  >
                    {item.rightLabel}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
