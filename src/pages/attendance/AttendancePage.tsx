import { useState } from 'react'
import { CheckCircle2, XCircle, Clock3 } from 'lucide-react'
import { DataTable, type DataTableColumn } from '@/components/tables/DataTable'
import { Select } from '@/components/ui/Select'
import { DatePicker } from '@/components/ui/DatePicker'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { createEntityHooks } from '@/hooks/createEntityHooks'
import { useDisclosure } from '@/hooks/useDisclosure'
import {
  ATTENDANCE_STATUSES,
  ATTENDANCE_STATUS_LABELS,
  type AttendanceStatus,
} from '@/constants/moduleEnums'
import { toast } from '@/utils/toast'
import { cn } from '@/utils/cn'
import type { Database } from '@/types/supabase'

type Batch = Database['public']['Tables']['batches']['Row']
type AttendanceRecord = Database['public']['Tables']['attendance_records']['Row']

const { useListQuery: useBatchesQuery } = createEntityHooks('batches')
const { useListQuery: useEnrollmentsQuery } = createEntityHooks('enrollments')
const { useListQuery: useProfilesQuery } = createEntityHooks('profiles')
const {
  useListQuery: useAttendanceQuery,
  useCreateMutation,
  useUpdateMutation,
} = createEntityHooks('attendance_records')

const STATUS_ICON: Record<AttendanceStatus, typeof CheckCircle2> = {
  present: CheckCircle2,
  absent: XCircle,
  late: Clock3,
}

const STATUS_COLOR: Record<AttendanceStatus, string> = {
  present: 'text-emerald-600 dark:text-emerald-400',
  absent: 'text-red-500 dark:text-red-400',
  late: 'text-amber-500 dark:text-amber-400',
}

export function AttendancePage() {
  const { data: batches } = useBatchesQuery({ pageSize: 100 })
  const batchList = batches?.data ?? []
  const [batchId, setBatchId] = useState('')
  const [sessionDate, setSessionDate] = useState(() => new Date().toISOString().slice(0, 10))
  const historyDialog = useDisclosure()

  const activeBatch: Batch | undefined = batchList.find((b) => b.id === batchId) ?? batchList[0]
  const effectiveBatchId = batchId || activeBatch?.id || ''

  const { data: enrollments } = useEnrollmentsQuery({
    pageSize: 500,
    filters: { course_id: activeBatch?.course_id },
  })
  const { data: profiles } = useProfilesQuery({ pageSize: 500 })
  const { data: attendance, isLoading } = useAttendanceQuery({
    pageSize: 500,
    filters: { batch_id: effectiveBatchId },
  })
  const createRecord = useCreateMutation()
  const updateRecord = useUpdateMutation()

  const studentById = new Map((profiles?.data ?? []).map((p) => [p.id, p]))
  const roster = enrollments?.data.map((e) => studentById.get(e.student_id)).filter(Boolean) ?? []

  const sessionRecords = (attendance?.data ?? []).filter((r) => r.session_date === sessionDate)
  const recordByStudent = new Map(sessionRecords.map((r) => [r.student_id, r]))

  async function setStatus(studentId: string, status: AttendanceStatus) {
    const existing = recordByStudent.get(studentId)
    try {
      const checkInTime = status === 'absent' ? null : new Date().toISOString()
      if (existing) {
        await updateRecord.mutateAsync({
          id: existing.id,
          payload: { status, check_in_time: checkInTime },
        })
      } else {
        await createRecord.mutateAsync({
          batch_id: effectiveBatchId,
          student_id: studentId,
          session_date: sessionDate,
          status,
          check_in_time: checkInTime,
        })
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save attendance')
    }
  }

  const presentCount = sessionRecords.filter((r) => r.status === 'present').length
  const absentCount = sessionRecords.filter((r) => r.status === 'absent').length
  const lateCount = sessionRecords.filter((r) => r.status === 'late').length

  const historyColumns: DataTableColumn<AttendanceRecord>[] = [
    { key: 'date', header: 'Date', render: (r) => r.session_date },
    {
      key: 'student',
      header: 'Student',
      render: (r) => studentById.get(r.student_id)?.full_name ?? '—',
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => (
        <Badge
          variant={r.status === 'present' ? 'success' : r.status === 'late' ? 'warning' : 'danger'}
        >
          {ATTENDANCE_STATUS_LABELS[r.status]}
        </Badge>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Mark attendance for a batch session.
          </p>
        </div>
        <button
          onClick={historyDialog.toggle}
          className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
        >
          {historyDialog.isOpen ? 'Hide full history' : 'View full history'}
        </button>
      </div>

      <div className="panel flex flex-wrap items-end gap-4 p-4">
        <div className="w-56">
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Batch
          </label>
          <Select
            value={effectiveBatchId}
            onChange={(event) => setBatchId(event.target.value)}
            options={batchList.map((b) => ({ label: b.name, value: b.id }))}
            placeholder="Select a batch"
          />
        </div>
        <div className="w-48">
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Session date
          </label>
          <DatePicker
            value={sessionDate}
            onChange={(event) => setSessionDate(event.target.value)}
          />
        </div>
        <div className="flex gap-4 pb-2 text-sm">
          <span className="text-emerald-600 dark:text-emerald-400">{presentCount} present</span>
          <span className="text-red-500 dark:text-red-400">{absentCount} absent</span>
          <span className="text-amber-500 dark:text-amber-400">{lateCount} late</span>
        </div>
      </div>

      {!historyDialog.isOpen ? (
        <div className="panel divide-y divide-slate-100 dark:divide-slate-800">
          {isLoading && <p className="p-4 text-sm text-slate-500">Loading roster...</p>}
          {!isLoading && roster.length === 0 && (
            <p className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">
              No students enrolled in this batch's course yet.
            </p>
          )}
          {roster.map((student) => {
            if (!student) return null
            const record = recordByStudent.get(student.id)
            const currentStatus: AttendanceStatus = record?.status ?? 'present'
            return (
              <div key={student.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="flex items-center gap-3">
                  <Avatar src={student.avatar_url} name={student.full_name} size="sm" />
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {student.full_name}
                  </span>
                </div>
                <div className="flex gap-1">
                  {ATTENDANCE_STATUSES.map((status) => {
                    const Icon = STATUS_ICON[status]
                    const isActive = currentStatus === status && record !== undefined
                    return (
                      <button
                        key={status}
                        onClick={() => setStatus(student.id, status)}
                        title={ATTENDANCE_STATUS_LABELS[status]}
                        className={cn(
                          'flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors',
                          isActive
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                            : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800',
                        )}
                      >
                        <Icon className={cn('h-3.5 w-3.5', !isActive && STATUS_COLOR[status])} />
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <DataTable
          data={attendance?.data ?? []}
          columns={historyColumns}
          getRowId={(r) => r.id}
          isLoading={isLoading}
          emptyTitle="No attendance recorded yet"
        />
      )}
    </div>
  )
}
