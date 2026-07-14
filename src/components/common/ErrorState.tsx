import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface ErrorStateProps {
  title?: string
  description?: string
  onRetry?: () => void
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'Please try again, or contact support if the problem persists.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-card bg-red-50 py-14 text-center shadow-sm dark:bg-red-950/30 dark:ring-1 dark:ring-red-900/50">
      <div className="rounded-full bg-red-100 p-3 text-red-600 dark:bg-red-900/40 dark:text-red-400">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
      <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">{description}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}
