import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FormField } from '@/components/forms/FormField'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { authService } from '@/services/auth/auth.service'
import { ROUTE_PATHS } from '@/routes/routePaths'
import { toast } from '@/utils/toast'

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({ resolver: zodResolver(resetPasswordSchema) })

  async function onSubmit(values: ResetPasswordFormValues) {
    setIsSubmitting(true)
    try {
      await authService.updatePassword({ password: values.password })
      toast.success('Password updated — you can now sign in')
      navigate(ROUTE_PATHS.login)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to reset password')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <h1 className="mb-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
        Set a new password
      </h1>
      <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
        This link opened a temporary session — choose a new password to finish resetting.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField label="New password" htmlFor="password" error={errors.password?.message}>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            {...register('password')}
          />
        </FormField>

        <FormField
          label="Confirm password"
          htmlFor="confirmPassword"
          error={errors.confirmPassword?.message}
        >
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            {...register('confirmPassword')}
          />
        </FormField>

        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          Update password
        </Button>
      </form>
    </div>
  )
}
