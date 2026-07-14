export const COURSE_LEVELS = ['beginner', 'intermediate', 'advanced'] as const
export type CourseLevel = (typeof COURSE_LEVELS)[number]

export const COURSE_LEVEL_LABELS: Record<CourseLevel, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
}

export const COURSE_STATUSES = ['draft', 'published', 'archived'] as const
export type CourseStatus = (typeof COURSE_STATUSES)[number]

export const COURSE_STATUS_LABELS: Record<CourseStatus, string> = {
  draft: 'Draft',
  published: 'Published',
  archived: 'Archived',
}
