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
import { createEntityHooks } from '@/hooks/createEntityHooks'
import { useCoursesQuery } from '@/hooks/useCourses'
import { useDebounce } from '@/hooks/useDebounce'
import { useDisclosure } from '@/hooks/useDisclosure'
import { LESSON_TYPE_LABELS } from '@/constants/moduleEnums'
import { toast } from '@/utils/toast'
import { LessonForm } from './components/LessonForm'
import type { LessonFormValues } from './lesson.schema'
import type { Database } from '@/types/supabase'

type Lesson = Database['public']['Tables']['lessons']['Row']

const { useListQuery, useCreateMutation, useUpdateMutation, useDeleteMutation } =
  createEntityHooks('lessons')

export function CurriculumLessonsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [courseFilter, setCourseFilter] = useState('')
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [lessonToDelete, setLessonToDelete] = useState<Lesson | null>(null)
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
    orderBy: { column: 'order_index', ascending: true },
  })
  const createLesson = useCreateMutation()
  const updateLesson = useUpdateMutation()
  const deleteLesson = useDeleteMutation()

  const columns: DataTableColumn<Lesson>[] = [
    {
      key: 'title',
      header: 'Title',
      render: (lesson) => (
        <span className="font-medium text-slate-900 dark:text-slate-100">{lesson.title}</span>
      ),
    },
    {
      key: 'course',
      header: 'Course',
      render: (lesson) => courseTitleById.get(lesson.course_id) ?? '—',
    },
    {
      key: 'type',
      header: 'Type',
      render: (lesson) => <Badge variant="info">{LESSON_TYPE_LABELS[lesson.type]}</Badge>,
    },
    { key: 'duration', header: 'Duration', render: (lesson) => `${lesson.duration_minutes} min` },
    { key: 'order', header: 'Order', render: (lesson) => lesson.order_index },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (lesson) => (
        <div className="flex justify-end gap-2">
          <button
            onClick={() => {
              setSelectedLesson(lesson)
              formDialog.open()
            }}
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setLessonToDelete(lesson)
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

  async function handleSubmit(values: LessonFormValues) {
    try {
      if (selectedLesson) {
        await updateLesson.mutateAsync({ id: selectedLesson.id, payload: values })
        toast.success('Lesson updated')
      } else {
        await createLesson.mutateAsync(values)
        toast.success('Lesson created')
      }
      formDialog.close()
      setSelectedLesson(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save lesson')
    }
  }

  async function handleConfirmDelete() {
    if (!lessonToDelete) return
    try {
      await deleteLesson.mutateAsync(lessonToDelete.id)
      toast.success('Lesson deleted')
      deleteDialog.close()
      setLessonToDelete(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete lesson')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Organize the lessons that make up each course.
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedLesson(null)
            formDialog.open()
          }}
        >
          <Plus className="h-4 w-4" /> New lesson
        </Button>
      </div>

      <DataTableToolbar
        search={search}
        onSearchChange={(value) => {
          setSearch(value)
          setPage(1)
        }}
        searchPlaceholder="Search lessons..."
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
        getRowId={(lesson) => lesson.id}
        isLoading={isLoading}
        emptyTitle="No lessons yet"
        emptyDescription="Add your first lesson to start building the curriculum."
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
          setSelectedLesson(null)
        }}
        title={selectedLesson ? 'Edit lesson' : 'New lesson'}
      >
        <LessonForm
          defaultValues={
            selectedLesson
              ? { ...selectedLesson, description: selectedLesson.description ?? undefined }
              : undefined
          }
          onSubmit={handleSubmit}
          isSubmitting={createLesson.isPending || updateLesson.isPending}
        />
      </Modal>

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        onConfirm={handleConfirmDelete}
        title="Delete lesson"
        description={`Are you sure you want to delete "${lessonToDelete?.title}"?`}
        confirmLabel="Delete"
        isLoading={deleteLesson.isPending}
      />
    </div>
  )
}
