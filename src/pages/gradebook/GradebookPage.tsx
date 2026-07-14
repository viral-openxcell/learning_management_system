import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { DataTable, type DataTableColumn } from '@/components/tables/DataTable'
import { DataTableToolbar } from '@/components/tables/DataTableToolbar'
import { Modal } from '@/components/modals/Modal'
import { Badge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Select'
import { Avatar } from '@/components/ui/Avatar'
import { createEntityHooks } from '@/hooks/createEntityHooks'
import { useCoursesQuery } from '@/hooks/useCourses'
import { useDebounce } from '@/hooks/useDebounce'
import { useDisclosure } from '@/hooks/useDisclosure'
import { SUBMISSION_STATUS_LABELS } from '@/constants/moduleEnums'
import { formatDate } from '@/utils/formatDate'
import { toast } from '@/utils/toast'
import { GradeForm, type GradeFormValues } from './components/GradeForm'
import type { Database } from '@/types/supabase'

type Submission = Database['public']['Tables']['submissions']['Row']

const { useListQuery: useSubmissionsQuery, useUpdateMutation } = createEntityHooks('submissions')
const { useListQuery: useAssignmentsQuery } = createEntityHooks('assignments')
const { useListQuery: useProfilesQuery } = createEntityHooks('profiles')

export function GradebookPage() {
  const [search, setSearch] = useState('')
  const [courseFilter, setCourseFilter] = useState('')
  const [selected, setSelected] = useState<Submission | null>(null)
  const gradeDialog = useDisclosure()

  const debouncedSearch = useDebounce(search)
  const { data: courses } = useCoursesQuery({ pageSize: 100 })
  const { data: assignments } = useAssignmentsQuery({ pageSize: 500 })
  const { data: profiles } = useProfilesQuery({ pageSize: 500 })
  const { data: submissions, isLoading } = useSubmissionsQuery({ pageSize: 500 })
  const updateSubmission = useUpdateMutation()

  const courseTitleById = new Map((courses?.data ?? []).map((c) => [c.id, c.title]))
  const assignmentById = new Map((assignments?.data ?? []).map((a) => [a.id, a]))
  const studentById = new Map((profiles?.data ?? []).map((p) => [p.id, p]))

  const filtered = (submissions?.data ?? []).filter((submission) => {
    const assignment = assignmentById.get(submission.assignment_id)
    const student = studentById.get(submission.student_id)
    if (courseFilter && assignment?.course_id !== courseFilter) return false
    if (debouncedSearch) {
      const needle = debouncedSearch.toLowerCase()
      const haystack = `${assignment?.title ?? ''} ${student?.full_name ?? ''}`.toLowerCase()
      if (!haystack.includes(needle)) return false
    }
    return true
  })

  const columns: DataTableColumn<Submission>[] = [
    {
      key: 'student',
      header: 'Student',
      render: (s) => {
        const student = studentById.get(s.student_id)
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
    {
      key: 'assignment',
      header: 'Assignment',
      render: (s) => assignmentById.get(s.assignment_id)?.title ?? '—',
    },
    {
      key: 'course',
      header: 'Course',
      render: (s) =>
        courseTitleById.get(assignmentById.get(s.assignment_id)?.course_id ?? '') ?? '—',
    },
    {
      key: 'submitted_at',
      header: 'Submitted',
      render: (s) => (s.submitted_at ? formatDate(s.submitted_at) : '—'),
    },
    {
      key: 'status',
      header: 'Status',
      render: (s) => (
        <Badge
          variant={
            s.status === 'graded'
              ? 'success'
              : s.status === 'late'
                ? 'danger'
                : s.status === 'submitted'
                  ? 'info'
                  : 'default'
          }
        >
          {SUBMISSION_STATUS_LABELS[s.status]}
        </Badge>
      ),
    },
    {
      key: 'score',
      header: 'Score',
      render: (s) =>
        s.score !== null
          ? `${s.score}/${assignmentById.get(s.assignment_id)?.max_score ?? '—'}`
          : '—',
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (s) => (
        <button
          onClick={() => {
            setSelected(s)
            gradeDialog.open()
          }}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-brand-600 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-950/30"
        >
          <CheckCircle2 className="h-3.5 w-3.5" /> Grade
        </button>
      ),
    },
  ]

  async function handleGrade(values: GradeFormValues) {
    if (!selected) return
    try {
      await updateSubmission.mutateAsync({
        id: selected.id,
        payload: {
          score: values.score,
          feedback: values.feedback ?? null,
          status: 'graded',
          graded_at: new Date().toISOString(),
        },
      })
      toast.success('Grade saved')
      gradeDialog.close()
      setSelected(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save grade')
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Review and grade student submissions.
        </p>
      </div>

      <DataTableToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by student or assignment..."
        filters={
          <Select
            value={courseFilter}
            onChange={(event) => setCourseFilter(event.target.value)}
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
        data={filtered}
        columns={columns}
        getRowId={(s) => s.id}
        isLoading={isLoading}
        emptyTitle="No submissions found"
        emptyDescription="Submissions will appear here once students turn in their work."
      />

      <Modal
        isOpen={gradeDialog.isOpen}
        onClose={() => {
          gradeDialog.close()
          setSelected(null)
        }}
        title="Grade submission"
      >
        {selected && (
          <GradeForm
            maxScore={assignmentById.get(selected.assignment_id)?.max_score ?? 100}
            defaultValues={{ score: selected.score ?? 0, feedback: selected.feedback ?? '' }}
            onSubmit={handleGrade}
            isSubmitting={updateSubmission.isPending}
          />
        )}
      </Modal>
    </div>
  )
}
