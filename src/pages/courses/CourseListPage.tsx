import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ImageOff, Pencil, Plus, Trash2 } from 'lucide-react'
import { DataTable, type DataTableColumn } from '@/components/tables/DataTable'
import { DataTableToolbar } from '@/components/tables/DataTableToolbar'
import { PaginationControl } from '@/components/common/PaginationControl'
import { ConfirmDialog } from '@/components/modals/ConfirmDialog'
import { Badge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { ImageWithFallback } from '@/components/ui/ImageWithFallback'
import { useCoursesQuery, useDeleteCourseMutation } from '@/hooks/useCourses'
import { createEntityHooks } from '@/hooks/createEntityHooks'
import { useDebounce } from '@/hooks/useDebounce'
import { useDisclosure } from '@/hooks/useDisclosure'
import {
  COURSE_LEVEL_LABELS,
  COURSE_LEVELS,
  COURSE_STATUS_LABELS,
  COURSE_STATUSES,
} from '@/constants/courseLevels'
import { ROUTE_PATHS } from '@/routes/routePaths'
import { toast } from '@/utils/toast'
import { coursePlaceholderImage } from '@/utils/placeholderImage'
import type { Course } from '@/types/course.types'

const STATUS_BADGE_VARIANT = {
  draft: 'default',
  published: 'success',
  archived: 'warning',
} as const

const { useListQuery: useProfilesQuery } = createEntityHooks('profiles')

export function CourseListPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [level, setLevel] = useState('')
  const [status, setStatus] = useState('')
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null)
  const deleteDialog = useDisclosure()

  const debouncedSearch = useDebounce(search)
  const { data, isLoading } = useCoursesQuery({
    page,
    pageSize: 10,
    search: debouncedSearch,
    filters: {
      level: (level as Course['level']) || undefined,
      status: (status as Course['status']) || undefined,
    },
  })
  const { data: profiles } = useProfilesQuery({ pageSize: 500 })
  const instructorById = new Map((profiles?.data ?? []).map((p) => [p.id, p]))
  const deleteCourse = useDeleteCourseMutation()

  const columns: DataTableColumn<Course>[] = [
    {
      key: 'title',
      header: 'Course',
      render: (course) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md bg-slate-100 dark:bg-slate-800">
            <ImageWithFallback
              src={course.thumbnail_url ?? coursePlaceholderImage(course.id, 80, 56)}
              alt={course.title}
              className="h-full w-full object-cover"
              fallback={<ImageOff className="h-4 w-4 text-slate-300" />}
            />
          </div>
          <div>
            <p className="font-medium text-slate-900 dark:text-slate-100">{course.title}</p>
            <p className="text-xs text-slate-400">{course.slug}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'instructor',
      header: 'Instructor',
      render: (course) => {
        const instructor = instructorById.get(course.instructor_id)
        return (
          <div className="flex items-center gap-2">
            <Avatar src={instructor?.avatar_url} name={instructor?.full_name} size="sm" />
            <span className="text-sm text-slate-700 dark:text-slate-300">
              {instructor?.full_name ?? '—'}
            </span>
          </div>
        )
      },
    },
    {
      key: 'level',
      header: 'Level',
      render: (course) => COURSE_LEVEL_LABELS[course.level],
    },
    {
      key: 'status',
      header: 'Status',
      render: (course) => (
        <Badge variant={STATUS_BADGE_VARIANT[course.status]}>
          {COURSE_STATUS_LABELS[course.status]}
        </Badge>
      ),
    },
    {
      key: 'price',
      header: 'Price',
      render: (course) => `$${course.price.toFixed(2)}`,
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (course) => (
        <div className="flex justify-end gap-2" onClick={(event) => event.stopPropagation()}>
          <Link
            to={ROUTE_PATHS.courseEdit(course.id)}
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Pencil className="h-4 w-4" />
          </Link>
          <button
            onClick={() => {
              setCourseToDelete(course)
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

  async function handleConfirmDelete() {
    if (!courseToDelete) return
    try {
      await deleteCourse.mutateAsync(courseToDelete.id)
      toast.success('Course deleted')
      deleteDialog.close()
      setCourseToDelete(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete course')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage your course catalog.</p>
        </div>
        <Link to={ROUTE_PATHS.courseCreate}>
          <Button>
            <Plus className="h-4 w-4" /> New course
          </Button>
        </Link>
      </div>

      <DataTableToolbar
        search={search}
        onSearchChange={(value) => {
          setSearch(value)
          setPage(1)
        }}
        searchPlaceholder="Search courses..."
        filters={
          <>
            <Select
              value={level}
              onChange={(event) => {
                setLevel(event.target.value)
                setPage(1)
              }}
              options={COURSE_LEVELS.map((l) => ({ label: COURSE_LEVEL_LABELS[l], value: l }))}
              placeholder="All levels"
              className="sm:w-40"
            />
            <Select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value)
                setPage(1)
              }}
              options={COURSE_STATUSES.map((s) => ({ label: COURSE_STATUS_LABELS[s], value: s }))}
              placeholder="All statuses"
              className="sm:w-40"
            />
          </>
        }
      />

      <DataTable
        data={data?.data ?? []}
        columns={columns}
        getRowId={(course) => course.id}
        isLoading={isLoading}
        emptyTitle="No courses yet"
        emptyDescription="Create your first course to get started."
        onRowClick={(course) => navigate(ROUTE_PATHS.courseDetail(course.id))}
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

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        onConfirm={handleConfirmDelete}
        title="Delete course"
        description={`Are you sure you want to delete "${courseToDelete?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        isLoading={deleteCourse.isPending}
      />
    </div>
  )
}
