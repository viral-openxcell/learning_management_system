import { createRepository, type ListParams } from './base.repository'
import { buildStoragePath, removeFile, uploadFile } from '@/services/supabase/storage'
import { mockUploadFile } from '@/mocks/mockStorage'
import { USE_MOCK_DATA } from '@/lib/mockConfig'
import type { CourseLevel, CourseStatus } from '@/constants/courseLevels'

const THUMBNAIL_BUCKET = 'course-thumbnails'

const coursesRepository = createRepository('courses')

export interface CourseListFilters {
  category_id?: string
  level?: CourseLevel
  status?: CourseStatus
  instructor_id?: string
}

export const coursesService = {
  list(params: ListParams & { filters?: CourseListFilters } = {}) {
    return coursesRepository.list({
      ...params,
      searchColumns: params.search ? ['title', 'description'] : undefined,
      orderBy: params.orderBy ?? { column: 'created_at', ascending: false },
    })
  },
  getById: coursesRepository.getById,
  create: coursesRepository.create,
  update: coursesRepository.update,
  remove: coursesRepository.remove,

  async uploadThumbnail(file: File) {
    if (USE_MOCK_DATA) return mockUploadFile(file)
    const path = buildStoragePath('thumbnails', file)
    return uploadFile(THUMBNAIL_BUCKET, path, file)
  },

  async removeThumbnail(path: string) {
    if (USE_MOCK_DATA) return
    return removeFile(THUMBNAIL_BUCKET, path)
  },
}
