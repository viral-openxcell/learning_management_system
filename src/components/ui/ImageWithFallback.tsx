import { useState } from 'react'
import type { ReactNode } from 'react'

interface ImageWithFallbackProps {
  src?: string | null
  alt: string
  className?: string
  fallback: ReactNode
}

export function ImageWithFallback({ src, alt, className, fallback }: ImageWithFallbackProps) {
  const [failed, setFailed] = useState(false)
  const [lastSrc, setLastSrc] = useState(src)

  if (src !== lastSrc) {
    setLastSrc(src)
    setFailed(false)
  }

  if (!src || failed) {
    return <>{fallback}</>
  }

  return <img src={src} alt={alt} onError={() => setFailed(true)} className={className} />
}
