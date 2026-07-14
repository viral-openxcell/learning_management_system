import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Award, Briefcase, Mail, MapPin, Phone } from 'lucide-react'
import { DetailPageHeader } from '@/components/cards/DetailPageHeader'
import { Tabs } from '@/components/ui/Tabs'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { ConfirmDialog } from '@/components/modals/ConfirmDialog'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { ErrorState } from '@/components/common/ErrorState'
import { EmptyState } from '@/components/common/EmptyState'
import { useCoursesQuery } from '@/hooks/useCourses'
import { useDeleteUserMutation } from '@/hooks/useUsers'
import { createEntityHooks } from '@/hooks/createEntityHooks'
import { ROLE_LABELS } from '@/constants/roles'
import { ENROLLMENT_STATUS_LABELS } from '@/constants/moduleEnums'
import { COURSE_STATUS_LABELS } from '@/constants/courseLevels'
import { formatDate } from '@/utils/formatDate'
import { useDisclosure } from '@/hooks/useDisclosure'
import { ROUTE_PATHS } from '@/routes/routePaths'
import { toast } from '@/utils/toast'

const { useGetQuery: useProfileQuery } = createEntityHooks('profiles')
const { useListQuery: useEnrollmentsQuery } = createEntityHooks('enrollments')
const { useListQuery: useCertificatesQuery } = createEntityHooks('certificates')
const { useListQuery: useAttendanceQuery } = createEntityHooks('attendance_records')
const { useListQuery: useBatchesQuery } = createEntityHooks('batches')

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'courses', label: 'Courses' },
  { key: 'certificates', label: 'Certificates' },
  { key: 'attendance', label: 'Attendance' },
]

export function UserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [tab, setTab] = useState('overview')
  const deleteDialog = useDisclosure()

  const { data: profile, isLoading, error } = useProfileQuery(id)
  const isInstructor = profile?.role === 'instructor'
  const isStudent = profile?.role === 'student'

  const { data: taughtCourses } = useCoursesQuery({ pageSize: 100, filters: { instructor_id: id } })
  const { data: enrollments } = useEnrollmentsQuery({ pageSize: 200, filters: { student_id: id } })
  const { data: allCourses } = useCoursesQuery({ pageSize: 200 })
  const { data: certificates } = useCertificatesQuery({
    pageSize: 100,
    filters: { student_id: id },
  })
  const { data: attendance } = useAttendanceQuery({ pageSize: 300, filters: { student_id: id } })
  const { data: batches } = useBatchesQuery({ pageSize: 100 })
  const deleteUser = useDeleteUserMutation()

  if (isLoading) return <LoadingSkeleton rows={8} />
  if (error || !profile) return <ErrorState title="User not found" />

  const courseById = new Map((allCourses?.data ?? []).map((c) => [c.id, c]))
  const batchById = new Map((batches?.data ?? []).map((b) => [b.id, b]))

  async function handleDelete() {
    if (!id) return
    try {
      await deleteUser.mutateAsync(id)
      toast.success('User removed')
      navigate(ROUTE_PATHS.users)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to remove user')
    }
  }

  return (
    <div className="space-y-4">
      <DetailPageHeader
        backHref={ROUTE_PATHS.users}
        backLabel="Back to users"
        media={<Avatar src={profile.avatar_url} name={profile.full_name} size="lg" />}
        title={profile.full_name ?? profile.email}
        subtitle={profile.email}
        badges={[
          { label: ROLE_LABELS[profile.role], variant: 'info' },
          {
            label: profile.is_active ? 'Active' : 'Suspended',
            variant: profile.is_active ? 'success' : 'default',
          },
        ]}
        stats={[{ label: 'joined', value: formatDate(profile.created_at) }]}
        onDelete={deleteDialog.open}
      />

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'overview' && (
        <div className="panel space-y-3 p-5 text-sm">
          <p className="text-slate-600 dark:text-slate-300">{profile.bio || 'No bio provided.'}</p>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Mail className="h-4 w-4 text-slate-400" /> {profile.email}
            </div>
            {profile.phone && (
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Phone className="h-4 w-4 text-slate-400" /> {profile.phone}
              </div>
            )}
            {profile.department && (
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Briefcase className="h-4 w-4 text-slate-400" /> {profile.department}
              </div>
            )}
            {profile.location && (
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <MapPin className="h-4 w-4 text-slate-400" /> {profile.location}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'courses' && (
        <div className="panel divide-y divide-slate-100 dark:divide-slate-800">
          {isInstructor ? (
            <>
              {(taughtCourses?.data.length ?? 0) === 0 && (
                <EmptyState title="Not teaching any courses yet" />
              )}
              {taughtCourses?.data.map((course) => (
                <div key={course.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {course.title}
                  </p>
                  <Badge variant={course.status === 'published' ? 'success' : 'default'}>
                    {COURSE_STATUS_LABELS[course.status]}
                  </Badge>
                </div>
              ))}
            </>
          ) : (
            <>
              {(enrollments?.data.length ?? 0) === 0 && (
                <EmptyState title="Not enrolled in any courses yet" />
              )}
              {enrollments?.data.map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="flex items-center justify-between gap-3 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {courseById.get(enrollment.course_id)?.title ?? '—'}
                    </p>
                    <p className="text-xs text-slate-400">
                      Enrolled {formatDate(enrollment.enrolled_at)} · {enrollment.progress_percent}%
                      complete
                    </p>
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
              ))}
            </>
          )}
        </div>
      )}

      {tab === 'certificates' && (
        <div className="panel divide-y divide-slate-100 dark:divide-slate-800">
          {!isStudent && <EmptyState title="Certificates only apply to students" />}
          {isStudent && (certificates?.data.length ?? 0) === 0 && (
            <EmptyState title="No certificates earned yet" />
          )}
          {isStudent &&
            certificates?.data.map((cert) => (
              <div key={cert.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="flex items-center gap-3">
                  <Award className="h-4 w-4 text-amber-500" />
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {courseById.get(cert.course_id)?.title ?? '—'}
                    </p>
                    <p className="text-xs text-slate-400">
                      {cert.certificate_code} · Issued {formatDate(cert.issued_at)}
                    </p>
                  </div>
                </div>
                {cert.grade && <Badge variant="success">Grade {cert.grade}</Badge>}
              </div>
            ))}
        </div>
      )}

      {tab === 'attendance' && (
        <div className="panel divide-y divide-slate-100 dark:divide-slate-800">
          {!isStudent && <EmptyState title="Attendance only applies to students" />}
          {isStudent && (attendance?.data.length ?? 0) === 0 && (
            <EmptyState title="No attendance records yet" />
          )}
          {isStudent &&
            attendance?.data.map((record) => (
              <div key={record.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {batchById.get(record.batch_id)?.name ?? '—'}
                  </p>
                  <p className="text-xs text-slate-400">{formatDate(record.session_date)}</p>
                </div>
                <Badge
                  variant={
                    record.status === 'present'
                      ? 'success'
                      : record.status === 'late'
                        ? 'warning'
                        : 'danger'
                  }
                >
                  {record.status}
                </Badge>
              </div>
            ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        onConfirm={handleDelete}
        title="Remove user"
        description={`Are you sure you want to remove "${profile.full_name ?? profile.email}"?`}
        confirmLabel="Remove"
        isLoading={deleteUser.isPending}
      />
    </div>
  )
}
