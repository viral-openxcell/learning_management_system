import { useState } from 'react'
import {
  Award,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  GraduationCap,
  UserPlus,
  Users,
  Video,
} from 'lucide-react'
import { HeroGradientCard } from '@/components/cards/HeroGradientCard'
import { TrendAreaChart } from '@/components/charts/TrendAreaChart'
import { DistributionChart } from '@/components/charts/DistributionChart'
import { ActivityListPanel, type ActivityListItem } from '@/components/cards/ActivityListPanel'
import { MiniCalendar } from '@/components/dashboard/MiniCalendar'
import { AttendanceHeatmap } from '@/components/dashboard/AttendanceHeatmap'
import { CourseThumbnailCard } from '@/components/dashboard/CourseThumbnailCard'
import { useDashboardStats } from '@/hooks/useDashboardStats'
import { createEntityHooks } from '@/hooks/createEntityHooks'
import { useCoursesQuery } from '@/hooks/useCourses'
import { ROUTE_PATHS } from '@/routes/routePaths'
import { formatDate } from '@/utils/formatDate'

const { useListQuery: useEnrollmentsQuery } = createEntityHooks('enrollments')
const { useListQuery: useProfilesQuery } = createEntityHooks('profiles')
const { useListQuery: useAssignmentsQuery } = createEntityHooks('assignments')
const { useListQuery: useLiveClassesQuery } = createEntityHooks('live_classes')
const { useListQuery: useCertificatesQuery } = createEntityHooks('certificates')
const { useListQuery: useSubmissionsQuery } = createEntityHooks('submissions')

