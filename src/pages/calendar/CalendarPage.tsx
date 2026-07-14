import { CalendarClock, ClipboardList, Video } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { createEntityHooks } from '@/hooks/createEntityHooks'
import { useCoursesQuery } from '@/hooks/useCourses'
import { useAuth } from '@/hooks/useAuth'
import { formatDate } from '@/utils/formatDate'

const { useListQuery: useLiveClassesQuery } = createEntityHooks('live_classes')
const { useListQuery: useAssignmentsQuery } = createEntityHooks('assignments')
const { useListQuery: useEnrollmentsQuery } = createEntityHooks('enrollments')

interface AgendaEvent {
  id: string
  date: string
  title: string
  courseTitle: string
  kind: 'live_class' | 'assignment'
}

export function CalendarPage() {
  const { role, user } = useAuth()
  const isStudent = role === 'student'

  const { data: courses } = useCoursesQuery({ pageSize: 100 })
  const { data: enrollments } = useEnrollmentsQuery({
    pageSize: 500,
    filters: { student_id: isStudent ? user?.id : undefined },
  })
  const { data: liveClasses, isLoading: loadingLive } = useLiveClassesQuery({ pageSize: 200 })
  const { data: assignments, isLoading: loadingAssignments } = useAssignmentsQuery({
    pageSize: 200,
  })

  const courseTitleById = new Map((courses?.data ?? []).map((c) => [c.id, c.title]))
  const enrolledCourseIds = new Set((enrollments?.data ?? []).map((e) => e.course_id))

  const events: AgendaEvent[] = [
    ...(liveClasses?.data ?? [])
      .filter((lc) => !isStudent || enrolledCourseIds.has(lc.course_id))
      .map((lc) => ({
        id: `lc-${lc.id}`,
        date: lc.scheduled_at,
        title: lc.title,
        courseTitle: courseTitleById.get(lc.course_id) ?? '—',
        kind: 'live_class' as const,
      })),
    ...(assignments?.data ?? [])
      .filter((a) => !isStudent || enrolledCourseIds.has(a.course_id))
      .map((a) => ({
        id: `a-${a.id}`,
        date: a.due_date,
        title: a.title,
        courseTitle: courseTitleById.get(a.course_id) ?? '—',
        kind: 'assignment' as const,
      })),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const isLoading = loadingLive || loadingAssignments

  const groups = new Map<string, AgendaEvent[]>()
  for (const event of events) {
    const key = formatDate(event.date)
    groups.set(key, [...(groups.get(key) ?? []), event])
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Live classes and assignment deadlines, in order.
        </p>
      </div>

      {isLoading && <LoadingSkeleton rows={5} />}

      {!isLoading && groups.size === 0 && (
        <EmptyState
          title="Nothing scheduled"
          description="Live classes and due dates will show up here."
        />
      )}

      {!isLoading && groups.size > 0 && (
        <div className="space-y-4">
          {Array.from(groups.entries()).map(([date, dayEvents]) => (
            <div key={date} className="panel p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                {date}
              </p>
              <div className="space-y-3">
                {dayEvents.map((event) => (
                  <div key={event.id} className="flex items-center gap-3">
                    <span
                      className={
                        event.kind === 'live_class'
                          ? 'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400'
                          : 'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400'
                      }
                    >
                      {event.kind === 'live_class' ? (
                        <Video className="h-4 w-4" />
                      ) : (
                        <ClipboardList className="h-4 w-4" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {event.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {event.courseTitle}
                      </p>
                    </div>
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <CalendarClock className="h-3 w-3" />
                      {event.kind === 'live_class' ? 'Live class' : 'Due date'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
