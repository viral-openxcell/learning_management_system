import { useNavigate } from 'react-router-dom'
import { CourseForm } from './components/CourseForm'
import { useCreateCourseMutation } from '@/hooks/useCourses'
import { useAuth } from '@/hooks/useAuth'
import { ROUTE_PATHS } from '@/routes/routePaths'
import { toast } from '@/utils/toast'
import type { CourseFormValues } from './course.schema'

export function CourseCreatePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const createCourse = useCreateCourseMutation()

  async function handleSubmit(values: CourseFormValues, thumbnailUrl: string | null) {
    if (!user) return
    try {
      await createCourse.mutateAsync({
        ...values,
        thumbnail_url: thumbnailUrl,
        instructor_id: user.id,
        rating: 0,
      })
      toast.success('Course created')
      navigate(ROUTE_PATHS.courses)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create course')
    }
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">New course</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Fill in the details below to create a course.
        </p>
      </div>
      <CourseForm
        onSubmit={handleSubmit}
        isSubmitting={createCourse.isPending}
        submitLabel="Create course"
      />
    </div>
  )
}
