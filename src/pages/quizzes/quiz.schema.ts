import { z } from 'zod'
import { QUIZ_STATUSES } from '@/constants/moduleEnums'

export const quizSchema = z.object({
  course_id: z.string().min(1, 'Select a course'),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  questions_count: z.number().min(1, 'Must have at least 1 question'),
  duration_minutes: z.number().min(1, 'Duration must be at least 1 minute'),
  status: z.enum(QUIZ_STATUSES),
  description: z.string().optional(),
  pass_percentage: z.number().min(1, 'Must be at least 1%').max(100, 'Cannot exceed 100%'),
})

export type QuizFormValues = z.infer<typeof quizSchema>
