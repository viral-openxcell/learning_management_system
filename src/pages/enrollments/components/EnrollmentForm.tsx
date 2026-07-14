import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FormField } from '@/components/forms/FormField'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { useCoursesQuery } from '@/hooks/useCourses'
import { useUsersQuery } from '@/hooks/useUsers'
import { ENROLLMENT_STATUS_LABELS, ENROLLMENT_STATUSES } from '@/constants/moduleEnums'

const enrollmentSchema = z.object({
  student_id: z.string().min(1, 'Select a student'),
  course_id: z.string().min(1, 'Select a course'),
  status: z.enum(ENROLLMENT_STATUSES),
})

export type EnrollmentFormValues = z.infer<typeof enrollmentSchema>

interface EnrollmentFormProps {
  defaultValues?: Partial<EnrollmentFormValues>
  lockStudentAndCourse?: boolean
  onSubmit: (values: EnrollmentFormValues) => Promise<void>
  isSubmitting?: boolean
}

export function EnrollmentForm({
  defaultValues,
  lockStudentAndCourse,
  onSubmit,
  isSubmitting,
}: EnrollmentFormProps) {
  const { data: courses } = useCoursesQuery({ pageSize: 100 })
  const { data: students } = useUsersQuery({ pageSize: 200, filters: { role: 'student' } })
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EnrollmentFormValues>({
    resolver: zodResolver(enrollmentSchema),
    defaultValues: { student_id: '', course_id: '', status: 'active', ...defaultValues },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField label="Student" htmlFor="student_id" error={errors.student_id?.message} required>
        <Select
          id="student_id"
          disabled={lockStudentAndCourse}
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
          disabled={lockStudentAndCourse}
          placeholder="Select a course"
          options={(courses?.data ?? []).map((course) => ({
            label: course.title,
            value: course.id,
          }))}
          {...register('course_id')}
        />
      </FormField>

      <FormField label="Status" htmlFor="status" error={errors.status?.message} required>
        <Select
          id="status"
          options={ENROLLMENT_STATUSES.map((status) => ({
            label: ENROLLMENT_STATUS_LABELS[status],
            value: status,
          }))}
          {...register('status')}
        />
      </FormField>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" isLoading={isSubmitting}>
          Save enrollment
        </Button>
      </div>
    </form>
  )
}
