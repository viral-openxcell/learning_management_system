import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FormField } from '@/components/forms/FormField'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { authService } from '@/services/auth/auth.service'
import { ROUTE_PATHS } from '@/routes/routePaths'
import { toast } from '@/utils/toast'

const registerSchema = z
  .object({
    fullName: z.string().min(2, 'Enter your full name'),
    email: z.string().min(1, 'Email is required').email('Enter a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type RegisterFormValues = z.infer<typeof registerSchema>

export function RegisterPage() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) })

  async function onSubmit(values: RegisterFormValues) {
    setIsSubmitting(true)
    try {
      await authService.signUp({
        email: values.email,
        password: values.password,
        fullName: values.fullName,
      })
      navigate(ROUTE_PATHS.verifyEmail)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create account')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <h1 className="mb-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
        Create an account
      </h1>
      <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
        Start learning or teaching in minutes.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField label="Full name" htmlFor="fullName" error={errors.fullName?.message}>
          <Input id="fullName" autoComplete="name" {...register('fullName')} />
        </FormField>

        <FormField label="Email" htmlFor="email" error={errors.email?.message}>
          <Input id="email" type="email" autoComplete="email" {...register('email')} />
        </FormField>

        <FormField label="Password" htmlFor="password" error={errors.password?.message}>
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
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        Already have an account?{' '}
        <Link to={ROUTE_PATHS.login} className="font-medium text-brand-600 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
