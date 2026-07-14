import { Link } from 'react-router-dom'
import { MailCheck } from 'lucide-react'
import { ROUTE_PATHS } from '@/routes/routePaths'

export function VerifyEmailPage() {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <MailCheck className="h-8 w-8 text-brand-600" />
      <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
        Verify your email
      </h1>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        We've sent a confirmation link to your email address. Click it to activate your account,
        then sign in.
      </p>
      <Link to={ROUTE_PATHS.login} className="text-sm font-medium text-brand-600 hover:underline">
        Back to sign in
      </Link>
    </div>
  )
}
