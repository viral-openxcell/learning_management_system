import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { DataTable, type DataTableColumn } from '@/components/tables/DataTable'
import { DataTableToolbar } from '@/components/tables/DataTableToolbar'
import { PaginationControl } from '@/components/common/PaginationControl'
import { ConfirmDialog } from '@/components/modals/ConfirmDialog'
import { Modal } from '@/components/modals/Modal'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import {
  useUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} from '@/hooks/useUsers'
import { useDebounce } from '@/hooks/useDebounce'
import { useDisclosure } from '@/hooks/useDisclosure'
import { ROLE_LABELS, ROLES, type Role } from '@/constants/roles'
import { formatDate } from '@/utils/formatDate'
import { toast } from '@/utils/toast'
import { UserForm, type UserFormValues } from './components/UserForm'
import { ROUTE_PATHS } from '@/routes/routePaths'
import type { UserRecord } from '@/types/user.types'

export function UserListPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null)
  const [userToDelete, setUserToDelete] = useState<UserRecord | null>(null)
  const createDialog = useDisclosure()
  const editDialog = useDisclosure()
  const deleteDialog = useDisclosure()

  const debouncedSearch = useDebounce(search)
  const { data, isLoading } = useUsersQuery({
    page,
    pageSize: 10,
    search: debouncedSearch,
    filters: { role: (roleFilter as Role) || undefined },
  })
  const createUser = useCreateUserMutation()
  const updateUser = useUpdateUserMutation()
  const deleteUser = useDeleteUserMutation()

  const columns: DataTableColumn<UserRecord>[] = [
    {
      key: 'name',
      header: 'User',
      render: (user) => (
        <div className="flex items-center gap-3">
          <Avatar src={user.avatar_url} name={user.full_name} size="sm" />
          <div>
            <p className="font-medium text-slate-900 dark:text-slate-100">
              {user.full_name ?? '—'}
            </p>
            <p className="text-xs text-slate-400">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (user) => <Badge variant="info">{ROLE_LABELS[user.role]}</Badge>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (user) => (
        <Badge variant={user.is_active ? 'success' : 'default'}>
          {user.is_active ? 'Active' : 'Suspended'}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      header: 'Joined',
      render: (user) => formatDate(user.created_at),
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (user) => (
        <div className="flex justify-end gap-2" onClick={(event) => event.stopPropagation()}>
          <button
            onClick={() => {
              setSelectedUser(user)
              editDialog.open()
            }}
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setUserToDelete(user)
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

  async function handleCreateUser(values: UserFormValues) {
    if (!values.email) {
      toast.error('Enter an email address')
      return
    }
    try {
      await createUser.mutateAsync({
        full_name: values.full_name,
        email: values.email,
        role: values.role,
        phone: values.phone,
        bio: values.bio,
        department: values.department,
        location: values.location,
        is_active: values.is_active,
      })
      toast.success('User created')
      createDialog.close()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create user')
    }
  }

  async function handleUpdateUser(values: UserFormValues) {
    if (!selectedUser) return
    try {
      await updateUser.mutateAsync({ id: selectedUser.id, payload: values })
      toast.success('User updated')
      editDialog.close()
      setSelectedUser(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update user')
    }
  }

  async function handleConfirmDelete() {
    if (!userToDelete) return
    try {
      await deleteUser.mutateAsync(userToDelete.id)
      toast.success('User removed')
      deleteDialog.close()
      setUserToDelete(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to remove user')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage platform users and their roles.
          </p>
        </div>
        <Button onClick={createDialog.open}>
          <Plus className="h-4 w-4" /> Add user
        </Button>
      </div>

      <DataTableToolbar
        search={search}
        onSearchChange={(value) => {
          setSearch(value)
          setPage(1)
        }}
        searchPlaceholder="Search users..."
        filters={
          <Select
            value={roleFilter}
            onChange={(event) => {
              setRoleFilter(event.target.value)
              setPage(1)
            }}
            options={ROLES.map((role) => ({ label: ROLE_LABELS[role], value: role }))}
            placeholder="All roles"
            className="sm:w-40"
          />
        }
      />

      <DataTable
        data={data?.data ?? []}
        columns={columns}
        getRowId={(user) => user.id}
        isLoading={isLoading}
        emptyTitle="No users found"
        onRowClick={(user) => navigate(ROUTE_PATHS.userDetail(user.id))}
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

      <Modal isOpen={createDialog.isOpen} onClose={createDialog.close} title="Add user">
        <UserForm
          mode="create"
          defaultValues={{
            full_name: '',
            email: '',
            role: 'student',
            phone: '',
            bio: '',
            department: '',
            location: '',
            is_active: true,
          }}
          onSubmit={handleCreateUser}
          isSubmitting={createUser.isPending}
        />
      </Modal>

      <Modal isOpen={editDialog.isOpen} onClose={editDialog.close} title="Edit user">
        {selectedUser && (
          <UserForm
            defaultValues={{
              full_name: selectedUser.full_name ?? '',
              role: selectedUser.role,
              phone: selectedUser.phone ?? '',
              bio: selectedUser.bio ?? '',
              department: selectedUser.department ?? '',
              location: selectedUser.location ?? '',
              is_active: selectedUser.is_active,
            }}
            onSubmit={handleUpdateUser}
            isSubmitting={updateUser.isPending}
          />
        )}
      </Modal>

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        onConfirm={handleConfirmDelete}
        title="Remove user"
        description={`Are you sure you want to remove "${userToDelete?.full_name ?? userToDelete?.email}"?`}
        confirmLabel="Remove"
        isLoading={deleteUser.isPending}
      />
    </div>
  )
}
