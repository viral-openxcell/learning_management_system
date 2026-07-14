import { z } from 'zod'
import { BATCH_STATUSES } from '@/constants/moduleEnums'

export const batchSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  course_id: z.string().min(1, 'Select a course'),
  instructor_id: z.string().min(1, 'Select an instructor'),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
  status: z.enum(BATCH_STATUSES),
  schedule_note: z.string().optional(),
})

export type BatchFormValues = z.infer<typeof batchSchema>
