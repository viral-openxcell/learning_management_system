import type { CourseLevel, CourseStatus } from '@/constants/courseLevels'

export interface CourseCategory {
  id: string
  name: string
  slug: string
  created_at: string
}

export interface Course {
  id: string
  title: string
  slug: string
  description: string | null
  category_id: string | null
  category?: CourseCategory | null
  instructor_id: string
  level: CourseLevel
  status: CourseStatus
  tags: string[]
  thumbnail_url: string | null
  price: number
  created_at: string
  updated_at: string
}

export interface CourseFormValues {
  title: string
  slug: string
  description: string
  category_id: string
  level: CourseLevel
  status: CourseStatus
  tags: string[]
  thumbnail_url: string | null
  price: number
}
