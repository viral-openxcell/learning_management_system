import { z } from 'zod'
import { LIVE_CLASS_STATUSES } from '@/constants/moduleEnums'

export const liveClassSchema = z.object({
  course_id: z.string().min(1, 'Select a course'),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  scheduled_at: z.string().min(1, 'Schedule date/time is required'),
  duration_minutes: z.number().min(1, 'Duration must be at least 1 minute'),
  meeting_url: z.string().url('Enter a valid URL').or(z.literal('')),
  status: z.enum(LIVE_CLASS_STATUSES),
  description: z.string().optional(),
  recording_url: z.string().url('Enter a valid URL').or(z.literal('')).optional(),
})

export type LiveClassFormValues = z.infer<typeof liveClassSchema>
