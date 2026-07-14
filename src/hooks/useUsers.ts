import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  usersService,
  type UserListFilters,
  type CreateUserPayload,
} from '@/services/api/users.service'
import type { ListParams } from '@/services/api/base.repository'
import type { Database } from '@/types/supabase'

type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export function useUsersQuery(params: ListParams & { filters?: UserListFilters }) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => usersService.list(params),
  })
}

export function useCreateUserMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateUserPayload) => usersService.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  })
}

export function useUpdateUserMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ProfileUpdate }) =>
      usersService.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  })
}

export function useDeleteUserMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => usersService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  })
}
