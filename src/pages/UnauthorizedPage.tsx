import { Link } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { ROUTE_PATHS } from '@/routes/routePaths'

export function UnauthorizedPage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 text-center">
      <ShieldAlert className="h-10 w-10 text-amber-500" />
      <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Access denied</h1>
      <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">
        You don't have permission to view this page. Contact an administrator if you think this is a
        mistake.
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
