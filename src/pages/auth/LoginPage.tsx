import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Lock, LogIn, Mail } from 'lucide-react'
import { FormField } from '@/components/forms/FormField'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { authService } from '@/services/auth/auth.service'
import { ROUTE_PATHS } from '@/routes/routePaths'
import { toast } from '@/utils/toast'
import { USE_MOCK_DATA } from '@/lib/mockConfig'
import { ROLE_LABELS } from '@/constants/roles'
import { cn } from '@/utils/cn'

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormValues = z.infer<typeof loginSchema>

const DEMO_ACCOUNTS = [
  { email: 'owner@lms.dev', role: 'super_admin' as const },
  { email: 'admin@lms.dev', role: 'admin' as const },
  { email: 'daniel.chen@lms.dev', role: 'instructor' as const },
  { email: 'miguel.santos@lms.dev', role: 'student' as const },
]

export function LoginPage() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeDemo, setActiveDemo] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) })

  async function onSubmit(values: LoginFormValues) {
    setIsSubmitting(true)
    try {
      await authService.signIn(values)
      navigate(ROUTE_PATHS.dashboard)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to sign in')
    } finally {
      setIsSubmitting(false)
      setActiveDemo(null)
    }
  }

  function quickLogin(email: string) {
    setActiveDemo(email)
    setValue('email', email)
    setValue('password', 'demo1234')
    onSubmit({ email, password: 'demo1234' })
  }

  return (
    <div>
      <h1 className="font-display mb-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">
        Welcome back
      </h1>
      <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
        Sign in to continue to your dashboard.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField label="Email" htmlFor="email" error={errors.email?.message}>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="pl-9"
              {...register('email')}
            />
          </div>
        </FormField>

        <FormField label="Password" htmlFor="password" error={errors.password?.message}>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              className="pl-9"
              {...register('password')}
            />
          </div>
        </FormField>

        <div className="flex justify-end">
          <Link
            to={ROUTE_PATHS.forgotPassword}
            className="text-sm font-medium text-brand-600 hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          <LogIn className="h-4 w-4" />
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        Don't have an account?{' '}
        <Link to={ROUTE_PATHS.register} className="font-medium text-brand-600 hover:underline">
          Sign up
        </Link>
      </p>

      {USE_MOCK_DATA && (
        <div className="mt-6 rounded-2xl border border-dashed border-brand-200 bg-brand-50/50 p-3 dark:border-brand-800 dark:bg-brand-950/20">
          <p className="mb-2 text-xs font-medium text-brand-700 dark:text-brand-300">
            Running on mock data — sign in as:
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.email}
                type="button"
                onClick={() => quickLogin(account.email)}
                disabled={isSubmitting}
                className={cn(
                  'rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors',
                  activeDemo === account.email
                    ? 'border-brand-400 bg-brand-100 text-brand-700 dark:border-brand-600 dark:bg-brand-900/50 dark:text-brand-200'
                    : 'border-transparent bg-white text-slate-600 hover:border-brand-200 hover:bg-white dark:bg-slate-800/60 dark:text-slate-300 dark:hover:border-brand-700',
                )}
              >
                {ROLE_LABELS[account.role]}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
