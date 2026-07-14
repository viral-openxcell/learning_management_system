import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { BookOpen, Clock, DollarSign, Globe, Star } from 'lucide-react'
import { DetailPageHeader } from '@/components/cards/DetailPageHeader'
import { Tabs } from '@/components/ui/Tabs'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { ImageWithFallback } from '@/components/ui/ImageWithFallback'
import { ConfirmDialog } from '@/components/modals/ConfirmDialog'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { ErrorState } from '@/components/common/ErrorState'
import { EmptyState } from '@/components/common/EmptyState'
import { useCourseQuery, useDeleteCourseMutation } from '@/hooks/useCourses'
import { useCategoriesQuery } from '@/hooks/useCategories'
import { useUsersQuery } from '@/hooks/useUsers'
import { createEntityHooks } from '@/hooks/createEntityHooks'
import { COURSE_LEVEL_LABELS, COURSE_STATUS_LABELS } from '@/constants/courseLevels'
import {
  LESSON_TYPE_LABELS,
  ENROLLMENT_STATUS_LABELS,
  LIVE_CLASS_STATUS_LABELS,
} from '@/constants/moduleEnums'
import { formatDate, formatDateTime } from '@/utils/formatDate'
import { coursePlaceholderImage } from '@/utils/placeholderImage'
import { useDisclosure } from '@/hooks/useDisclosure'
import { ROUTE_PATHS } from '@/routes/routePaths'
import { toast } from '@/utils/toast'

const { useListQuery: useLessonsQuery } = createEntityHooks('lessons')
const { useListQuery: useEnrollmentsQuery } = createEntityHooks('enrollments')
const { useListQuery: useAssignmentsQuery } = createEntityHooks('assignments')
const { useListQuery: useQuizzesQuery } = createEntityHooks('quizzes')
const { useListQuery: useLiveClassesQuery } = createEntityHooks('live_classes')

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'curriculum', label: 'Curriculum' },
  { key: 'students', label: 'Students' },
  { key: 'work', label: 'Assignments & Quizzes' },
  { key: 'live', label: 'Live Classes' },
]

