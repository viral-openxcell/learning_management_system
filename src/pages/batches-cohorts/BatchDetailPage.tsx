import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Calendar, Users, Video } from 'lucide-react'
import { DetailPageHeader } from '@/components/cards/DetailPageHeader'
import { Tabs } from '@/components/ui/Tabs'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { ConfirmDialog } from '@/components/modals/ConfirmDialog'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { ErrorState } from '@/components/common/ErrorState'
import { EmptyState } from '@/components/common/EmptyState'
import { useCoursesQuery } from '@/hooks/useCourses'
import { useUsersQuery } from '@/hooks/useUsers'
import { createEntityHooks } from '@/hooks/createEntityHooks'
import { BATCH_STATUS_LABELS, LIVE_CLASS_STATUS_LABELS } from '@/constants/moduleEnums'
import { formatDate, formatDateTime } from '@/utils/formatDate'
import { useDisclosure } from '@/hooks/useDisclosure'
import { ROUTE_PATHS } from '@/routes/routePaths'
import { toast } from '@/utils/toast'

const { useGetQuery: useBatchQuery, useDeleteMutation: useDeleteBatchMutation } =
  createEntityHooks('batches')
const { useListQuery: useEnrollmentsQuery } = createEntityHooks('enrollments')
const { useListQuery: useAttendanceQuery } = createEntityHooks('attendance_records')
const { useListQuery: useLiveClassesQuery } = createEntityHooks('live_classes')

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'roster', label: 'Roster' },
  { key: 'attendance', label: 'Attendance' },
  { key: 'live', label: 'Live Classes' },
]

export function BatchDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [tab, setTab] = useState('overview')
  const deleteDialog = useDisclosure()

  const { data: batch, isLoading, error } = useBatchQuery(id)
  const { data: courses } = useCoursesQuery({ pageSize: 200 })
  const { data: instructors } = useUsersQuery({ pageSize: 500 })
  const { data: enrollments } = useEnrollmentsQuery({ pageSize: 200, filters: { batch_id: id } })
  const { data: attendance } = useAttendanceQuery({ pageSize: 300, filters: { batch_id: id } })
  const { data: liveClasses } = useLiveClassesQuery({ pageSize: 100, filters: { batch_id: id } })
  const deleteBatch = useDeleteBatchMutation()

  if (isLoading) return <LoadingSkeleton rows={8} />
  if (error || !batch) return <ErrorState title="Batch not found" />

  const course = courses?.data.find((c) => c.id === batch.course_id)
  const profileById = new Map((instructors?.data ?? []).map((p) => [p.id, p]))
  const instructor = profileById.get(batch.instructor_id)

  async function handleDelete() {
    if (!id) return
    try {
      await deleteBatch.mutateAsync(id)
      toast.success('Batch deleted')
      navigate(ROUTE_PATHS.batchesCohorts)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete batch')
    }
  }

  return (
    <div className="space-y-4">
      <DetailPageHeader
        backHref={ROUTE_PATHS.batchesCohorts}
        backLabel="Back to batches"
        media={
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-gold text-slate-900">
            <Calendar className="h-6 w-6" />
          </div>
        }
        title={batch.name}
        subtitle={course?.title}
        badges={[
          {
            label: BATCH_STATUS_LABELS[batch.status],
            variant:
              batch.status === 'active'
                ? 'success'
                : batch.status === 'completed'
                  ? 'default'
                  : 'warning',
          },
        ]}
        stats={[
          { label: 'students', value: enrollments?.count ?? 0 },
          { label: 'capacity', value: batch.capacity },
          {
            label: 'schedule',
            value: `${formatDate(batch.start_date)} – ${formatDate(batch.end_date)}`,
          },
        ]}
        onDelete={deleteDialog.open}
      />

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'overview' && (
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
            <Users className="h-4 w-4 text-slate-400" /> {enrollments?.count ?? 0} /{' '}
            {batch.capacity} students
          </div>
          {batch.schedule_note && (
            <p className="text-slate-600 dark:text-slate-300">Schedule: {batch.schedule_note}</p>
          )}
        </div>
      )}

      {tab === 'roster' && (
        <div className="panel divide-y divide-slate-100 dark:divide-slate-800">
          {(enrollments?.data.length ?? 0) === 0 && (
            <EmptyState title="No students in this batch yet" />
          )}
          {enrollments?.data.map((enrollment) => {
            const student = profileById.get(enrollment.student_id)
            return (
              <div key={enrollment.id} className="flex items-center gap-3 px-4 py-3">
                <Avatar src={student?.avatar_url} name={student?.full_name} size="sm" />
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {student?.full_name ?? '—'}
                  </p>
                  <p className="text-xs text-slate-400">{enrollment.progress_percent}% complete</p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {tab === 'attendance' && (
        <div className="panel divide-y divide-slate-100 dark:divide-slate-800">
          {(attendance?.data.length ?? 0) === 0 && (
            <EmptyState title="No attendance recorded yet" />
          )}
          {attendance?.data.map((record) => {
            const student = profileById.get(record.student_id)
            return (
              <div key={record.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {student?.full_name ?? '—'}
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
            )
          })}
        </div>
      )}

      {tab === 'live' && (
        <div className="panel divide-y divide-slate-100 dark:divide-slate-800">
          {(liveClasses?.data.length ?? 0) === 0 && (
            <EmptyState title="No live classes scheduled" />
          )}
          {liveClasses?.data.map((lc) => (
            <div key={lc.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="flex items-center gap-3">
                <Video className="h-4 w-4 text-slate-400" />
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {lc.title}
                  </p>
                  <p className="text-xs text-slate-400">{formatDateTime(lc.scheduled_at)}</p>
                </div>
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
        title="Delete batch"
        description={`Are you sure you want to delete "${batch.name}"?`}
        confirmLabel="Delete"
        isLoading={deleteBatch.isPending}
      />
    </div>
  )
}
