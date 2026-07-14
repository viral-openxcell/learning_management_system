import { useQuery } from '@tanstack/react-query'
import { createRepository } from '@/services/api/base.repository'
import { bucketByMonth, bucketSumByMonth, monthOverMonthTrend } from '@/utils/bucketByMonth'
import { computeWeekdayAttendance } from '@/utils/attendance'

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const [
        coursesResult,
        profilesResult,
        enrollmentsResult,
        certificatesResult,
        submissionsResult,
        attendanceResult,
      ] = await Promise.all([
        createRepository('courses').list({ pageSize: 1000 }),
        createRepository('profiles').list({ pageSize: 1000 }),
        createRepository('enrollments').list({ pageSize: 1000 }),
        createRepository('certificates').list({ pageSize: 1000 }),
        createRepository('submissions').list({ pageSize: 1000 }),
        createRepository('attendance_records').list({ pageSize: 1000 }),
      ])

      const submissionsByStatus = { pending: 0, submitted: 0, graded: 0, late: 0 }
      for (const submission of submissionsResult.data) submissionsByStatus[submission.status]++
      const gradedSubmissions = submissionsResult.data.filter((s) => s.status === 'graded')

      const studentCount = profilesResult.data.filter((p) => p.role === 'student').length
      const staffCount = profilesResult.data.length - studentCount

      const roleBreakdown = [
        {
          label: 'Students',
          value: profilesResult.data.filter((p) => p.role === 'student').length,
        },
        {
          label: 'Instructors',
          value: profilesResult.data.filter((p) => p.role === 'instructor').length,
        },
        { label: 'Admins', value: profilesResult.data.filter((p) => p.role === 'admin').length },
        {
          label: 'Super Admins',
          value: profilesResult.data.filter((p) => p.role === 'super_admin').length,
        },
      ]

      const profilesByMonth = bucketByMonth(profilesResult.data, (p) => p.created_at)
      const profilesTrend = monthOverMonthTrend(profilesResult.data, (p) => p.created_at)

      const completedEnrollments = enrollmentsResult.data.filter(
        (e) => e.status === 'completed',
      ).length
      const completionRate = enrollmentsResult.data.length
        ? Math.round((completedEnrollments / enrollmentsResult.data.length) * 100)
        : null

      const enrollmentsByMonth = bucketByMonth(enrollmentsResult.data, (e) => e.enrolled_at)
      const enrollmentTrend = monthOverMonthTrend(enrollmentsResult.data, (e) => e.enrolled_at)

      const gradedByMonth = bucketByMonth(gradedSubmissions, (s) => s.submitted_at ?? s.created_at)
      const gradedTrend = monthOverMonthTrend(
        gradedSubmissions,
        (s) => s.submitted_at ?? s.created_at,
      )

      const publishedCourses = coursesResult.data.filter((c) => c.status === 'published').length
      const draftCourses = coursesResult.data.filter((c) => c.status === 'draft').length
      const archivedCourses = coursesResult.data.filter((c) => c.status === 'archived').length
      const courseStatusBreakdown = [
        { label: 'Draft', value: draftCourses },
        { label: 'Archived', value: archivedCourses },
        { label: 'Published', value: publishedCourses },
      ]

      const certificatesByMonth = bucketByMonth(certificatesResult.data, (c) => c.issued_at)
      const certificatesTrend = monthOverMonthTrend(certificatesResult.data, (c) => c.issued_at)

      const courseById = new Map(coursesResult.data.map((c) => [c.id, c]))
      const revenueByMonth = bucketSumByMonth(
        enrollmentsResult.data,
        (e) => e.enrolled_at,
        (e) => courseById.get(e.course_id)?.price ?? 0,
      )

      const attendanceByWeekday = computeWeekdayAttendance(attendanceResult.data)

      return {
        courses: coursesResult.count,
        publishedCourses,
        courseStatusBreakdown,
        users: profilesResult.count,
        studentCount,
        staffCount,
        roleBreakdown,
        profilesByMonth,
        profilesTrend,
        revenueByMonth,
        attendanceByWeekday,
        enrollments: enrollmentsResult.count,
        completionRate,
        completedEnrollments,
        certificates: certificatesResult.count,
        submissionsByStatus,
        enrollmentsByMonth,
        enrollmentTrend,
        gradedByMonth,
        gradedTrend,
        certificatesByMonth,
        certificatesTrend,
      }
    },
  })
}
