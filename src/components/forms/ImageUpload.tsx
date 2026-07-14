import { useEffect, useState } from 'react'
import { ImageOff } from 'lucide-react'
import { ImageWithFallback } from '@/components/ui/ImageWithFallback'
import { FileUpload } from './FileUpload'

interface ImageUploadProps {
  value?: string | null
  onFileSelect: (file: File | null) => void
  isUploading?: boolean
}

export function ImageUpload({ value, onFileSelect, isUploading }: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  function handleFileSelect(file: File | null) {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(file ? URL.createObjectURL(file) : null)
    onFileSelect(file)
  }

  const displayUrl = previewUrl ?? value

  return (
    <div className="flex items-start gap-4">
      <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
        <ImageWithFallback
          src={displayUrl}
          alt="Preview"
          className="h-full w-full object-cover"
          fallback={<ImageOff className="h-6 w-6 text-slate-300" />}
        />
      </div>
      <FileUpload
        onFileSelect={handleFileSelect}
        accept="image/*"
        fileName={previewUrl ? 'New image selected' : null}
        isUploading={isUploading}
        className="flex-1"
      />
    </div>
  )
}
