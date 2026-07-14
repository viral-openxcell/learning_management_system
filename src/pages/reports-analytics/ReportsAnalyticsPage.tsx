import { Award, CalendarCheck, GraduationCap, UserPlus } from 'lucide-react'
import { StatCard } from '@/components/cards/StatCard'
import { TrendAreaChart } from '@/components/charts/TrendAreaChart'
import { DistributionChart } from '@/components/charts/DistributionChart'
import { createEntityHooks } from '@/hooks/createEntityHooks'
import { useCoursesQuery } from '@/hooks/useCourses'
import { useCategoriesQuery } from '@/hooks/useCategories'
import { bucketByMonth } from '@/utils/bucketByMonth'

const { useListQuery: useEnrollmentsQuery } = createEntityHooks('enrollments')
const { useListQuery: useSubmissionsQuery } = createEntityHooks('submissions')
const { useListQuery: useAttendanceQuery } = createEntityHooks('attendance_records')
const { useListQuery: useCertificatesQuery } = createEntityHooks('certificates')

const GRADE_BUCKETS: { label: string; min: number; max: number }[] = [
  { label: '0–59', min: 0, max: 59 },
  { label: '60–69', min: 60, max: 69 },
  { label: '70–79', min: 70, max: 79 },
  { label: '80–89', min: 80, max: 89 },
  { label: '90–100', min: 90, max: 100 },
]

export function ReportsAnalyticsPage() {
  const { data: courses } = useCoursesQuery({ pageSize: 100 })
  const { data: categories } = useCategoriesQuery()
  const { data: enrollments, isLoading } = useEnrollmentsQuery({ pageSize: 1000 })
  const { data: submissions } = useSubmissionsQuery({ pageSize: 1000 })
  const { data: attendance } = useAttendanceQuery({ pageSize: 1000 })
  const { data: certificates } = useCertificatesQuery({ pageSize: 1000 })

  const courseList = courses?.data ?? []
  const enrollmentList = enrollments?.data ?? []
  const gradedSubmissions = (submissions?.data ?? []).filter((s) => s.score !== null)
  const avgScore = gradedSubmissions.length
    ? Math.round(
        gradedSubmissions.reduce((sum, s) => sum + (s.score ?? 0), 0) / gradedSubmissions.length,
      )
    : 0
  const attendanceList = attendance?.data ?? []
  const attendanceRate = attendanceList.length
    ? Math.round(
        (attendanceList.filter((a) => a.status === 'present').length / attendanceList.length) * 100,
      )
    : 0

  const enrollmentsByCourse = new Map<string, number>()
  for (const e of enrollmentList)
    enrollmentsByCourse.set(e.course_id, (enrollmentsByCourse.get(e.course_id) ?? 0) + 1)
  const topCoursesChart = [...enrollmentsByCourse.entries()]
    .map(([courseId, count]) => ({ course: courseList.find((c) => c.id === courseId), count }))
    .filter((row) => row.course)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map((row) => ({
      label:
        row.course!.title.length > 24 ? `${row.course!.title.slice(0, 24)}…` : row.course!.title,
      value: row.count,
    }))

  const categoryDistribution = (categories?.data ?? []).map((category) => ({
    label: category.name.split(' ')[0] ?? category.name,
    value: courseList.filter((c) => c.category_id === category.id).length,
  }))

  const enrollmentStatusChart = (['pending', 'active', 'completed', 'cancelled'] as const).map(
    (status) => ({
      label: status.charAt(0).toUpperCase() + status.slice(1),
      value: enrollmentList.filter((e) => e.status === status).length,
    }),
  )

  const enrollmentTrendChart = { 'by month': bucketByMonth(enrollmentList, (e) => e.enrolled_at) }

  const gradeDistribution = GRADE_BUCKETS.map((bucket) => ({
    label: bucket.label,
    value: gradedSubmissions.filter(
      (s) => (s.score ?? 0) >= bucket.min && (s.score ?? 0) <= bucket.max,
    ).length,
  }))

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Platform-wide performance across courses and students.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Enrollments"
          value={enrollmentList.length}
          icon={UserPlus}
          tone="brand"
          isLoading={isLoading}
          index={0}
        />
        <StatCard
          label="Avg. Grade"
          value={`${avgScore}%`}
          icon={GraduationCap}
          tone="blue"
          isLoading={isLoading}
          index={1}
        />
        <StatCard
          label="Attendance Rate"
          value={`${attendanceRate}%`}
          icon={CalendarCheck}
          tone="orange"
          isLoading={isLoading}
          index={2}
        />
        <StatCard
          label="Certificates Issued"
          value={certificates?.data.length ?? 0}
          icon={Award}
          tone="emerald"
          isLoading={isLoading}
          index={3}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <DistributionChart title="Courses by category" data={categoryDistribution} variant="pie" />
        <DistributionChart
          title="Enrollments by status"
          data={enrollmentStatusChart}
          variant="bar"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <TrendAreaChart
          title="Enrollments over time"
          subtitle="New enrollments by month"
          datasets={enrollmentTrendChart}
          tone="brand"
        />
        <DistributionChart
          title="Grade distribution"
          subtitle="Graded submissions by score range"
          data={gradeDistribution}
          variant="bar"
        />
      </div>

      <DistributionChart
        title="Top courses by enrollment"
        data={topCoursesChart}
        variant="horizontal-bar"
      />
    </div>
  )
}
