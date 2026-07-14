import { useState } from 'react'
import { BookOpen, CheckCircle2, ClipboardCheck, UserPlus, Users, Video } from 'lucide-react'
import { HeroGradientCard } from '@/components/cards/HeroGradientCard'
import { TrendAreaChart } from '@/components/charts/TrendAreaChart'
import { DistributionChart } from '@/components/charts/DistributionChart'
import { ActivityListPanel, type ActivityListItem } from '@/components/cards/ActivityListPanel'
import { MiniCalendar } from '@/components/dashboard/MiniCalendar'
import { AttendanceHeatmap } from '@/components/dashboard/AttendanceHeatmap'
import { CourseThumbnailCard } from '@/components/dashboard/CourseThumbnailCard'
import { useCoursesQuery } from '@/hooks/useCourses'
import { useAuth } from '@/hooks/useAuth'
import { createEntityHooks } from '@/hooks/createEntityHooks'
import { bucketByMonth } from '@/utils/bucketByMonth'
import { computeWeekdayAttendance } from '@/utils/attendance'
import { ROUTE_PATHS } from '@/routes/routePaths'
import { SUBMISSION_STATUS_LABELS } from '@/constants/moduleEnums'
import { formatDate } from '@/utils/formatDate'

const { useListQuery: useEnrollmentsQuery } = createEntityHooks('enrollments')
const { useListQuery: useAssignmentsQuery } = createEntityHooks('assignments')
const { useListQuery: useSubmissionsQuery } = createEntityHooks('submissions')
const { useListQuery: useProfilesQuery } = createEntityHooks('profiles')
const { useListQuery: useLiveClassesQuery } = createEntityHooks('live_classes')
const { useListQuery: useBatchesQuery } = createEntityHooks('batches')
const { useListQuery: useAttendanceQuery } = createEntityHooks('attendance_records')

