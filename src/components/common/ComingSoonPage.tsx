import { Construction } from 'lucide-react'

interface ComingSoonPageProps {
  title: string
  description?: string
}

export function ComingSoonPage({ title, description }: ComingSoonPageProps) {
  return (
    <div className="flex h-full min-h-[60vh] flex-col items-center justify-center gap-3 rounded-card border border-dashed border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
      <div className="rounded-full bg-brand-50 p-3 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
        <Construction className="h-6 w-6" />
      </div>
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
      <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">
        {description ?? 'This module is on the roadmap and will be built out in a future phase.'}
      </p>
    </div>
  )
}
