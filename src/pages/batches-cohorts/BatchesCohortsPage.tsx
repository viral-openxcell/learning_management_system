import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pencil, Plus, Trash2, Users } from 'lucide-react'
import { DataTable, type DataTableColumn } from '@/components/tables/DataTable'
import { DataTableToolbar } from '@/components/tables/DataTableToolbar'
import { PaginationControl } from '@/components/common/PaginationControl'
import { ConfirmDialog } from '@/components/modals/ConfirmDialog'
import { Modal } from '@/components/modals/Modal'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { BATCH_STATUS_LABELS } from '@/constants/moduleEnums'
import { createEntityHooks } from '@/hooks/createEntityHooks'
import { useCoursesQuery } from '@/hooks/useCourses'
import { useUsersQuery } from '@/hooks/useUsers'
import { useDebounce } from '@/hooks/useDebounce'
import { useDisclosure } from '@/hooks/useDisclosure'
import { formatDate } from '@/utils/formatDate'
import { toast } from '@/utils/toast'
import { BatchForm } from './components/BatchForm'
import type { BatchFormValues } from './batch.schema'
import { ROUTE_PATHS } from '@/routes/routePaths'
import type { Database } from '@/types/supabase'

type Batch = Database['public']['Tables']['batches']['Row']

const { useListQuery, useCreateMutation, useUpdateMutation, useDeleteMutation } =
  createEntityHooks('batches')

export function BatchesCohortsPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Batch | null>(null)
  const [toDelete, setToDelete] = useState<Batch | null>(null)
  const formDialog = useDisclosure()
  const deleteDialog = useDisclosure()

  const debouncedSearch = useDebounce(search)
  const { data: courses } = useCoursesQuery({ pageSize: 100 })
  const { data: instructors } = useUsersQuery({ pageSize: 100, filters: { role: 'instructor' } })
  const courseTitleById = new Map((courses?.data ?? []).map((c) => [c.id, c.title]))
  const instructorNameById = new Map(
    (instructors?.data ?? []).map((i) => [i.id, i.full_name ?? i.email]),
  )

  const { data, isLoading } = useListQuery({
    page,
    pageSize: 10,
    search: debouncedSearch,
    searchColumns: debouncedSearch ? ['name'] : undefined,
    orderBy: { column: 'start_date', ascending: false },
  })
  const createMutation = useCreateMutation()
  const updateMutation = useUpdateMutation()
  const deleteMutation = useDeleteMutation()

  const columns: DataTableColumn<Batch>[] = [
    {
      key: 'name',
      header: 'Batch',
      render: (b) => (
        <span className="font-medium text-slate-900 dark:text-slate-100">{b.name}</span>
      ),
    },
    { key: 'course', header: 'Course', render: (b) => courseTitleById.get(b.course_id) ?? '—' },
    {
      key: 'instructor',
      header: 'Instructor',
      render: (b) => instructorNameById.get(b.instructor_id) ?? '—',
    },
    {
      key: 'dates',
      header: 'Schedule',
      render: (b) => `${formatDate(b.start_date)} – ${formatDate(b.end_date)}`,
    },
    {
      key: 'status',
      header: 'Status',
      render: (b) => (
        <Badge
          variant={
            b.status === 'active' ? 'success' : b.status === 'completed' ? 'default' : 'warning'
          }
        >
          {BATCH_STATUS_LABELS[b.status]}
        </Badge>
      ),
    },
    {
      key: 'capacity',
      header: 'Capacity',
      render: (b) => (
        <span className="flex items-center gap-1 text-slate-500">
          <Users className="h-3.5 w-3.5" /> {b.capacity}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (b) => (
        <div className="flex justify-end gap-2" onClick={(event) => event.stopPropagation()}>
          <button
            onClick={() => {
              setSelected(b)
              formDialog.open()
            }}
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setToDelete(b)
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

  async function handleSubmit(values: BatchFormValues) {
    try {
      if (selected) {
        await updateMutation.mutateAsync({ id: selected.id, payload: values })
        toast.success('Batch updated')
      } else {
        await createMutation.mutateAsync(values)
        toast.success('Batch created')
      }
      formDialog.close()
      setSelected(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save batch')
    }
  }

  async function handleConfirmDelete() {
    if (!toDelete) return
    try {
      await deleteMutation.mutateAsync(toDelete.id)
      toast.success('Batch deleted')
      deleteDialog.close()
      setToDelete(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete batch')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Group students into scheduled cohorts per course.
          </p>
        </div>
        <Button
          onClick={() => {
            setSelected(null)
            formDialog.open()
          }}
        >
          <Plus className="h-4 w-4" /> New batch
        </Button>
      </div>

      <DataTableToolbar
        search={search}
        onSearchChange={(value) => {
          setSearch(value)
          setPage(1)
        }}
        searchPlaceholder="Search batches..."
      />

      <DataTable
        data={data?.data ?? []}
        columns={columns}
        getRowId={(b) => b.id}
        isLoading={isLoading}
        emptyTitle="No batches yet"
        onRowClick={(b) => navigate(ROUTE_PATHS.batchDetail(b.id))}
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

      <Modal
        isOpen={formDialog.isOpen}
        onClose={() => {
          formDialog.close()
          setSelected(null)
        }}
        title={selected ? 'Edit batch' : 'New batch'}
      >
        <BatchForm
          defaultValues={
            selected
              ? { ...selected, schedule_note: selected.schedule_note ?? undefined }
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
        title="Delete batch"
        description={`Are you sure you want to delete "${toDelete?.name}"?`}
        confirmLabel="Delete"
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
