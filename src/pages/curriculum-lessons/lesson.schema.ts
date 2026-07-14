import { z } from 'zod'
import { LESSON_TYPES } from '@/constants/moduleEnums'

export const lessonSchema = z.object({
  course_id: z.string().min(1, 'Select a course'),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  type: z.enum(LESSON_TYPES),
  duration_minutes: z.number().min(1, 'Duration must be at least 1 minute'),
  order_index: z.number().min(1, 'Order must be at least 1'),
  description: z.string().optional(),
  is_free_preview: z.boolean(),
})

export type LessonFormValues = z.infer<typeof lessonSchema>
