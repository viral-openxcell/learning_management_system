import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormField } from '@/components/forms/FormField'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Checkbox } from '@/components/ui/Checkbox'
import { Button } from '@/components/ui/Button'
import { useCoursesQuery } from '@/hooks/useCourses'
import { LESSON_TYPE_LABELS, LESSON_TYPES } from '@/constants/moduleEnums'
import { lessonSchema, type LessonFormValues } from '../lesson.schema'

interface LessonFormProps {
  defaultValues?: Partial<LessonFormValues>
  onSubmit: (values: LessonFormValues) => Promise<void>
  isSubmitting?: boolean
}

export function LessonForm({ defaultValues, onSubmit, isSubmitting }: LessonFormProps) {
  const { data: courses } = useCoursesQuery({ pageSize: 100 })
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LessonFormValues>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      course_id: '',
      title: '',
      type: 'video',
      duration_minutes: 10,
      order_index: 1,
      description: '',
      is_free_preview: false,
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

      <div className="grid gap-4 sm:grid-cols-3">
        <FormField label="Type" htmlFor="type" error={errors.type?.message} required>
          <Select
            id="type"
            options={LESSON_TYPES.map((type) => ({ label: LESSON_TYPE_LABELS[type], value: type }))}
            {...register('type')}
          />
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

        <FormField label="Order" htmlFor="order_index" error={errors.order_index?.message} required>
          <Input
            id="order_index"
            type="number"
            min="1"
            {...register('order_index', { valueAsNumber: true })}
          />
        </FormField>
      </div>

      <FormField label="Description" htmlFor="description" error={errors.description?.message}>
        <Textarea id="description" rows={3} {...register('description')} />
      </FormField>

      <Checkbox
        id="is_free_preview"
        label="Free preview (visible without enrolling)"
        {...register('is_free_preview')}
      />

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" isLoading={isSubmitting}>
          Save lesson
        </Button>
      </div>
    </form>
  )
}
