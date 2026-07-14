import { useState } from 'react'
import { Award, BookOpen, CalendarClock, GraduationCap } from 'lucide-react'
import { HeroGradientCard } from '@/components/cards/HeroGradientCard'
import { TrendAreaChart } from '@/components/charts/TrendAreaChart'
import { DistributionChart } from '@/components/charts/DistributionChart'
import { ActivityListPanel, type ActivityListItem } from '@/components/cards/ActivityListPanel'
import { MiniCalendar } from '@/components/dashboard/MiniCalendar'
import { AttendanceHeatmap } from '@/components/dashboard/AttendanceHeatmap'
import { CourseThumbnailCard } from '@/components/dashboard/CourseThumbnailCard'
import { useAuth } from '@/hooks/useAuth'
import { useCoursesQuery } from '@/hooks/useCourses'
import { createEntityHooks } from '@/hooks/createEntityHooks'
import { bucketByMonth } from '@/utils/bucketByMonth'
import { computeWeekdayAttendance } from '@/utils/attendance'
import { ROUTE_PATHS } from '@/routes/routePaths'
import { ENROLLMENT_STATUS_LABELS, SUBMISSION_STATUS_LABELS } from '@/constants/moduleEnums'
import { COURSE_LEVEL_LABELS } from '@/constants/courseLevels'
import { formatDate } from '@/utils/formatDate'

const { useListQuery: useEnrollmentsQuery } = createEntityHooks('enrollments')
const { useListQuery: useCertificatesQuery } = createEntityHooks('certificates')
const { useListQuery: useAssignmentsQuery } = createEntityHooks('assignments')
const { useListQuery: useSubmissionsQuery } = createEntityHooks('submissions')
const { useListQuery: useAttendanceQuery } = createEntityHooks('attendance_records')
const { useListQuery: useProfilesQuery } = createEntityHooks('profiles')

const GRADE_BUCKETS = [
  { label: '0–59', min: 0, max: 59 },
  { label: '60–69', min: 60, max: 69 },
  { label: '70–79', min: 70, max: 79 },
  { label: '80–89', min: 80, max: 89 },
  { label: '90–100', min: 90, max: 100 },
]

