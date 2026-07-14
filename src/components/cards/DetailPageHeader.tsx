import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info'

interface DetailPageHeaderProps {
  backHref: string
  backLabel?: string
  media: ReactNode
  title: string
  subtitle?: string
  badges?: { label: string; variant?: BadgeVariant }[]
  stats?: { label: string; value: string | number }[]
  editHref?: string
  onDelete?: () => void
}

export function DetailPageHeader({
  backHref,
  backLabel = 'Back to list',
  media,
  title,
  subtitle,
  badges,
  stats,
  editHref,
  onDelete,
}: DetailPageHeaderProps) {
  return (
    <div className="space-y-4">
      <Link
        to={backHref}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
      >
        <ArrowLeft className="h-4 w-4" /> {backLabel}
      </Link>

      <div className="panel flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          {media}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-100">
                {title}
              </h1>
              {badges?.map((badge) => (
                <Badge key={badge.label} variant={badge.variant ?? 'default'}>
                  {badge.label}
                </Badge>
              ))}
            </div>
            {subtitle && (
              <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
            )}
            {stats && stats.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                {stats.map((stat) => (
                  <span key={stat.label}>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      {stat.value}
                    </span>{' '}
                    {stat.label}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {(editHref || onDelete) && (
          <div className="flex shrink-0 gap-2">
            {editHref && (
              <Link to={editHref}>
                <Button variant="outline" size="sm">
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </Button>
              </Link>
            )}
            {onDelete && (
              <Button variant="danger" size="sm" onClick={onDelete}>
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
