import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Video } from 'lucide-react'
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
import { LIVE_CLASS_STATUS_LABELS } from '@/constants/moduleEnums'
import { formatDateTime } from '@/utils/formatDate'
import { useDisclosure } from '@/hooks/useDisclosure'
import { ROUTE_PATHS } from '@/routes/routePaths'
import { toast } from '@/utils/toast'

const { useGetQuery: useLiveClassQuery, useDeleteMutation: useDeleteLiveClassMutation } =
  createEntityHooks('live_classes')
const { useListQuery: useBatchesQuery } = createEntityHooks('batches')
const { useListQuery: useAttendanceQuery } = createEntityHooks('attendance_records')

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'attendance', label: 'Attendance' },
]

export function LiveClassDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [tab, setTab] = useState('overview')
  const deleteDialog = useDisclosure()

  const { data: liveClass, isLoading, error } = useLiveClassQuery(id)
  const { data: courses } = useCoursesQuery({ pageSize: 200 })
  const { data: batches } = useBatchesQuery({ pageSize: 100 })
  const { data: profiles } = useUsersQuery({ pageSize: 500 })
  const { data: attendance } = useAttendanceQuery({
    pageSize: 300,
    filters: { batch_id: liveClass?.batch_id ?? undefined },
  })
  const deleteLiveClass = useDeleteLiveClassMutation()

  if (isLoading) return <LoadingSkeleton rows={8} />
  if (error || !liveClass) return <ErrorState title="Live class not found" />

  const course = courses?.data.find((c) => c.id === liveClass.course_id)
  const batch = batches?.data.find((b) => b.id === liveClass.batch_id)
  const profileById = new Map((profiles?.data ?? []).map((p) => [p.id, p]))
  const sessionDate = liveClass.scheduled_at.slice(0, 10)
  const sessionAttendance = (attendance?.data ?? []).filter((r) => r.session_date === sessionDate)

  async function handleDelete() {
    if (!id) return
    try {
      await deleteLiveClass.mutateAsync(id)
      toast.success('Live class deleted')
      navigate(ROUTE_PATHS.liveClasses)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete live class')
    }
  }

  return (
    <div className="space-y-4">
      <DetailPageHeader
        backHref={ROUTE_PATHS.liveClasses}
        backLabel="Back to live classes"
        media={
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-sky text-slate-900">
            <Video className="h-6 w-6" />
          </div>
        }
        title={liveClass.title}
        subtitle={[course?.title, batch?.name].filter(Boolean).join(' · ')}
        badges={[
          {
            label: LIVE_CLASS_STATUS_LABELS[liveClass.status],
            variant:
              liveClass.status === 'upcoming'
                ? 'info'
                : liveClass.status === 'ended'
                  ? 'default'
                  : 'danger',
          },
        ]}
        stats={[
          { label: 'scheduled', value: formatDateTime(liveClass.scheduled_at) },
          { label: 'duration', value: `${liveClass.duration_minutes} min` },
        ]}
        onDelete={deleteDialog.open}
      />

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'overview' && (
        <div className="panel space-y-3 p-5 text-sm">
          <p className="text-slate-600 dark:text-slate-300">
            {liveClass.description || 'No description provided.'}
          </p>
          {liveClass.meeting_url && (
            <a
              href={liveClass.meeting_url}
              target="_blank"
              rel="noreferrer"
              className="block text-brand-600 hover:underline dark:text-brand-400"
            >
              Join meeting
            </a>
          )}
          {liveClass.recording_url && (
            <a
              href={liveClass.recording_url}
              target="_blank"
              rel="noreferrer"
              className="block text-brand-600 hover:underline dark:text-brand-400"
            >
              Watch recording
            </a>
          )}
        </div>
      )}

      {tab === 'attendance' && (
        <div className="panel divide-y divide-slate-100 dark:divide-slate-800">
          {!liveClass.batch_id && (
            <EmptyState
              title="No batch linked"
              description="This session isn't tied to a batch, so attendance can't be tracked."
            />
          )}
          {liveClass.batch_id && sessionAttendance.length === 0 && (
            <EmptyState title="No attendance recorded for this session" />
          )}
          {sessionAttendance.map((record) => {
            const student = profileById.get(record.student_id)
            return (
              <div key={record.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="flex items-center gap-3">
                  <Avatar src={student?.avatar_url} name={student?.full_name} size="sm" />
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {student?.full_name ?? '—'}
                  </p>
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

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        onConfirm={handleDelete}
        title="Delete live class"
        description={`Are you sure you want to delete "${liveClass.title}"?`}
        confirmLabel="Delete"
        isLoading={deleteLiveClass.isPending}
      />
    </div>
  )
}