function deadlineGroupLabel(dueDate: string, now: number) {
  const diffDays = Math.round((new Date(dueDate).getTime() - now) / 86_400_000)
  if (diffDays <= 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  return formatDate(dueDate)
}

export function StudentDashboardPage() {
  const [now] = useState(() => Date.now())
  const { user, profile } = useAuth()
  const { data: allEnrollments } = useEnrollmentsQuery({ pageSize: 1000 })
  const { data: certificates } = useCertificatesQuery({
    filters: { student_id: user?.id },
    pageSize: 100,
    orderBy: { column: 'issued_at', ascending: false },
  })
  const { data: courses } = useCoursesQuery({ pageSize: 100 })
  const { data: assignments } = useAssignmentsQuery({ pageSize: 1000 })
  const { data: submissions } = useSubmissionsQuery({
    filters: { student_id: user?.id },
    pageSize: 500,
  })
  const { data: attendance } = useAttendanceQuery({
    filters: { student_id: user?.id },
    pageSize: 500,
  })
  const { data: profiles } = useProfilesQuery({ pageSize: 500 })

  const courseById = new Map((courses?.data ?? []).map((c) => [c.id, c]))
  const profileById = new Map((profiles?.data ?? []).map((p) => [p.id, p]))
  const enrollmentList = allEnrollments?.data ?? []
  const myEnrollments = enrollmentList.filter((e) => e.student_id === user?.id)
  const enrolledCourseIds = new Set(myEnrollments.map((e) => e.course_id))
  const myCourses = [...enrolledCourseIds]
    .map((id) => courseById.get(id))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))

  const upcomingDeadlines = (assignments?.data ?? [])
    .filter((a) => enrolledCourseIds.has(a.course_id) && new Date(a.due_date).getTime() >= now)
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
  const markedDates = new Set(upcomingDeadlines.map((a) => a.due_date.slice(0, 10)))

  const gradedSubmissions = (submissions?.data ?? []).filter((s) => s.score !== null)
  const avgGrade = gradedSubmissions.length
    ? Math.round(
        gradedSubmissions.reduce((sum, s) => sum + (s.score ?? 0), 0) / gradedSubmissions.length,
      )
    : null

  const submissionsByMonth = bucketByMonth(
    submissions?.data ?? [],
    (s) => s.submitted_at ?? s.created_at,
  )
  const enrollmentsByMonth = bucketByMonth(myEnrollments, (e) => e.enrolled_at)
  const weekdayAttendance = computeWeekdayAttendance(attendance?.data ?? [])

  const gradeDistribution = GRADE_BUCKETS.map((bucket) => ({
    label: bucket.label,
    value: gradedSubmissions.filter(
      (s) => (s.score ?? 0) >= bucket.min && (s.score ?? 0) <= bucket.max,
    ).length,
  }))

  const levelBreakdown = (['beginner', 'intermediate', 'advanced'] as const).map((level) => ({
    label: COURSE_LEVEL_LABELS[level],
    value: myCourses.filter((c) => c.level === level).length,
  }))

  const cert = certificates?.data[0]

  const scheduleItems: ActivityListItem[] = upcomingDeadlines.slice(0, 4).map((a) => ({
    icon: CalendarClock,
    toneClassName: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
    title: a.title,
    subtitle: courseById.get(a.course_id)?.title ?? '—',
    rightLabel: 'Due',
    rightTone: 'neutral',
    groupLabel: deadlineGroupLabel(a.due_date, now),
  }))

  const recentEnrollments = myEnrollments.map((e) => ({
    date: e.enrolled_at,
    item: {
      icon: BookOpen,
      toneClassName: 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400',
      title: 'Enrolled in course',
      subtitle: courseById.get(e.course_id)?.title ?? '—',
      rightLabel: ENROLLMENT_STATUS_LABELS[e.status],
      rightTone: (e.status === 'completed'
        ? 'positive'
        : e.status === 'cancelled'
          ? 'negative'
          : 'neutral') as 'positive' | 'negative' | 'neutral',
    },
  }))
  const recentSubmissions = (submissions?.data ?? []).map((s) => {
    const rightTone: 'positive' | 'negative' | 'neutral' =
      s.status === 'graded' ? 'positive' : s.status === 'late' ? 'negative' : 'neutral'
    return {
      date: s.submitted_at ?? s.created_at,
      item: {
        icon: GraduationCap,
        toneClassName:
          'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
        title: 'Submission ' + (s.status === 'graded' ? 'graded' : s.status),
        subtitle: s.score !== null ? `Scored ${s.score}%` : 'Awaiting grade',
        rightLabel: SUBMISSION_STATUS_LABELS[s.status],
        rightTone,
      },
    }
  })
  const recentCerts = (certificates?.data ?? []).map((c) => ({
    date: c.issued_at,
    item: {
      icon: Award,
      toneClassName: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
      title: 'Certificate earned',
      subtitle: courseById.get(c.course_id)?.title ?? '—',
      rightLabel: formatDate(c.issued_at),
      rightTone: 'neutral' as const,
    },
  }))

  const recentActivities: ActivityListItem[] = [
    ...recentEnrollments,
    ...recentSubmissions,
    ...recentCerts,
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6)
    .map((e) => e.item)

  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <div className="space-y-6 xl:col-span-2">
        <div className="grid gap-4 sm:grid-cols-3">
          <HeroGradientCard
            variant="rose"
            label="Enrolled Courses"
            value={myEnrollments.length}
            icon={BookOpen}
            viewAllHref={ROUTE_PATHS.courses}
            description="Keep learning"
          />
          <HeroGradientCard
            variant="gold"
            label="Avg. Grade"
            value={avgGrade === null ? '—' : `${avgGrade}%`}
            icon={GraduationCap}
            description={avgGrade === null ? 'No graded work yet' : 'Across graded submissions'}
          />
          <HeroGradientCard
            variant="mint"
            certificateStyle={Boolean(cert)}
            label="Certificates Earned"
            value={certificates?.data.length ?? 0}
            icon={Award}
            description={
              cert ? `Latest: ${cert.certificate_code}` : 'Complete a course to earn one'
            }
            code={cert?.certificate_code}
            holderName={profile?.full_name ?? '—'}
            issuedLabel={cert ? formatDate(cert.issued_at) : '—'}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <TrendAreaChart
            title="Submissions"
            subtitle="Your activity, by month"
            datasets={{
              'By month': submissionsByMonth.length
                ? submissionsByMonth
                : [{ label: '—', value: 0 }],
            }}
            tone="brand"
          />
          <DistributionChart
            title="Enrollments Over Time"
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
              {myCourses.slice(0, 3).map((course) => (
                <CourseThumbnailCard
                  key={course.id}
                  course={course}
                  enrolledStudents={enrollmentList
                    .filter((e) => e.course_id === course.id && e.student_id !== user?.id)
                    .map((e) => profileById.get(e.student_id))
                    .filter((p): p is NonNullable<typeof p> => Boolean(p))}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <DistributionChart
            title="Grade Distribution"
            subtitle="Graded submissions by score range"
            data={gradeDistribution}
            variant="bar"
          />
          <DistributionChart title="My Courses by Level" data={levelBreakdown} variant="pie" />
        </div>
      </div>

      <div className="space-y-6">
        <MiniCalendar markedDates={markedDates} />
        <ActivityListPanel
          title="Schedule"
          items={scheduleItems}
          viewAllHref={ROUTE_PATHS.calendar}
          emptyLabel="Nothing due soon."
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
