import { useState } from 'react'
import { Award, Download, Plus } from 'lucide-react'
import { DataTable, type DataTableColumn } from '@/components/tables/DataTable'
import { DataTableToolbar } from '@/components/tables/DataTableToolbar'
import { PaginationControl } from '@/components/common/PaginationControl'
import { Modal } from '@/components/modals/Modal'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { createEntityHooks } from '@/hooks/createEntityHooks'
import { useCoursesQuery } from '@/hooks/useCourses'
import { useDebounce } from '@/hooks/useDebounce'
import { useDisclosure } from '@/hooks/useDisclosure'
import { useAuth } from '@/hooks/useAuth'
import { formatDate } from '@/utils/formatDate'
import { toast } from '@/utils/toast'
import { CertificateForm, type CertificateFormValues } from './components/CertificateForm'
import type { Database } from '@/types/supabase'

type Certificate = Database['public']['Tables']['certificates']['Row']

const { useListQuery, useCreateMutation } = createEntityHooks('certificates')
const { useListQuery: useProfilesQuery } = createEntityHooks('profiles')

function downloadCertificate(
  studentName: string,
  courseTitle: string,
  code: string,
  issuedAt: string,
) {
  const content = `CERTIFICATE OF COMPLETION\n\nThis certifies that\n${studentName}\n\nhas successfully completed\n${courseTitle}\n\nIssued: ${formatDate(issuedAt)}\nCertificate ID: ${code}\n`
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${code}.txt`
  link.click()
  URL.revokeObjectURL(url)
}

export function CertificatesPage() {
  const { role, user } = useAuth()
  const isStaff = role === 'super_admin' || role === 'admin' || role === 'instructor'

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const issueDialog = useDisclosure()

  const debouncedSearch = useDebounce(search)
  const { data: courses } = useCoursesQuery({ pageSize: 100 })
  const { data: profiles } = useProfilesQuery({ pageSize: 500 })
  const courseTitleById = new Map((courses?.data ?? []).map((c) => [c.id, c.title]))
  const studentById = new Map((profiles?.data ?? []).map((p) => [p.id, p]))
  const studentNameById = new Map((profiles?.data ?? []).map((p) => [p.id, p.full_name ?? p.email]))

  const { data, isLoading } = useListQuery({
    page,
    pageSize: 10,
    filters: { student_id: isStaff ? undefined : user?.id },
    orderBy: { column: 'issued_at', ascending: false },
  })
  const createMutation = useCreateMutation()

  const filteredData = (data?.data ?? []).filter((cert) => {
    if (!debouncedSearch) return true
    const needle = debouncedSearch.toLowerCase()
    const haystack =
      `${studentNameById.get(cert.student_id) ?? ''} ${courseTitleById.get(cert.course_id) ?? ''}`.toLowerCase()
    return haystack.includes(needle)
  })

  const columns: DataTableColumn<Certificate>[] = [
    {
      key: 'course',
      header: 'Course',
      render: (cert) => (
        <div className="flex items-center gap-2">
          <Award className="h-4 w-4 text-amber-500" />
          <span className="font-medium text-slate-900 dark:text-slate-100">
            {courseTitleById.get(cert.course_id) ?? '—'}
          </span>
        </div>
      ),
    },
    ...(isStaff
      ? [
          {
            key: 'student',
            header: 'Student',
            render: (cert: Certificate) => {
              const student = studentById.get(cert.student_id)
              return (
                <div className="flex items-center gap-2">
                  <Avatar src={student?.avatar_url} name={student?.full_name} size="sm" />
                  <span>{student?.full_name ?? student?.email ?? '—'}</span>
                </div>
              )
            },
          },
        ]
      : []),
    {
      key: 'code',
      header: 'Certificate ID',
      render: (cert) => <code className="text-xs text-slate-500">{cert.certificate_code}</code>,
    },
    { key: 'issued_at', header: 'Issued', render: (cert) => formatDate(cert.issued_at) },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (cert) => (
        <button
          onClick={() =>
            downloadCertificate(
              studentNameById.get(cert.student_id) ?? 'Student',
              courseTitleById.get(cert.course_id) ?? 'Course',
              cert.certificate_code,
              cert.issued_at,
            )
          }
          className="flex items-center justify-end gap-1 rounded-md px-2 py-1 text-xs font-medium text-brand-600 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-950/30"
        >
          <Download className="h-3.5 w-3.5" /> Download
        </button>
      ),
    },
  ]

  async function handleIssue(values: CertificateFormValues) {
    try {
      const code = `CERT-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
      await createMutation.mutateAsync({ ...values, certificate_code: code })
      toast.success('Certificate issued')
      issueDialog.close()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to issue certificate')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {isStaff
              ? 'Issue and manage completion certificates.'
              : 'Certificates you have earned.'}
          </p>
        </div>
        {isStaff && (
          <Button onClick={issueDialog.open}>
            <Plus className="h-4 w-4" /> Issue certificate
          </Button>
        )}
      </div>

      <DataTableToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search certificates..."
      />

      <DataTable
        data={filteredData}
        columns={columns}
        getRowId={(cert) => cert.id}
        isLoading={isLoading}
        emptyTitle="No certificates yet"
        emptyDescription={
          isStaff
            ? 'Issue a certificate once a student completes a course.'
            : 'Complete a course to earn your first certificate.'
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
        <Modal isOpen={issueDialog.isOpen} onClose={issueDialog.close} title="Issue certificate">
          <CertificateForm onSubmit={handleIssue} isSubmitting={createMutation.isPending} />
        </Modal>
      )}
    </div>
  )
}
