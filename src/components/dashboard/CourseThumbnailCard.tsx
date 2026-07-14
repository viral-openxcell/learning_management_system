import { BookOpen } from 'lucide-react'
import { ImageWithFallback } from '@/components/ui/ImageWithFallback'
import { Avatar } from '@/components/ui/Avatar'
import { COURSE_LEVEL_LABELS } from '@/constants/courseLevels'
import { coursePlaceholderImage } from '@/utils/placeholderImage'
import type { Course } from '@/types/course.types'
import type { Profile } from '@/types/auth.types'

interface CourseThumbnailCardProps {
  course: Course
  enrolledStudents: Profile[]
}

export function CourseThumbnailCard({ course, enrolledStudents }: CourseThumbnailCardProps) {
  const visibleAvatars = enrolledStudents.slice(0, 3)
  const extraCount = enrolledStudents.length - visibleAvatars.length

  return (
    <div className="panel overflow-hidden p-3">
      <div className="flex h-24 items-center justify-center overflow-hidden rounded-xl bg-gradient-sky">
        <ImageWithFallback
          src={course.thumbnail_url ?? coursePlaceholderImage(course.id)}
          alt={course.title}
          className="h-full w-full object-cover"
          fallback={<BookOpen className="h-8 w-8 text-blue-500/60" />}
        />
      </div>
      <p className="mt-3 truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
        {course.title}
      </p>
      <p className="mt-0.5 text-xs text-slate-400">
        {COURSE_LEVEL_LABELS[course.level]} · ${course.price.toFixed(2)}
      </p>
      <div className="mt-3 flex items-center justify-between">
        <div className="flex -space-x-2">
          {visibleAvatars.map((student) => (
            <Avatar
              key={student.id}
              src={student.avatar_url}
              name={student.full_name}
              size="sm"
              className="ring-2 ring-white dark:ring-slate-900"
            />
          ))}
          {extraCount > 0 && (
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-[10px] font-semibold text-slate-500 ring-2 ring-white dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-900">
              +{extraCount}
            </span>
          )}
          {enrolledStudents.length === 0 && (
            <span className="text-xs text-slate-400">No students yet</span>
          )}
        </div>
      </div>
    </div>
  )
}
