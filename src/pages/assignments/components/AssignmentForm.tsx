import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormField } from '@/components/forms/FormField'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { DatePicker } from '@/components/ui/DatePicker'
import { Button } from '@/components/ui/Button'
import { useCoursesQuery } from '@/hooks/useCourses'
import { assignmentSchema, type AssignmentFormValues } from '../assignment.schema'

interface AssignmentFormProps {
  defaultValues?: Partial<AssignmentFormValues>
  onSubmit: (values: AssignmentFormValues) => Promise<void>
  isSubmitting?: boolean
}

export function AssignmentForm({ defaultValues, onSubmit, isSubmitting }: AssignmentFormProps) {
  const { data: courses } = useCoursesQuery({ pageSize: 100 })
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      course_id: '',
      title: '',
      due_date: '',
      max_score: 100,
      description: '',
      max_attempts: 1,
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

      <div className="grid gap-4 sm:grid-cols-3">
        <FormField label="Due date" htmlFor="due_date" error={errors.due_date?.message} required>
          <DatePicker id="due_date" {...register('due_date')} />
        </FormField>

        <FormField label="Max score" htmlFor="max_score" error={errors.max_score?.message} required>
          <Input
            id="max_score"
            type="number"
            min="1"
            {...register('max_score', { valueAsNumber: true })}
          />
        </FormField>

        <FormField
          label="Max attempts"
          htmlFor="max_attempts"
          error={errors.max_attempts?.message}
          required
        >
          <Input
            id="max_attempts"
            type="number"
            min="1"
            {...register('max_attempts', { valueAsNumber: true })}
          />
        </FormField>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" isLoading={isSubmitting}>
          Save assignment
        </Button>
      </div>
    </form>
  )
}