function deadlineGroupLabel(dateStr: string, now: number) {
  const diffDays = Math.round((new Date(dateStr).getTime() - now) / 86_400_000)
  if (diffDays <= 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  return formatDate(dateStr)
}

export function InstructorDashboardPage() {
  const [now] = useState(() => Date.now())
  const { user } = useAuth()
  const { data: courses } = useCoursesQuery({ pageSize: 100, filters: { instructor_id: user?.id } })
  const { data: enrollments } = useEnrollmentsQuery({ pageSize: 1000 })
  const { data: assignments } = useAssignmentsQuery({ pageSize: 1000 })
  const { data: submissions } = useSubmissionsQuery({ pageSize: 1000 })
  const { data: profiles } = useProfilesQuery({ pageSize: 500 })
  const { data: liveClasses } = useLiveClassesQuery({ pageSize: 500 })
  const { data: batches } = useBatchesQuery({ pageSize: 500, filters: { instructor_id: user?.id } })
  const { data: attendance } = useAttendanceQuery({ pageSize: 1000 })

  const courseList = courses?.data ?? []
  const courseIds = new Set(courseList.map((c) => c.id))
  const courseById = new Map(courseList.map((c) => [c.id, c]))
  const profileById = new Map((profiles?.data ?? []).map((p) => [p.id, p]))
  const assignmentById = new Map((assignments?.data ?? []).map((a) => [a.id, a]))
  const batchIds = new Set((batches?.data ?? []).map((b) => b.id))

  const enrollmentList = enrollments?.data ?? []
  const myEnrollments = enrollmentList.filter((e) => courseIds.has(e.course_id))
  const myAssignments = (assignments?.data ?? []).filter((a) => courseIds.has(a.course_id))
  const myAssignmentIds = new Set(myAssignments.map((a) => a.id))
  const mySubmissions = (submissions?.data ?? []).filter((s) =>
    myAssignmentIds.has(s.assignment_id),
  )
  const myLiveClasses = (liveClasses?.data ?? []).filter((c) => courseIds.has(c.course_id))
  const myAttendance = (attendance?.data ?? []).filter((a) => batchIds.has(a.batch_id))

  const activeStudents = new Set(
    myEnrollments.filter((e) => e.status === 'active').map((e) => e.student_id),
  ).size
  const completionRate = myEnrollments.length
    ? Math.round(
        (myEnrollments.filter((e) => e.status === 'completed').length / myEnrollments.length) * 100,
      )
    : null

  const submissionsByMonth = bucketByMonth(mySubmissions, (s) => s.submitted_at ?? s.created_at)
  const enrollmentsByMonth = bucketByMonth(myEnrollments, (e) => e.enrolled_at)
  const weekdayAttendance = computeWeekdayAttendance(myAttendance)

  const submissionStatusBreakdown = (['pending', 'submitted', 'graded', 'late'] as const).map(
    (status) => ({
      label: SUBMISSION_STATUS_LABELS[status],
      value: mySubmissions.filter((s) => s.status === status).length,
    }),
  )

  const enrollmentsByCourse = new Map<string, number>()
  for (const e of myEnrollments)
    enrollmentsByCourse.set(e.course_id, (enrollmentsByCourse.get(e.course_id) ?? 0) + 1)
  const topCoursesChart = [...enrollmentsByCourse.entries()]
    .map(([courseId, count]) => ({ course: courseById.get(courseId), count }))
    .filter((row): row is { course: NonNullable<typeof row.course>; count: number } =>
      Boolean(row.course),
    )
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map((row) => ({ label: row.course.title, value: row.count }))

  const upcomingLive = myLiveClasses
    .filter((c) => c.status === 'upcoming' && new Date(c.scheduled_at).getTime() >= now)
    .map((c) => ({
      date: c.scheduled_at,
      title: c.title,
      subtitle: courseById.get(c.course_id)?.title ?? '—',
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  const markedDates = new Set(upcomingLive.map((c) => c.date.slice(0, 10)))

  const scheduleItems: ActivityListItem[] = upcomingLive.slice(0, 4).map((item) => ({
    icon: Video,
    toneClassName: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    title: item.title,
    subtitle: item.subtitle,
    rightLabel: 'Live class',
    rightTone: 'neutral',
    groupLabel: deadlineGroupLabel(item.date, now),
  }))

  const recentSubmissions = [...mySubmissions].map((s) => {
    const rightTone: 'positive' | 'negative' | 'neutral' =
      s.status === 'graded' ? 'positive' : s.status === 'late' ? 'negative' : 'neutral'
    return {
      date: s.submitted_at ?? s.created_at,
      item: {
        icon: ClipboardCheck,
        toneClassName: 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400',
        title: `${profileById.get(s.student_id)?.full_name ?? 'Unknown student'} submitted`,
        subtitle: assignmentById.get(s.assignment_id)?.title ?? '—',
        rightLabel: SUBMISSION_STATUS_LABELS[s.status],
        rightTone,
      },
    }
  })
  const recentEnrollments = myEnrollments.map((e) => ({
    date: e.enrolled_at,
    item: {
      icon: UserPlus,
      toneClassName: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
      title: `${profileById.get(e.student_id)?.full_name ?? 'Someone'} enrolled`,
      subtitle: courseById.get(e.course_id)?.title ?? '—',
      rightLabel: formatDate(e.enrolled_at),
      rightTone: 'neutral' as const,
    },
  }))

  const recentActivities: ActivityListItem[] = [...recentSubmissions, ...recentEnrollments]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6)
    .map((e) => e.item)

  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <div className="space-y-6 xl:col-span-2">
        <div className="grid gap-4 sm:grid-cols-3">
          <HeroGradientCard
            variant="rose"
            label="My Courses"
            value={courses?.count ?? 0}
            icon={BookOpen}
            viewAllHref={ROUTE_PATHS.courses}
            description="Currently teaching"
          />
          <HeroGradientCard
            variant="sky"
            label="Active Students"
            value={activeStudents}
            icon={Users}
            viewAllHref={ROUTE_PATHS.enrollments}
            description="Currently enrolled"
          />
          <HeroGradientCard
            variant="gold"
            label="Completion Rate"
            value={completionRate === null ? '—' : `${completionRate}%`}
            icon={CheckCircle2}
            description="Across your enrolled students"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <TrendAreaChart
            title="Submissions"
            subtitle="Across your courses, by month"
            datasets={{
              'By month': submissionsByMonth.length
                ? submissionsByMonth
                : [{ label: '—', value: 0 }],
            }}
            tone="brand"
          />
          <DistributionChart
            title="Enrollment Trends"
            subtitle="New enrollments by month"
            data={enrollmentsByMonth}
            variant="bar"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <AttendanceHeatmap data={weekdayAttendance} />
          <div>
            <p className="mb-4 text-sm font-medium text-slate-700 dark:text-slate-300">
              My Courses
            </p>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {courseList.slice(0, 3).map((course) => (
                <CourseThumbnailCard
                  key={course.id}
                  course={course}
                  enrolledStudents={enrollmentList
                    .filter((e) => e.course_id === course.id)
                    .map((e) => profileById.get(e.student_id))
                    .filter((p): p is NonNullable<typeof p> => Boolean(p))}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <DistributionChart
            title="Submissions by Status"
            data={submissionStatusBreakdown}
            variant="horizontal-bar"
          />
          <DistributionChart
            title="Top Courses"
            subtitle="By enrollment"
            data={topCoursesChart}
            variant="pie"
          />
        </div>
      </div>

      <div className="space-y-6">
        <MiniCalendar markedDates={markedDates} />
        <ActivityListPanel
          title="Schedule"
          items={scheduleItems}
          viewAllHref={ROUTE_PATHS.liveClasses}
          emptyLabel="No upcoming live classes."
        />
        <ActivityListPanel
          title="Recent Activities"
          items={recentActivities}
          emptyLabel="No recent activity."
        />
      </div>
    </div>
  )
}
