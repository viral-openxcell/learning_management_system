import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface PaginationControlProps {
  page: number
  pageCount: number
  onPageChange: (page: number) => void
  totalItems?: number
  pageSize?: number
}

export function PaginationControl({
  page,
  pageCount,
  onPageChange,
  totalItems,
  pageSize,
}: PaginationControlProps) {
  const canPrev = page > 1
  const canNext = page < pageCount

  return (
    <div className="flex items-center justify-between gap-4 px-2 py-3">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {totalItems !== undefined && pageSize !== undefined
          ? `Showing ${Math.min((page - 1) * pageSize + 1, totalItems)}-${Math.min(page * pageSize, totalItems)} of ${totalItems}`
          : `Page ${page} of ${Math.max(pageCount, 1)}`}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={!canPrev}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
          Prev
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={!canNext}
          onClick={() => onPageChange(page + 1)}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
