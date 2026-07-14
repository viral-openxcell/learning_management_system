import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { coursesService, type CourseListFilters } from '@/services/api/courses.service'
import type { ListParams } from '@/services/api/base.repository'
import type { Database } from '@/types/supabase'

type CourseInsert = Database['public']['Tables']['courses']['Insert']
type CourseUpdate = Database['public']['Tables']['courses']['Update']

export function useCoursesQuery(params: ListParams & { filters?: CourseListFilters }) {
  return useQuery({
    queryKey: ['courses', params],
    queryFn: () => coursesService.list(params),
  })
}

export function useCourseQuery(id: string | undefined) {
  return useQuery({
    queryKey: ['courses', id],
    queryFn: () => coursesService.getById(id as string),
    enabled: Boolean(id),
  })
}

export function useCreateCourseMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CourseInsert) => coursesService.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['courses'] }),
  })
}

export function useUpdateCourseMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CourseUpdate }) =>
      coursesService.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['courses'] }),
  })
}

export function useDeleteCourseMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => coursesService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['courses'] }),
  })
}
