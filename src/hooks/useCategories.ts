import { useQuery } from '@tanstack/react-query'
import { categoriesService } from '@/services/api/categories.service'

export function useCategoriesQuery() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesService.list(),
  })
}
