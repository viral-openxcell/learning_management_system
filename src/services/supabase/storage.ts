import { supabase } from './client'

export async function uploadFile(bucket: string, path: string, file: File) {
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: true,
  })
  if (error) throw error

  const { data: publicUrl } = supabase.storage.from(bucket).getPublicUrl(data.path)
  return publicUrl.publicUrl
}

export async function removeFile(bucket: string, path: string) {
  const { error } = await supabase.storage.from(bucket).remove([path])
  if (error) throw error
}

export function buildStoragePath(prefix: string, file: File) {
  const ext = file.name.split('.').pop()
  return `${prefix}/${crypto.randomUUID()}.${ext}`
}
