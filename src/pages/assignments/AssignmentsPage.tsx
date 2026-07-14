import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarClock, Pencil, Plus, Trash2 } from 'lucide-react'
import { DataTable, type DataTableColumn } from '@/components/tables/DataTable'
import { DataTableToolbar } from '@/components/tables/DataTableToolbar'
import { PaginationControl } from '@/components/common/PaginationControl'
import { ConfirmDialog } from '@/components/modals/ConfirmDialog'
import { Modal } from '@/components/modals/Modal'
import { Badge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { createEntityHooks } from '@/hooks/createEntityHooks'
import { useCoursesQuery } from '@/hooks/useCourses'
import { useDebounce } from '@/hooks/useDebounce'
import { useDisclosure } from '@/hooks/useDisclosure'
import { useAuth } from '@/hooks/useAuth'
import { SUBMISSION_STATUS_LABELS } from '@/constants/moduleEnums'
import { formatDate } from '@/utils/formatDate'
import { toast } from '@/utils/toast'
import { AssignmentForm } from './components/AssignmentForm'
import type { AssignmentFormValues } from './assignment.schema'
import { ROUTE_PATHS } from '@/routes/routePaths'
import type { Database } from '@/types/supabase'

type Assignment = Database['public']['Tables']['assignments']['Row']

const { useListQuery, useCreateMutation, useUpdateMutation, useDeleteMutation } =
  createEntityHooks('assignments')
const { useListQuery: useSubmissionsQuery } = createEntityHooks('submissions')

export function AssignmentsPage() {
  const navigate = useNavigate()
  const { role, user } = useAuth()
  const isStaff = role === 'super_admin' || role === 'admin' || role === 'instructor'

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [courseFilter, setCourseFilter] = useState('')
  const [selected, setSelected] = useState<Assignment | null>(null)
  const [toDelete, setToDelete] = useState<Assignment | null>(null)
  const formDialog = useDisclosure()
  const deleteDialog = useDisclosure()

  const debouncedSearch = useDebounce(search)
  const { data: courses } = useCoursesQuery({ pageSize: 100 })
  const courseTitleById = new Map((courses?.data ?? []).map((c) => [c.id, c.title]))
  const { data: submissions } = useSubmissionsQuery({ pageSize: 1000 })

  const { data, isLoading } = useListQuery({
    page,
    pageSize: 10,
    search: debouncedSearch,
    searchColumns: debouncedSearch ? ['title'] : undefined,
    filters: { course_id: courseFilter || undefined },
    orderBy: { column: 'due_date', ascending: true },
  })
  const createMutation = useCreateMutation()
  const updateMutation = useUpdateMutation()
  const deleteMutation = useDeleteMutation()

  function submissionCount(assignmentId: string) {
    return submissions?.data.filter((s) => s.assignment_id === assignmentId).length ?? 0
  }

  function mySubmission(assignmentId: string) {
    return submissions?.data.find(
      (s) => s.assignment_id === assignmentId && s.student_id === user?.id,
    )
  }

  const columns: DataTableColumn<Assignment>[] = [
    {
      key: 'title',
      header: 'Assignment',
      render: (a) => (
        <span className="font-medium text-slate-900 dark:text-slate-100">{a.title}</span>
      ),
    },
    { key: 'course', header: 'Course', render: (a) => courseTitleById.get(a.course_id) ?? '—' },
    {
      key: 'due_date',
      header: 'Due date',
      render: (a) => (
        <span className="flex items-center gap-1 text-slate-500">
          <CalendarClock className="h-3.5 w-3.5" /> {formatDate(a.due_date)}
        </span>
      ),
    },
    { key: 'max_score', header: 'Max score', render: (a) => a.max_score },
    isStaff
      ? {
          key: 'submissions',
          header: 'Submissions',
          render: (a) => `${submissionCount(a.id)} received`,
        }
      : {
          key: 'status',
          header: 'My status',
          render: (a) => {
            const submission = mySubmission(a.id)
            return submission ? (
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
                {submission.score !== null ? ` · ${submission.score}/${a.max_score}` : ''}
              </Badge>
            ) : (
              <Badge>Not submitted</Badge>
            )
          },
        },
    ...(isStaff
      ? [
          {
            key: 'actions',
            header: '',
            className: 'text-right',
            render: (a: Assignment) => (
              <div className="flex justify-end gap-2" onClick={(event) => event.stopPropagation()}>
                <button
                  onClick={() => {
                    setSelected(a)
                    formDialog.open()
                  }}
                  className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    setToDelete(a)
                    deleteDialog.open()
                  }}
                  className="rounded-md p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ),
          },
        ]
      : []),
  ]

  async function handleSubmit(values: AssignmentFormValues) {
    try {
      if (selected) {
        await updateMutation.mutateAsync({ id: selected.id, payload: values })
        toast.success('Assignment updated')
      } else {
        await createMutation.mutateAsync(values)
        toast.success('Assignment created')
      }
      formDialog.close()
      setSelected(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save assignment')
    }
  }

  async function handleConfirmDelete() {
    if (!toDelete) return
    try {
      await deleteMutation.mutateAsync(toDelete.id)
      toast.success('Assignment deleted')
      deleteDialog.close()
      setToDelete(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete assignment')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {isStaff
              ? 'Create and track assignments across your courses.'
              : 'Your assignments and submission status.'}
          </p>
        </div>
        {isStaff && (
          <Button
            onClick={() => {
              setSelected(null)
              formDialog.open()
            }}
          >
            <Plus className="h-4 w-4" /> New assignment
          </Button>
        )}
      </div>

      <DataTableToolbar
        search={search}
        onSearchChange={(value) => {
          setSearch(value)
          setPage(1)
        }}
        searchPlaceholder="Search assignments..."
        filters={
          <Select
            value={courseFilter}
            onChange={(event) => {
              setCourseFilter(event.target.value)
              setPage(1)
            }}
            options={(courses?.data ?? []).map((course) => ({
              label: course.title,
              value: course.id,
            }))}
            placeholder="All courses"
            className="sm:w-56"
          />
        }
      />

      <DataTable
        data={data?.data ?? []}
        columns={columns}
        getRowId={(a) => a.id}
        isLoading={isLoading}
        emptyTitle="No assignments yet"
        onRowClick={(a) => navigate(ROUTE_PATHS.assignmentDetail(a.id))}
      />

      {data && data.count > 0 && (
        <PaginationControl
          page={page}
          pageCount={data.pageCount}
          onPageChange={setPage}
          totalItems={data.count}
          pageSize={10}
        />
      )}

      {isStaff && (
        <>
          <Modal
            isOpen={formDialog.isOpen}
            onClose={() => {
              formDialog.close()
              setSelected(null)
            }}
            title={selected ? 'Edit assignment' : 'New assignment'}
          >
            <AssignmentForm
              defaultValues={
                selected
                  ? { ...selected, description: selected.description ?? undefined }
                  : undefined
              }
              onSubmit={handleSubmit}
              isSubmitting={createMutation.isPending || updateMutation.isPending}
            />
          </Modal>

          <ConfirmDialog
            isOpen={deleteDialog.isOpen}
            onClose={deleteDialog.close}
            onConfirm={handleConfirmDelete}
            title="Delete assignment"
            description={`Are you sure you want to delete "${toDelete?.title}"?`}
            confirmLabel="Delete"
            isLoading={deleteMutation.isPending}
          />
        </>
      )}
    </div>
  )
}
