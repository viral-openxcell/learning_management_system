import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { MailCheck } from 'lucide-react'
import { FormField } from '@/components/forms/FormField'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { authService } from '@/services/auth/auth.service'
import { ROUTE_PATHS } from '@/routes/routePaths'
import { toast } from '@/utils/toast'

const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
})

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

export function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSent, setIsSent] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({ resolver: zodResolver(forgotPasswordSchema) })

  async function onSubmit(values: ForgotPasswordFormValues) {
    setIsSubmitting(true)
    try {
      await authService.resetPasswordForEmail(values)
      setIsSent(true)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send reset email')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSent) {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <MailCheck className="h-8 w-8 text-brand-600" />
        <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Check your inbox
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          We've sent a password reset link to your email address.
        </p>
        <Link to={ROUTE_PATHS.login} className="text-sm font-medium text-brand-600 hover:underline">
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h1 className="mb-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
        Forgot password
      </h1>
      <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
        Enter your email and we'll send you a reset link.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField label="Email" htmlFor="email" error={errors.email?.message}>
          <Input id="email" type="email" autoComplete="email" {...register('email')} />
        </FormField>

        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          Send reset link
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        <Link to={ROUTE_PATHS.login} className="font-medium text-brand-600 hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  )
}
