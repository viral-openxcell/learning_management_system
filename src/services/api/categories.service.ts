import { createRepository } from './base.repository'

export const categoriesRepository = createRepository('course_categories')

export const categoriesService = {
  list: () => categoriesRepository.list({ pageSize: 100, orderBy: { column: 'name' } }),
  create: categoriesRepository.create,
  update: categoriesRepository.update,
  remove: categoriesRepository.remove,
}
