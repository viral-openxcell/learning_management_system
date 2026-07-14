import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ClipboardList } from 'lucide-react'
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
import { SUBMISSION_STATUS_LABELS } from '@/constants/moduleEnums'
import { formatDate } from '@/utils/formatDate'
import { useDisclosure } from '@/hooks/useDisclosure'
import { ROUTE_PATHS } from '@/routes/routePaths'
import { toast } from '@/utils/toast'

const { useGetQuery: useAssignmentQuery, useDeleteMutation: useDeleteAssignmentMutation } =
  createEntityHooks('assignments')
const { useListQuery: useSubmissionsQuery } = createEntityHooks('submissions')

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'submissions', label: 'Submissions' },
]

export function AssignmentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [tab, setTab] = useState('overview')
  const deleteDialog = useDisclosure()

  const { data: assignment, isLoading, error } = useAssignmentQuery(id)
  const { data: courses } = useCoursesQuery({ pageSize: 200 })
  const { data: profiles } = useUsersQuery({ pageSize: 500 })
  const { data: submissions } = useSubmissionsQuery({
    pageSize: 300,
    filters: { assignment_id: id },
  })
  const deleteAssignment = useDeleteAssignmentMutation()

  if (isLoading) return <LoadingSkeleton rows={8} />
  if (error || !assignment) return <ErrorState title="Assignment not found" />

  const course = courses?.data.find((c) => c.id === assignment.course_id)
  const profileById = new Map((profiles?.data ?? []).map((p) => [p.id, p]))
  const gradedCount = submissions?.data.filter((s) => s.status === 'graded').length ?? 0

  async function handleDelete() {
    if (!id) return
    try {
      await deleteAssignment.mutateAsync(id)
      toast.success('Assignment deleted')
      navigate(ROUTE_PATHS.assignments)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete assignment')
    }
  }

  return (
    <div className="space-y-4">
      <DetailPageHeader
        backHref={ROUTE_PATHS.assignments}
        backLabel="Back to assignments"
        media={
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-rose text-slate-900">
            <ClipboardList className="h-6 w-6" />
          </div>
        }
        title={assignment.title}
        subtitle={course?.title}
        badges={[{ label: `Due ${formatDate(assignment.due_date)}`, variant: 'warning' }]}
        stats={[
          { label: 'max score', value: assignment.max_score },
          { label: 'submissions', value: submissions?.count ?? 0 },
          { label: 'graded', value: gradedCount },
        ]}
        onDelete={deleteDialog.open}
      />

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'overview' && (
        <div className="panel space-y-3 p-5 text-sm">
          <p className="text-slate-600 dark:text-slate-300">
            {assignment.description || 'No description provided.'}
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
            <span>Due: {formatDate(assignment.due_date)}</span>
            <span>Max score: {assignment.max_score}</span>
            <span>Max attempts: {assignment.max_attempts}</span>
          </div>
        </div>
      )}

      {tab === 'submissions' && (
        <div className="panel divide-y divide-slate-100 dark:divide-slate-800">
          {(submissions?.data.length ?? 0) === 0 && <EmptyState title="No submissions yet" />}
          {submissions?.data.map((submission) => {
            const student = profileById.get(submission.student_id)
            return (
              <div
                key={submission.id}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <Avatar src={student?.avatar_url} name={student?.full_name} size="sm" />
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {student?.full_name ?? '—'}
                    </p>
                    <p className="text-xs text-slate-400">
                      {submission.score !== null
                        ? `Scored ${submission.score}/${assignment.max_score}`
                        : 'Not graded yet'}
                      {submission.feedback ? ` · ${submission.feedback}` : ''}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={
                    submission.status === 'graded'
                      ? 'success'
                      : submission.status === 'late'
                        ? 'danger'
                        : 'info'
                  }
                >
                  {SUBMISSION_STATUS_LABELS[submission.status]}
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
        title="Delete assignment"
        description={`Are you sure you want to delete "${assignment.title}"?`}
        confirmLabel="Delete"
        isLoading={deleteAssignment.isPending}
      />
    </div>
  )
}
