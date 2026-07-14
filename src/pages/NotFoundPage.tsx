import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { ROUTE_PATHS } from '@/routes/routePaths'

export function NotFoundPage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 text-center">
      <Compass className="h-10 w-10 text-brand-500" />
      <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Page not found</h1>
      <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">
        The page you're looking for doesn't exist or has moved.
      </p>
      <Link
        to={ROUTE_PATHS.dashboard}
        className="inline-flex h-10 items-center justify-center rounded-lg bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700"
      >
        Back to dashboard
      </Link>
    </div>
  )
}
