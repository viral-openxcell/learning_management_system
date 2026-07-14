import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FormField } from '@/components/forms/FormField'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Checkbox } from '@/components/ui/Checkbox'
import { Button } from '@/components/ui/Button'
import { RoleSelect } from './RoleSelect'
import { ROLES, type Role } from '@/constants/roles'

const userFormSchema = z.object({
  full_name: z.string().min(2, 'Enter a full name'),
  email: z.string().email('Enter a valid email').optional(),
  role: z.enum(ROLES),
  phone: z.string().optional(),
  bio: z.string().optional(),
  department: z.string().optional(),
  location: z.string().optional(),
  is_active: z.boolean(),
})

export type UserFormValues = z.infer<typeof userFormSchema>

interface UserFormProps {
  mode?: 'create' | 'edit'
  defaultValues: UserFormValues
  onSubmit: (values: UserFormValues) => Promise<void>
  isSubmitting?: boolean
}

export function UserForm({ mode = 'edit', defaultValues, onSubmit, isSubmitting }: UserFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<UserFormValues>({ resolver: zodResolver(userFormSchema), defaultValues })

  const role = watch('role')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField label="Full name" htmlFor="full_name" error={errors.full_name?.message} required>
        <Input id="full_name" {...register('full_name')} />
      </FormField>

      {mode === 'create' && (
        <FormField label="Email" htmlFor="email" error={errors.email?.message} required>
          <Input id="email" type="email" {...register('email')} />
        </FormField>
      )}

      <FormField label="Role" htmlFor="role" error={errors.role?.message} required>
        <RoleSelect id="role" value={role as Role} onChange={(value) => setValue('role', value)} />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Phone" htmlFor="phone" error={errors.phone?.message}>
          <Input id="phone" {...register('phone')} />
        </FormField>

        <FormField label="Department" htmlFor="department" error={errors.department?.message}>
          <Input id="department" {...register('department')} />
        </FormField>
      </div>

      <FormField label="Location" htmlFor="location" error={errors.location?.message}>
        <Input id="location" {...register('location')} />
      </FormField>

      <FormField label="Bio" htmlFor="bio" error={errors.bio?.message}>
        <Textarea id="bio" rows={3} {...register('bio')} />
      </FormField>

      <Checkbox id="is_active" label="Active" {...register('is_active')} />

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" isLoading={isSubmitting}>
          {mode === 'create' ? 'Create user' : 'Save changes'}
        </Button>
      </div>
    </form>
  )
}
