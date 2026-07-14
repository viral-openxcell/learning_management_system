import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FormField } from '@/components/forms/FormField'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { useCoursesQuery } from '@/hooks/useCourses'
import { useUsersQuery } from '@/hooks/useUsers'

const certificateSchema = z.object({
  student_id: z.string().min(1, 'Select a student'),
  course_id: z.string().min(1, 'Select a course'),
  grade: z.string().optional(),
  final_score: z.number().min(0).max(100).optional(),
})

export type CertificateFormValues = z.infer<typeof certificateSchema>

interface CertificateFormProps {
  onSubmit: (values: CertificateFormValues) => Promise<void>
  isSubmitting?: boolean
}

export function CertificateForm({ onSubmit, isSubmitting }: CertificateFormProps) {
  const { data: courses } = useCoursesQuery({ pageSize: 100 })
  const { data: students } = useUsersQuery({ pageSize: 200, filters: { role: 'student' } })
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CertificateFormValues>({
    resolver: zodResolver(certificateSchema),
    defaultValues: { student_id: '', course_id: '', grade: '', final_score: undefined },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField label="Student" htmlFor="student_id" error={errors.student_id?.message} required>
        <Select
          id="student_id"
          placeholder="Select a student"
          options={(students?.data ?? []).map((s) => ({
            label: s.full_name ?? s.email,
            value: s.id,
          }))}
          {...register('student_id')}
        />
      </FormField>

      <FormField label="Course" htmlFor="course_id" error={errors.course_id?.message} required>
        <Select
          id="course_id"
          placeholder="Select a course"
          options={(courses?.data ?? []).map((course) => ({
            label: course.title,
            value: course.id,
          }))}
          {...register('course_id')}
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Grade" htmlFor="grade" error={errors.grade?.message} hint="e.g. A, B+">
          <Input id="grade" {...register('grade')} />
        </FormField>

        <FormField
          label="Final score (%)"
          htmlFor="final_score"
          error={errors.final_score?.message}
        >
          <Input
            id="final_score"
            type="number"
            min="0"
            max="100"
            {...register('final_score', { valueAsNumber: true })}
          />
        </FormField>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" isLoading={isSubmitting}>
          Issue certificate
        </Button>
      </div>
    </form>
  )
}
