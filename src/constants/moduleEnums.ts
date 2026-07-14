export const LESSON_TYPES = ['video', 'pdf', 'text', 'live'] as const
export type LessonType = (typeof LESSON_TYPES)[number]
export const LESSON_TYPE_LABELS: Record<LessonType, string> = {
  video: 'Video',
  pdf: 'PDF',
  text: 'Text',
  live: 'Live Session',
}

export const QUIZ_STATUSES = ['draft', 'published'] as const
export type QuizStatus = (typeof QUIZ_STATUSES)[number]
export const QUIZ_STATUS_LABELS: Record<QuizStatus, string> = {
  draft: 'Draft',
  published: 'Published',
}

export const SUBMISSION_STATUSES = ['pending', 'submitted', 'graded', 'late'] as const
export type SubmissionStatus = (typeof SUBMISSION_STATUSES)[number]
export const SUBMISSION_STATUS_LABELS: Record<SubmissionStatus, string> = {
  pending: 'Pending',
  submitted: 'Submitted',
  graded: 'Graded',
  late: 'Late',
}

export const LIVE_CLASS_STATUSES = ['upcoming', 'live', 'ended', 'cancelled'] as const
export type LiveClassStatus = (typeof LIVE_CLASS_STATUSES)[number]
export const LIVE_CLASS_STATUS_LABELS: Record<LiveClassStatus, string> = {
  upcoming: 'Upcoming',
  live: 'Live now',
  ended: 'Ended',
  cancelled: 'Cancelled',
}

export const ATTENDANCE_STATUSES = ['present', 'absent', 'late'] as const
export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number]
export const ATTENDANCE_STATUS_LABELS: Record<AttendanceStatus, string> = {
  present: 'Present',
  absent: 'Absent',
  late: 'Late',
}

export const ENROLLMENT_STATUSES = ['pending', 'active', 'completed', 'cancelled'] as const
export type EnrollmentStatus = (typeof ENROLLMENT_STATUSES)[number]
export const ENROLLMENT_STATUS_LABELS: Record<EnrollmentStatus, string> = {
  pending: 'Pending',
  active: 'Active',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export const BATCH_STATUSES = ['upcoming', 'active', 'completed'] as const
export type BatchStatus = (typeof BATCH_STATUSES)[number]
export const BATCH_STATUS_LABELS: Record<BatchStatus, string> = {
  upcoming: 'Upcoming',
  active: 'Active',
  completed: 'Completed',
}

export const NOTIFICATION_TYPES = [
  'info',
  'success',
  'assignment',
  'enrollment',
  'certificate',
] as const
export type NotificationType = (typeof NOTIFICATION_TYPES)[number]
export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  info: 'Info',
  success: 'Success',
  assignment: 'Assignment',
  enrollment: 'Enrollment',
  certificate: 'Certificate',
}
