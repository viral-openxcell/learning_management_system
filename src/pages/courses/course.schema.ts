import { z } from 'zod'
import { COURSE_LEVELS, COURSE_STATUSES } from '@/constants/courseLevels'

export const courseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  slug: z.string().min(3, 'Slug must be at least 3 characters'),
  description: z.string().max(2000, 'Description is too long'),
  category_id: z.string().min(1, 'Select a category'),
  level: z.enum(COURSE_LEVELS),
  status: z.enum(COURSE_STATUSES),
  tags: z.array(z.string()),
  price: z.number().min(0, 'Price cannot be negative'),
  duration_hours: z.number().min(0, 'Duration cannot be negative'),
  language: z.string().min(1, 'Language is required'),
  requirements: z.array(z.string()),
  learning_outcomes: z.array(z.string()),
})

export type CourseFormValues = z.infer<typeof courseSchema>
