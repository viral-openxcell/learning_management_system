import { cn } from '@/utils/cn'
import { ImageWithFallback } from './ImageWithFallback'

interface AvatarProps {
  src?: string | null
  name?: string | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = { sm: 'h-7 w-7 text-xs', md: 'h-9 w-9 text-sm', lg: 'h-12 w-12 text-base' }

function initials(name?: string | null) {
  if (!name) return '?'
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  return (
    <ImageWithFallback
      src={src}
      alt={name ?? 'Avatar'}
      className={cn('rounded-full object-cover', sizeClasses[size], className)}
      fallback={
        <div
          className={cn(
            'flex items-center justify-center rounded-full bg-brand-100 font-medium text-brand-700 dark:bg-brand-900/40 dark:text-brand-300',
            sizeClasses[size],
            className,
          )}
        >
          {initials(name)}
        </div>
      }
    />
  )
}
