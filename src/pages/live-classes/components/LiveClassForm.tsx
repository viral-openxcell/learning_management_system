import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormField } from '@/components/forms/FormField'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { useCoursesQuery } from '@/hooks/useCourses'
import { LIVE_CLASS_STATUS_LABELS, LIVE_CLASS_STATUSES } from '@/constants/moduleEnums'
import { liveClassSchema, type LiveClassFormValues } from '../liveClass.schema'

interface LiveClassFormProps {
  defaultValues?: Partial<LiveClassFormValues>
  onSubmit: (values: LiveClassFormValues) => Promise<void>
  isSubmitting?: boolean
}

export function LiveClassForm({ defaultValues, onSubmit, isSubmitting }: LiveClassFormProps) {
  const { data: courses } = useCoursesQuery({ pageSize: 100 })
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LiveClassFormValues>({
    resolver: zodResolver(liveClassSchema),
    defaultValues: {
      course_id: '',
      title: '',
      scheduled_at: '',
      duration_minutes: 60,
      meeting_url: '',
      status: 'upcoming',
      description: '',
      recording_url: '',
      ...defaultValues,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

      <FormField label="Title" htmlFor="title" error={errors.title?.message} required>
        <Input id="title" {...register('title')} />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label="Date & time"
          htmlFor="scheduled_at"
          error={errors.scheduled_at?.message}
          required
        >
          <Input id="scheduled_at" type="datetime-local" {...register('scheduled_at')} />
        </FormField>

        <FormField
          label="Duration (min)"
          htmlFor="duration_minutes"
          error={errors.duration_minutes?.message}
          required
        >
          <Input
            id="duration_minutes"
            type="number"
            min="1"
            {...register('duration_minutes', { valueAsNumber: true })}
          />
        </FormField>
      </div>

      <FormField label="Description" htmlFor="description" error={errors.description?.message}>
        <Textarea id="description" rows={3} {...register('description')} />
      </FormField>

      <FormField
        label="Meeting URL"
        htmlFor="meeting_url"
        error={errors.meeting_url?.message}
        hint="Optional — where students join"
      >
        <Input
          id="meeting_url"
          type="url"
          placeholder="https://meet.example.com/..."
          {...register('meeting_url')}
        />
      </FormField>

      <FormField
        label="Recording URL"
        htmlFor="recording_url"
        error={errors.recording_url?.message}
        hint="Optional — added after the session ends"
      >
        <Input
          id="recording_url"
          type="url"
          placeholder="https://cdn.example.com/recordings/..."
          {...register('recording_url')}
        />
      </FormField>

      <FormField label="Status" htmlFor="status" error={errors.status?.message} required>
        <Select
          id="status"
          options={LIVE_CLASS_STATUSES.map((status) => ({
            label: LIVE_CLASS_STATUS_LABELS[status],
            value: status,
          }))}
          {...register('status')}
        />
      </FormField>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" isLoading={isSubmitting}>
          Save session
        </Button>
      </div>
    </form>
  )
}
