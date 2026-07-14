import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FormField } from '@/components/forms/FormField'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'

const gradeSchema = z.object({
  score: z.number().min(0, 'Score cannot be negative'),
  feedback: z.string().optional(),
})

export type GradeFormValues = z.infer<typeof gradeSchema>

interface GradeFormProps {
  maxScore: number
  defaultValues?: Partial<GradeFormValues>
  onSubmit: (values: GradeFormValues) => Promise<void>
  isSubmitting?: boolean
}

export function GradeForm({ maxScore, defaultValues, onSubmit, isSubmitting }: GradeFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GradeFormValues>({ resolver: zodResolver(gradeSchema), defaultValues })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField
        label={`Score (out of ${maxScore})`}
        htmlFor="score"
        error={errors.score?.message}
        required
      >
        <Input
          id="score"
          type="number"
          min="0"
          max={maxScore}
          {...register('score', { valueAsNumber: true })}
        />
      </FormField>
      <FormField label="Feedback" htmlFor="feedback" error={errors.feedback?.message}>
        <Textarea id="feedback" rows={3} {...register('feedback')} />
      </FormField>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" isLoading={isSubmitting}>
          Save grade
        </Button>
      </div>
    </form>
  )
}
