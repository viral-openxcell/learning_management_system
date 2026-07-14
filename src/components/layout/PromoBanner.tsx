import { Sparkles, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useUiStore } from '@/store/ui.store'
import { ROUTE_PATHS } from '@/routes/routePaths'

export function PromoBanner() {
  const isDismissed = useUiStore((s) => s.promoBannerDismissed)
  const dismiss = useUiStore((s) => s.dismissPromoBanner)

  if (isDismissed) return null

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-brand-100 via-blue-50 to-amber-50 px-4 py-2.5 text-sm text-slate-700 dark:from-brand-500/15 dark:via-blue-500/10 dark:to-amber-500/10 dark:text-slate-200">
      <p className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 shrink-0 text-brand-600 dark:text-brand-300" />
        New here? Start by adding lessons to a course in{' '}
        <Link
          to={ROUTE_PATHS.curriculumLessons}
          className="font-semibold text-brand-700 hover:underline dark:text-brand-300"
        >
          Curriculum & Lessons
        </Link>
        .
      </p>
      <button
        onClick={dismiss}
        className="shrink-0 rounded-full p-1 text-slate-500 hover:bg-white/60 dark:text-slate-400 dark:hover:bg-white/10"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
