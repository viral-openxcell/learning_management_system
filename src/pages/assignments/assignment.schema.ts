import { z } from 'zod'

export const assignmentSchema = z.object({
  course_id: z.string().min(1, 'Select a course'),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  due_date: z.string().min(1, 'Due date is required'),
  max_score: z.number().min(1, 'Max score must be at least 1'),
  description: z.string().optional(),
  max_attempts: z.number().min(1, 'Must allow at least 1 attempt'),
})

export type AssignmentFormValues = z.infer<typeof assignmentSchema>
