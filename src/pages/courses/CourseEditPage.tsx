import { useNavigate, useParams } from 'react-router-dom'
import { CourseForm } from './components/CourseForm'
import { useCourseQuery, useUpdateCourseMutation } from '@/hooks/useCourses'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { ErrorState } from '@/components/common/ErrorState'
import { ROUTE_PATHS } from '@/routes/routePaths'
import { toast } from '@/utils/toast'
import type { CourseFormValues } from './course.schema'

export function CourseEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: course, isLoading, error } = useCourseQuery(id)
  const updateCourse = useUpdateCourseMutation()

  async function handleSubmit(values: CourseFormValues, thumbnailUrl: string | null) {
    if (!id) return
    try {
      await updateCourse.mutateAsync({ id, payload: { ...values, thumbnail_url: thumbnailUrl } })
      toast.success('Course updated')
      navigate(ROUTE_PATHS.courses)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update course')
    }
  }

  if (isLoading) return <LoadingSkeleton rows={8} />
  if (error || !course) return <ErrorState title="Course not found" />

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Edit course</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Update the course details below.
        </p>
      </div>
      <CourseForm
        defaultValues={{
          title: course.title,
          slug: course.slug,
          description: course.description ?? '',
          category_id: course.category_id ?? '',
          level: course.level,
          status: course.status,
          tags: course.tags,
          price: course.price,
          duration_hours: course.duration_hours,
          language: course.language,
          requirements: course.requirements,
          learning_outcomes: course.learning_outcomes,
        }}
        thumbnailUrl={course.thumbnail_url}
        onSubmit={handleSubmit}
        isSubmitting={updateCourse.isPending}
        submitLabel="Save changes"
      />
    </div>
  )
}
