import { useState } from 'react'
import { Clock, HelpCircle, Pencil, Plus, Trash2 } from 'lucide-react'
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
import { QUIZ_STATUS_LABELS } from '@/constants/moduleEnums'
import { toast } from '@/utils/toast'
import { QuizForm } from './components/QuizForm'
import type { QuizFormValues } from './quiz.schema'
import type { Database } from '@/types/supabase'

type Quiz = Database['public']['Tables']['quizzes']['Row']

const { useListQuery, useCreateMutation, useUpdateMutation, useDeleteMutation } =
  createEntityHooks('quizzes')

export function QuizzesPage() {
  const { role } = useAuth()
  const isStaff = role === 'super_admin' || role === 'admin' || role === 'instructor'

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [courseFilter, setCourseFilter] = useState('')
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null)
  const [quizToDelete, setQuizToDelete] = useState<Quiz | null>(null)
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
    filters: { course_id: courseFilter || undefined, status: isStaff ? undefined : 'published' },
    orderBy: { column: 'created_at', ascending: false },
  })
  const createQuiz = useCreateMutation()
  const updateQuiz = useUpdateMutation()
  const deleteQuiz = useDeleteMutation()

  const columns: DataTableColumn<Quiz>[] = [
    {
      key: 'title',
      header: 'Quiz',
      render: (quiz) => (
        <div className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-slate-400" />
          <span className="font-medium text-slate-900 dark:text-slate-100">{quiz.title}</span>
        </div>
      ),
    },
    {
      key: 'course',
      header: 'Course',
      render: (quiz) => courseTitleById.get(quiz.course_id) ?? '—',
    },
    { key: 'questions', header: 'Questions', render: (quiz) => quiz.questions_count },
    {
      key: 'duration',
      header: 'Duration',
      render: (quiz) => (
        <span className="flex items-center gap-1 text-slate-500">
          <Clock className="h-3.5 w-3.5" /> {quiz.duration_minutes} min
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (quiz) => (
        <Badge variant={quiz.status === 'published' ? 'success' : 'default'}>
          {QUIZ_STATUS_LABELS[quiz.status]}
        </Badge>
      ),
    },
    ...(isStaff
      ? [
          {
            key: 'actions',
            header: '',
            className: 'text-right',
            render: (quiz: Quiz) => (
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setSelectedQuiz(quiz)
                    formDialog.open()
                  }}
                  className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    setQuizToDelete(quiz)
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

  async function handleSubmit(values: QuizFormValues) {
    try {
      if (selectedQuiz) {
        await updateQuiz.mutateAsync({ id: selectedQuiz.id, payload: values })
        toast.success('Quiz updated')
      } else {
        await createQuiz.mutateAsync(values)
        toast.success('Quiz created')
      }
      formDialog.close()
      setSelectedQuiz(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save quiz')
    }
  }

  async function handleConfirmDelete() {
    if (!quizToDelete) return
    try {
      await deleteQuiz.mutateAsync(quizToDelete.id)
      toast.success('Quiz deleted')
      deleteDialog.close()
      setQuizToDelete(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete quiz')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {isStaff
              ? 'Create and manage quizzes for your courses.'
              : 'Quizzes available across your enrolled courses.'}
          </p>
        </div>
        {isStaff && (
          <Button
            onClick={() => {
              setSelectedQuiz(null)
              formDialog.open()
            }}
          >
            <Plus className="h-4 w-4" /> New quiz
          </Button>
        )}
      </div>

      <DataTableToolbar
        search={search}
        onSearchChange={(value) => {
          setSearch(value)
          setPage(1)
        }}
        searchPlaceholder="Search quizzes..."
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
        getRowId={(quiz) => quiz.id}
        isLoading={isLoading}
        emptyTitle="No quizzes yet"
        emptyDescription={
          isStaff
            ? 'Create your first quiz to assess student learning.'
            : 'Check back soon for new quizzes.'
        }
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
              setSelectedQuiz(null)
            }}
            title={selectedQuiz ? 'Edit quiz' : 'New quiz'}
          >
            <QuizForm
              defaultValues={
                selectedQuiz
                  ? { ...selectedQuiz, description: selectedQuiz.description ?? undefined }
                  : undefined
              }
              onSubmit={handleSubmit}
              isSubmitting={createQuiz.isPending || updateQuiz.isPending}
            />
          </Modal>

          <ConfirmDialog
            isOpen={deleteDialog.isOpen}
            onClose={deleteDialog.close}
            onConfirm={handleConfirmDelete}
            title="Delete quiz"
            description={`Are you sure you want to delete "${quizToDelete?.title}"?`}
            confirmLabel="Delete"
            isLoading={deleteQuiz.isPending}
          />
        </>
      )}
    </div>
  )
}
