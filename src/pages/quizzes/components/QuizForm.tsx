import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormField } from '@/components/forms/FormField'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { useCoursesQuery } from '@/hooks/useCourses'
import { QUIZ_STATUS_LABELS, QUIZ_STATUSES } from '@/constants/moduleEnums'
import { quizSchema, type QuizFormValues } from '../quiz.schema'

interface QuizFormProps {
  defaultValues?: Partial<QuizFormValues>
  onSubmit: (values: QuizFormValues) => Promise<void>
  isSubmitting?: boolean
}

export function QuizForm({ defaultValues, onSubmit, isSubmitting }: QuizFormProps) {
  const { data: courses } = useCoursesQuery({ pageSize: 100 })
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<QuizFormValues>({
    resolver: zodResolver(quizSchema),
    defaultValues: {
      course_id: '',
      title: '',
      questions_count: 10,
      duration_minutes: 15,
      status: 'draft',
      description: '',
      pass_percentage: 70,
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

      <FormField label="Description" htmlFor="description" error={errors.description?.message}>
        <Textarea id="description" rows={3} {...register('description')} />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label="Questions"
          htmlFor="questions_count"
          error={errors.questions_count?.message}
          required
        >
          <Input
            id="questions_count"
            type="number"
            min="1"
            {...register('questions_count', { valueAsNumber: true })}
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
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label="Pass percentage"
          htmlFor="pass_percentage"
          error={errors.pass_percentage?.message}
          required
        >
          <Input
            id="pass_percentage"
            type="number"
            min="1"
            max="100"
            {...register('pass_percentage', { valueAsNumber: true })}
          />
        </FormField>

        <FormField label="Status" htmlFor="status" error={errors.status?.message} required>
          <Select
            id="status"
            options={QUIZ_STATUSES.map((status) => ({
              label: QUIZ_STATUS_LABELS[status],
              value: status,
            }))}
            {...register('status')}
          />
        </FormField>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" isLoading={isSubmitting}>
          Save quiz
        </Button>
      </div>
    </form>
  )
}
