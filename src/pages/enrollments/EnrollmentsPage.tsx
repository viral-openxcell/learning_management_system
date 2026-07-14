import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { DataTable, type DataTableColumn } from '@/components/tables/DataTable'
import { DataTableToolbar } from '@/components/tables/DataTableToolbar'
import { PaginationControl } from '@/components/common/PaginationControl'
import { ConfirmDialog } from '@/components/modals/ConfirmDialog'
import { Modal } from '@/components/modals/Modal'
import { Badge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { createEntityHooks } from '@/hooks/createEntityHooks'
import { useCoursesQuery } from '@/hooks/useCourses'
import { useDebounce } from '@/hooks/useDebounce'
import { useDisclosure } from '@/hooks/useDisclosure'
import { ENROLLMENT_STATUS_LABELS, ENROLLMENT_STATUSES } from '@/constants/moduleEnums'
import { formatDate } from '@/utils/formatDate'
import { toast } from '@/utils/toast'
import { EnrollmentForm, type EnrollmentFormValues } from './components/EnrollmentForm'
import type { Database } from '@/types/supabase'

type Enrollment = Database['public']['Tables']['enrollments']['Row']

const { useListQuery, useCreateMutation, useUpdateMutation, useDeleteMutation } =
  createEntityHooks('enrollments')
const { useListQuery: useProfilesQuery } = createEntityHooks('profiles')

const STATUS_BADGE = {
  pending: 'warning',
  active: 'info',
  completed: 'success',
  cancelled: 'danger',
} as const

export function EnrollmentsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [courseFilter, setCourseFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selected, setSelected] = useState<Enrollment | null>(null)
  const [toDelete, setToDelete] = useState<Enrollment | null>(null)
  const formDialog = useDisclosure()
  const deleteDialog = useDisclosure()

  const debouncedSearch = useDebounce(search)
  const { data: courses } = useCoursesQuery({ pageSize: 100 })
  const { data: profiles } = useProfilesQuery({ pageSize: 500 })
  const courseTitleById = new Map((courses?.data ?? []).map((c) => [c.id, c.title]))
  const studentById = new Map((profiles?.data ?? []).map((p) => [p.id, p]))

  const { data, isLoading } = useListQuery({
    page,
    pageSize: 10,
    filters: { course_id: courseFilter || undefined, status: statusFilter || undefined },
    orderBy: { column: 'enrolled_at', ascending: false },
  })
  const createMutation = useCreateMutation()
  const updateMutation = useUpdateMutation()
  const deleteMutation = useDeleteMutation()

  const filteredData = (data?.data ?? []).filter((enrollment) => {
    if (!debouncedSearch) return true
    const needle = debouncedSearch.toLowerCase()
    const student = studentById.get(enrollment.student_id)
    const haystack =
      `${student?.full_name ?? ''} ${student?.email ?? ''} ${courseTitleById.get(enrollment.course_id) ?? ''}`.toLowerCase()
    return haystack.includes(needle)
  })

  const columns: DataTableColumn<Enrollment>[] = [
    {
      key: 'student',
      header: 'Student',
      render: (e) => {
        const student = studentById.get(e.student_id)
        return (
          <div className="flex items-center gap-2">
            <Avatar src={student?.avatar_url} name={student?.full_name} size="sm" />
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {student?.full_name ?? '—'}
            </span>
          </div>
        )
      },
    },
    { key: 'course', header: 'Course', render: (e) => courseTitleById.get(e.course_id) ?? '—' },
    {
      key: 'status',
      header: 'Status',
      render: (e) => (
        <Badge variant={STATUS_BADGE[e.status]}>{ENROLLMENT_STATUS_LABELS[e.status]}</Badge>
      ),
    },
    { key: 'enrolled_at', header: 'Enrolled', render: (e) => formatDate(e.enrolled_at) },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (e) => (
        <div className="flex justify-end gap-2">
          <button
            onClick={() => {
              setSelected(e)
              formDialog.open()
            }}
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setToDelete(e)
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

  async function handleSubmit(values: EnrollmentFormValues) {
    try {
      if (selected) {
        await updateMutation.mutateAsync({ id: selected.id, payload: { status: values.status } })
        toast.success('Enrollment updated')
      } else {
        await createMutation.mutateAsync(values)
        toast.success('Student enrolled')
      }
      formDialog.close()
      setSelected(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save enrollment')
    }
  }

  async function handleConfirmDelete() {
    if (!toDelete) return
    try {
      await deleteMutation.mutateAsync(toDelete.id)
      toast.success('Enrollment removed')
      deleteDialog.close()
      setToDelete(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to remove enrollment')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage which students are enrolled in which courses.
          </p>
        </div>
        <Button
          onClick={() => {
            setSelected(null)
            formDialog.open()
          }}
        >
          <Plus className="h-4 w-4" /> Enroll student
        </Button>
      </div>

      <DataTableToolbar
        search={search}
        onSearchChange={(value) => {
          setSearch(value)
          setPage(1)
        }}
        searchPlaceholder="Search by student or course..."
        filters={
          <>
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
              className="sm:w-48"
            />
            <Select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value)
                setPage(1)
              }}
              options={ENROLLMENT_STATUSES.map((status) => ({
                label: ENROLLMENT_STATUS_LABELS[status],
                value: status,
              }))}
              placeholder="All statuses"
              className="sm:w-40"
            />
          </>
        }
      />

      <DataTable
        data={filteredData}
        columns={columns}
        getRowId={(e) => e.id}
        isLoading={isLoading}
        emptyTitle="No enrollments yet"
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
        title={selected ? 'Update enrollment' : 'Enroll student'}
      >
        <EnrollmentForm
          defaultValues={selected ?? undefined}
          lockStudentAndCourse={Boolean(selected)}
          onSubmit={handleSubmit}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
        />
      </Modal>

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        onConfirm={handleConfirmDelete}
        title="Remove enrollment"
        description="Are you sure you want to remove this enrollment?"
        confirmLabel="Remove"
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