export function CourseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [tab, setTab] = useState('overview')
  const deleteDialog = useDisclosure()

  const { data: course, isLoading, error } = useCourseQuery(id)
  const { data: categories } = useCategoriesQuery()
  const { data: profiles } = useUsersQuery({ pageSize: 500 })
  const { data: lessons } = useLessonsQuery({
    pageSize: 200,
    filters: { course_id: id },
    orderBy: { column: 'order_index', ascending: true },
  })
  const { data: enrollments } = useEnrollmentsQuery({ pageSize: 500, filters: { course_id: id } })
  const { data: assignments } = useAssignmentsQuery({ pageSize: 200, filters: { course_id: id } })
  const { data: quizzes } = useQuizzesQuery({ pageSize: 200, filters: { course_id: id } })
  const { data: liveClasses } = useLiveClassesQuery({ pageSize: 200, filters: { course_id: id } })
  const deleteCourse = useDeleteCourseMutation()

  if (isLoading) return <LoadingSkeleton rows={8} />
  if (error || !course) return <ErrorState title="Course not found" />

  const profileById = new Map((profiles?.data ?? []).map((p) => [p.id, p]))
  const instructor = profileById.get(course.instructor_id)
  const category = categories?.data.find((c) => c.id === course.category_id)

  async function handleDelete() {
    if (!id) return
    try {
      await deleteCourse.mutateAsync(id)
      toast.success('Course deleted')
      navigate(ROUTE_PATHS.courses)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete course')
    }
  }

  return (
    <div className="space-y-4">
      <DetailPageHeader
        backHref={ROUTE_PATHS.courses}
        backLabel="Back to courses"
        media={
          <div className="flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-sky">
            <ImageWithFallback
              src={course.thumbnail_url ?? coursePlaceholderImage(course.id)}
              alt={course.title}
              className="h-full w-full object-cover"
              fallback={<BookOpen className="h-6 w-6 text-blue-500/60" />}
            />
          </div>
        }
        title={course.title}
        subtitle={course.description ?? undefined}
        badges={[
          { label: COURSE_LEVEL_LABELS[course.level], variant: 'info' },
          {
            label: COURSE_STATUS_LABELS[course.status],
            variant:
              course.status === 'published'
                ? 'success'
                : course.status === 'draft'
                  ? 'default'
                  : 'warning',
          },
        ]}
        stats={[
          { label: 'students', value: enrollments?.count ?? 0 },
          { label: 'duration', value: `${course.duration_hours}h` },
          { label: 'rating', value: course.rating.toFixed(1) },
        ]}
        editHref={ROUTE_PATHS.courseEdit(course.id)}
        onDelete={deleteDialog.open}
      />

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'overview' && (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="panel space-y-4 p-5 lg:col-span-2">
            <div>
              <p className="mb-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                Description
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {course.description || 'No description provided.'}
              </p>
            </div>
            {course.requirements.length > 0 && (
              <div>
                <p className="mb-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Requirements
                </p>
                <ul className="list-inside list-disc text-sm text-slate-600 dark:text-slate-300">
                  {course.requirements.map((req) => (
                    <li key={req}>{req}</li>
                  ))}
                </ul>
              </div>
            )}
            {course.learning_outcomes.length > 0 && (
              <div>
                <p className="mb-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  What students will learn
                </p>
                <ul className="list-inside list-disc text-sm text-slate-600 dark:text-slate-300">
                  {course.learning_outcomes.map((outcome) => (
                    <li key={outcome}>{outcome}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {course.tags.map((tag) => (
                <Badge key={tag} variant="default">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <div className="panel space-y-3 p-5 text-sm">
            <div className="flex items-center gap-3">
              <Avatar src={instructor?.avatar_url} name={instructor?.full_name} size="sm" />
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-100">
                  {instructor?.full_name ?? '—'}
                </p>
                <p className="text-xs text-slate-400">Instructor</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <DollarSign className="h-4 w-4 text-slate-400" /> ${course.price.toFixed(2)}
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Clock className="h-4 w-4 text-slate-400" /> {course.duration_hours} hours
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Globe className="h-4 w-4 text-slate-400" /> {course.language}
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Star className="h-4 w-4 text-slate-400" /> {course.rating.toFixed(1)} rating
            </div>
            <div className="pt-1 text-xs text-slate-400">Category: {category?.name ?? '—'}</div>
          </div>
        </div>
      )}

      {tab === 'curriculum' && (
        <div className="panel divide-y divide-slate-100 dark:divide-slate-800">
          {(lessons?.data.length ?? 0) === 0 && (
            <EmptyState
              title="No lessons yet"
              description="This course has no curriculum content yet."
            />
          )}
          {lessons?.data.map((lesson) => (
            <div key={lesson.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {lesson.order_index}. {lesson.title}
                </p>
                <p className="text-xs text-slate-400">
                  {LESSON_TYPE_LABELS[lesson.type]} · {lesson.duration_minutes} min
                </p>
              </div>
              {lesson.is_free_preview && <Badge variant="info">Free preview</Badge>}
            </div>
          ))}
        </div>
      )}

      {tab === 'students' && (
        <div className="panel divide-y divide-slate-100 dark:divide-slate-800">
          {(enrollments?.data.length ?? 0) === 0 && <EmptyState title="No students enrolled yet" />}
          {enrollments?.data.map((enrollment) => {
            const student = profileById.get(enrollment.student_id)
            return (
              <div
                key={enrollment.id}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <Avatar src={student?.avatar_url} name={student?.full_name} size="sm" />
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {student?.full_name ?? '—'}
                    </p>
                    <p className="text-xs text-slate-400">
                      Enrolled {formatDate(enrollment.enrolled_at)} · {enrollment.progress_percent}%
                      complete
                    </p>
                  </div>
                </div>
                <Badge
                  variant={
                    enrollment.status === 'completed'
                      ? 'success'
                      : enrollment.status === 'cancelled'
                        ? 'danger'
                        : 'info'
                  }
                >
                  {ENROLLMENT_STATUS_LABELS[enrollment.status]}
                </Badge>
              </div>
            )
          })}
        </div>
      )}

      {tab === 'work' && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="panel divide-y divide-slate-100 p-0 dark:divide-slate-800">
            <p className="px-4 py-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
              Assignments
            </p>
            {(assignments?.data.length ?? 0) === 0 && (
              <p className="px-4 pb-4 text-sm text-slate-400">No assignments yet.</p>
            )}
            {assignments?.data.map((a) => (
              <div key={a.id} className="px-4 py-3">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{a.title}</p>
                <p className="text-xs text-slate-400">
                  Due {formatDate(a.due_date)} · Max score {a.max_score}
                </p>
              </div>
            ))}
          </div>
          <div className="panel divide-y divide-slate-100 p-0 dark:divide-slate-800">
            <p className="px-4 py-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
              Quizzes
            </p>
            {(quizzes?.data.length ?? 0) === 0 && (
              <p className="px-4 pb-4 text-sm text-slate-400">No quizzes yet.</p>
            )}
            {quizzes?.data.map((q) => (
              <div key={q.id} className="px-4 py-3">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{q.title}</p>
                <p className="text-xs text-slate-400">
                  {q.questions_count} questions · {q.duration_minutes} min · Pass{' '}
                  {q.pass_percentage}%
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'live' && (
        <div className="panel divide-y divide-slate-100 dark:divide-slate-800">
          {(liveClasses?.data.length ?? 0) === 0 && (
            <EmptyState title="No live classes scheduled" />
          )}
          {liveClasses?.data.map((lc) => (
            <div key={lc.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{lc.title}</p>
                <p className="text-xs text-slate-400">
                  {formatDateTime(lc.scheduled_at)} · {lc.duration_minutes} min
                </p>
              </div>
              <Badge
                variant={
                  lc.status === 'upcoming' ? 'info' : lc.status === 'ended' ? 'default' : 'danger'
                }
              >
                {LIVE_CLASS_STATUS_LABELS[lc.status]}
              </Badge>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        onConfirm={handleDelete}
        title="Delete course"
        description={`Are you sure you want to delete "${course.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        isLoading={deleteCourse.isPending}
      />
    </div>
  )
}
