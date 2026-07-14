import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createRepository, type ListParams } from '@/services/api/base.repository'
import type { Database } from '@/types/supabase'

/**
 * Generates TanStack Query hooks (list/create/update/delete) for a table,
 * on top of the shared repository. Use this for modules that don't need
 * bespoke logic (file uploads, cross-table joins) beyond plain CRUD —
 * see courses.service.ts/useCourses.ts for an example that does.
 */
export function createEntityHooks<T extends keyof Database['public']['Tables']>(table: T) {
  type Insert = Database['public']['Tables'][T]['Insert']
  type Update = Database['public']['Tables'][T]['Update']

  const repository = createRepository(table)

  function useListQuery(params: ListParams = {}) {
    return useQuery({
      queryKey: [table, params],
      queryFn: () => repository.list(params),
    })
  }

  function useGetQuery(id: string | undefined) {
    return useQuery({
      queryKey: [table, id],
      queryFn: () => repository.getById(id as string),
      enabled: Boolean(id),
    })
  }

  function useCreateMutation() {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: (payload: Insert) => repository.create(payload),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: [table] }),
    })
  }

  function useUpdateMutation() {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: ({ id, payload }: { id: string; payload: Update }) =>
        repository.update(id, payload),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: [table] }),
    })
  }

  function useDeleteMutation() {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: (id: string) => repository.remove(id),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: [table] }),
    })
  }

  return {
    repository,
    useListQuery,
    useGetQuery,
    useCreateMutation,
    useUpdateMutation,
    useDeleteMutation,
  }
}

export type { ListParams }
