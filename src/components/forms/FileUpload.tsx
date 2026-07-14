import { useRef, useState, type DragEvent } from 'react'
import { UploadCloud, X } from 'lucide-react'
import { cn } from '@/utils/cn'

interface FileUploadProps {
  onFileSelect: (file: File | null) => void
  accept?: string
  fileName?: string | null
  isUploading?: boolean
  className?: string
}

export function FileUpload({
  onFileSelect,
  accept,
  fileName,
  isUploading,
  className,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDragging(false)
    const file = event.dataTransfer.files[0]
    if (file) onFileSelect(file)
  }

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={cn(
        'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition-colors',
        isDragging
          ? 'border-brand-400 bg-brand-50 dark:bg-brand-900/20'
          : 'border-slate-200 dark:border-slate-700',
        className,
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(event) => onFileSelect(event.target.files?.[0] ?? null)}
      />
      <UploadCloud className="h-6 w-6 text-slate-400" />
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {isUploading ? 'Uploading...' : fileName ? fileName : 'Click or drag a file here'}
      </p>
      {fileName && !isUploading && (
        <button
          onClick={(event) => {
            event.stopPropagation()
            onFileSelect(null)
          }}
          className="flex items-center gap-1 text-xs text-red-500 hover:underline"
        >
          <X className="h-3 w-3" /> Remove
        </button>
      )}
    </div>
  )
}