function deadlineGroupLabel(dueDate: string, now: number) {
  const diffDays = Math.round((new Date(dueDate).getTime() - now) / 86_400_000)
  if (diffDays <= 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  return formatDate(dueDate)
}

export function AdminDashboardPage() {
  const [now] = useState(() => Date.now())
  const { data } = useDashboardStats()
  const { data: enrollments } = useEnrollmentsQuery({
    pageSize: 500,
    orderBy: { column: 'enrolled_at', ascending: false },
  })
  const { data: profiles } = useProfilesQuery({ pageSize: 500 })
  const { data: courses } = useCoursesQuery({ pageSize: 500 })
  const { data: assignments } = useAssignmentsQuery({ pageSize: 500 })
  const { data: liveClasses } = useLiveClassesQuery({ pageSize: 500 })
  const { data: certificates } = useCertificatesQuery({
    pageSize: 500,
    orderBy: { column: 'issued_at', ascending: false },
  })
  const { data: submissions } = useSubmissionsQuery({ pageSize: 500 })

  const profileById = new Map((profiles?.data ?? []).map((p) => [p.id, p]))
  const courseById = new Map((courses?.data ?? []).map((c) => [c.id, c]))
  const enrollmentList = enrollments?.data ?? []
  const courseList = courses?.data ?? []

  const upcomingAssignments = (assignments?.data ?? [])
    .filter((a) => new Date(a.due_date).getTime() >= now)
    .map((a) => ({
      kind: 'assignment' as const,
      date: a.due_date,
      title: a.title,
      subtitle: courseById.get(a.course_id)?.title ?? '—',
    }))
  const upcomingLive = (liveClasses?.data ?? [])
    .filter((c) => c.status === 'upcoming' && new Date(c.scheduled_at).getTime() >= now)
    .map((c) => ({
      kind: 'live' as const,
      date: c.scheduled_at,
      title: c.title,
      subtitle: courseById.get(c.course_id)?.title ?? '—',
    }))

  const upcomingEvents = [...upcomingAssignments, ...upcomingLive].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  )
  const markedDates = new Set(upcomingEvents.map((e) => e.date.slice(0, 10)))

  const scheduleItems: ActivityListItem[] = upcomingEvents.slice(0, 4).map((item) => ({
    icon: item.kind === 'live' ? Video : ClipboardCheck,
    toneClassName:
      item.kind === 'live'
        ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
        : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
    title: item.title,
    subtitle: item.subtitle,
    rightLabel: item.kind === 'live' ? 'Live class' : 'Due',
    rightTone: 'neutral',
    groupLabel: deadlineGroupLabel(item.date, now),
  }))

  const recentEnrollments = enrollmentList.slice(0, 8).map((e) => ({
    date: e.enrolled_at,
    item: {
      icon: UserPlus,
      toneClassName: 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400',
      title: `${profileById.get(e.student_id)?.full_name ?? 'Someone'} enrolled`,
      subtitle: courseById.get(e.course_id)?.title ?? '—',
      rightLabel: formatDate(e.enrolled_at),
      rightTone: 'neutral' as const,
    },
  }))
  const recentGraded = (submissions?.data ?? [])
    .filter((s) => s.status === 'graded')
    .slice(0, 8)
    .map((s) => ({
      date: s.submitted_at ?? s.created_at,
      item: {
        icon: CheckCircle2,
        toneClassName:
          'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
        title: 'Submission graded',
        subtitle: profileById.get(s.student_id)?.full_name ?? '—',
        rightLabel: `${s.score}%`,
        rightTone: 'positive' as const,
      },
    }))
  const recentCerts = (certificates?.data ?? []).slice(0, 8).map((c) => ({
    date: c.issued_at,
    item: {
      icon: Award,
      toneClassName: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
      title: 'Certificate issued',
      subtitle: profileById.get(c.student_id)?.full_name ?? '—',
      rightLabel: formatDate(c.issued_at),
      rightTone: 'neutral' as const,
    },
  }))

  const recentActivities: ActivityListItem[] = [
    ...recentEnrollments,
    ...recentGraded,
    ...recentCerts,
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6)
    .map((e) => e.item)

  const enrollmentsByCourse = new Map<string, number>()
  for (const e of enrollmentList)
    enrollmentsByCourse.set(e.course_id, (enrollmentsByCourse.get(e.course_id) ?? 0) + 1)
  const topCoursesChart = [...enrollmentsByCourse.entries()]
    .map(([courseId, count]) => ({ course: courseById.get(courseId), count }))
    .filter((row): row is { course: NonNullable<typeof row.course>; count: number } =>
      Boolean(row.course),
    )
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map((row) => ({ label: row.course.title, value: row.count }))

  const newCourses = [...courseList]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3)

  const revenueChart = {
    'By month': data?.revenueByMonth?.length ? data.revenueByMonth : [{ label: '—', value: 0 }],
  }

  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <div className="space-y-6 xl:col-span-2">
        <div className="grid gap-4 sm:grid-cols-3">
          <HeroGradientCard
            variant="rose"
            label="Total Students"
            value={data?.studentCount ?? 0}
            icon={Users}
            viewAllHref={ROUTE_PATHS.users}
            description="Across all batches"
          />
          <HeroGradientCard
            variant="sky"
            label="Total Courses"
            value={data?.courses ?? 0}
            icon={BookOpen}
            viewAllHref={ROUTE_PATHS.courses}
            description={data ? `${data.publishedCourses} published` : undefined}
          />
          <HeroGradientCard
            variant="gold"
            label="Total Enrollments"
            value={data?.enrollments ?? 0}
            icon={GraduationCap}
            viewAllHref={ROUTE_PATHS.enrollments}
            description={
              data?.enrollmentTrend !== undefined
                ? `${data.enrollmentTrend >= 0 ? '+' : ''}${data.enrollmentTrend}% vs last month`
                : undefined
            }
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <TrendAreaChart
            title="Revenue"
            subtitle="From enrollments, by month"
            datasets={revenueChart}
            tone="brand"
          />
          <DistributionChart
            title="Enrollment Trends"
            subtitle="New enrollments by month"
            data={data?.enrollmentsByMonth ?? []}
            variant="bar"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <AttendanceHeatmap data={data?.attendanceByWeekday ?? []} />
          <div>
            <p className="mb-4 text-sm font-medium text-slate-700 dark:text-slate-300">
              New Courses
            </p>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {newCourses.map((course) => (
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
            title="Students by Role"
            data={data?.roleBreakdown ?? []}
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
          viewAllHref={ROUTE_PATHS.calendar}
          emptyLabel="Nothing scheduled."
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
