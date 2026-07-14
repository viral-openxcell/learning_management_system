import { buildStoragePath, uploadFile } from '@/services/supabase/storage'
import { mockUploadFile } from '@/mocks/mockStorage'
import { USE_MOCK_DATA } from '@/lib/mockConfig'

const AVATAR_BUCKET = 'avatars'

export const profileService = {
  async uploadAvatar(file: File) {
    if (USE_MOCK_DATA) return mockUploadFile(file)
    const path = buildStoragePath('avatars', file)
    return uploadFile(AVATAR_BUCKET, path, file)
  },
}
