import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ExternalLink, Pencil, Plus, Trash2, Video } from 'lucide-react'
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
import { LIVE_CLASS_STATUS_LABELS } from '@/constants/moduleEnums'
import { formatDateTime } from '@/utils/formatDate'
import { toast } from '@/utils/toast'
import { LiveClassForm } from './components/LiveClassForm'
import type { LiveClassFormValues } from './liveClass.schema'
import { ROUTE_PATHS } from '@/routes/routePaths'
import type { Database } from '@/types/supabase'

type LiveClass = Database['public']['Tables']['live_classes']['Row']

const { useListQuery, useCreateMutation, useUpdateMutation, useDeleteMutation } =
  createEntityHooks('live_classes')

const STATUS_BADGE = {
  upcoming: 'info',
  live: 'success',
  ended: 'default',
  cancelled: 'danger',
} as const

export function LiveClassesPage() {
  const navigate = useNavigate()
  const { role } = useAuth()
  const isStaff = role === 'super_admin' || role === 'admin' || role === 'instructor'

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [courseFilter, setCourseFilter] = useState('')
  const [selected, setSelected] = useState<LiveClass | null>(null)
  const [toDelete, setToDelete] = useState<LiveClass | null>(null)
  const formDialog = useDisclosure()
  const deleteDialog = useDisclosure()

  const debouncedSearch = useDebounce(search)
  const { data: courses } = useCoursesQuery({ pageSize: 100 })
  const courseTitleById = new Map((courses?.data ?? []).map((c) => [c.id, c.title]))

  const { data, isLoading } = useListQuery({
    page,
    pageSize: 10,
    search: debouncedSearch,
    searchColumns: debouncedSearch ? ['title'] : undefined,
    filters: { course_id: courseFilter || undefined },
    orderBy: { column: 'scheduled_at', ascending: true },
  })
  const createMutation = useCreateMutation()
  const updateMutation = useUpdateMutation()
  const deleteMutation = useDeleteMutation()

  const columns: DataTableColumn<LiveClass>[] = [
    {
      key: 'title',
      header: 'Session',
      render: (lc) => (
        <div className="flex items-center gap-2">
          <Video className="h-4 w-4 text-slate-400" />
          <span className="font-medium text-slate-900 dark:text-slate-100">{lc.title}</span>
        </div>
      ),
    },
    { key: 'course', header: 'Course', render: (lc) => courseTitleById.get(lc.course_id) ?? '—' },
    { key: 'scheduled_at', header: 'When', render: (lc) => formatDateTime(lc.scheduled_at) },
    { key: 'duration', header: 'Duration', render: (lc) => `${lc.duration_minutes} min` },
    {
      key: 'status',
      header: 'Status',
      render: (lc) => (
        <Badge variant={STATUS_BADGE[lc.status]}>{LIVE_CLASS_STATUS_LABELS[lc.status]}</Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (lc) => (
        <div className="flex justify-end gap-2" onClick={(event) => event.stopPropagation()}>
          {lc.meeting_url && (
            <a
              href={lc.meeting_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-brand-600 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-950/30"
            >
              Join <ExternalLink className="h-3 w-3" />
            </a>
          )}
          {isStaff && (
            <>
              <button
                onClick={() => {
                  setSelected({ ...lc, scheduled_at: lc.scheduled_at.slice(0, 16) })
                  formDialog.open()
                }}
                className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  setToDelete(lc)
                  deleteDialog.open()
                }}
                className="rounded-md p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ]

  async function handleSubmit(values: LiveClassFormValues) {
    try {
      const payload = { ...values, meeting_url: values.meeting_url || null }
      if (selected) {
        await updateMutation.mutateAsync({ id: selected.id, payload })
        toast.success('Live class updated')
      } else {
        await createMutation.mutateAsync(payload)
        toast.success('Live class scheduled')
      }
      formDialog.close()
      setSelected(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save live class')
    }
  }

  async function handleConfirmDelete() {
    if (!toDelete) return
    try {
      await deleteMutation.mutateAsync(toDelete.id)
      toast.success('Live class deleted')
      deleteDialog.close()
      setToDelete(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete live class')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {isStaff
              ? 'Schedule and manage live sessions.'
              : 'Upcoming and past live sessions for your courses.'}
          </p>
        </div>
        {isStaff && (
          <Button
            onClick={() => {
              setSelected(null)
              formDialog.open()
            }}
          >
            <Plus className="h-4 w-4" /> Schedule session
          </Button>
        )}
      </div>

      <DataTableToolbar
        search={search}
        onSearchChange={(value) => {
          setSearch(value)
          setPage(1)
        }}
        searchPlaceholder="Search sessions..."
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
        getRowId={(lc) => lc.id}
        isLoading={isLoading}
        emptyTitle="No live classes scheduled"
        onRowClick={(lc) => navigate(ROUTE_PATHS.liveClassDetail(lc.id))}
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
            title={selected ? 'Edit session' : 'Schedule session'}
          >
            <LiveClassForm
              defaultValues={
                selected
                  ? {
                      ...selected,
                      meeting_url: selected.meeting_url ?? '',
                      description: selected.description ?? undefined,
                      recording_url: selected.recording_url ?? undefined,
                    }
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
            title="Delete live class"
            description={`Are you sure you want to delete "${toDelete?.title}"?`}
            confirmLabel="Delete"
            isLoading={deleteMutation.isPending}
          />
        </>
      )}
    </div>
  )
}
