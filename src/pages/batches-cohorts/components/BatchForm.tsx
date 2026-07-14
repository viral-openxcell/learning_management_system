import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormField } from '@/components/forms/FormField'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { DatePicker } from '@/components/ui/DatePicker'
import { Button } from '@/components/ui/Button'
import { useCoursesQuery } from '@/hooks/useCourses'
import { useUsersQuery } from '@/hooks/useUsers'
import { BATCH_STATUSES, BATCH_STATUS_LABELS } from '@/constants/moduleEnums'
import { batchSchema, type BatchFormValues } from '../batch.schema'

interface BatchFormProps {
  defaultValues?: Partial<BatchFormValues>
  onSubmit: (values: BatchFormValues) => Promise<void>
  isSubmitting?: boolean
}

export function BatchForm({ defaultValues, onSubmit, isSubmitting }: BatchFormProps) {
  const { data: courses } = useCoursesQuery({ pageSize: 100 })
  const { data: instructors } = useUsersQuery({ pageSize: 100, filters: { role: 'instructor' } })
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BatchFormValues>({
    resolver: zodResolver(batchSchema),
    defaultValues: {
      name: '',
      course_id: '',
      instructor_id: '',
      start_date: '',
      end_date: '',
      capacity: 30,
      status: 'upcoming',
      schedule_note: '',
      ...defaultValues,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField label="Batch name" htmlFor="name" error={errors.name?.message} required>
        <Input id="name" {...register('name')} />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
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

        <FormField
          label="Instructor"
          htmlFor="instructor_id"
          error={errors.instructor_id?.message}
          required
        >
          <Select
            id="instructor_id"
            placeholder="Select an instructor"
            options={(instructors?.data ?? []).map((instructor) => ({
              label: instructor.full_name ?? instructor.email,
              value: instructor.id,
            }))}
            {...register('instructor_id')}
          />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <FormField
          label="Start date"
          htmlFor="start_date"
          error={errors.start_date?.message}
          required
        >
          <DatePicker id="start_date" {...register('start_date')} />
        </FormField>

        <FormField label="End date" htmlFor="end_date" error={errors.end_date?.message} required>
          <DatePicker id="end_date" {...register('end_date')} />
        </FormField>

        <FormField label="Capacity" htmlFor="capacity" error={errors.capacity?.message} required>
          <Input
            id="capacity"
            type="number"
            min="1"
            {...register('capacity', { valueAsNumber: true })}
          />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Status" htmlFor="status" error={errors.status?.message} required>
          <Select
            id="status"
            options={BATCH_STATUSES.map((status) => ({
              label: BATCH_STATUS_LABELS[status],
              value: status,
            }))}
            {...register('status')}
          />
        </FormField>

        <FormField
          label="Schedule note"
          htmlFor="schedule_note"
          error={errors.schedule_note?.message}
          hint="e.g. Mon/Wed/Fri, 3:00–5:00 PM UTC"
        >
          <Input id="schedule_note" {...register('schedule_note')} />
        </FormField>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" isLoading={isSubmitting}>
          Save batch
        </Button>
      </div>
    </form>
  )
}
