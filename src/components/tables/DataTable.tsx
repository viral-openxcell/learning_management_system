import type { ReactNode } from 'react'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { cn } from '@/utils/cn'

export interface DataTableColumn<T> {
  key: string
  header: string
  render: (row: T) => ReactNode
  className?: string
}

interface DataTableProps<T> {
  data: T[]
  columns: DataTableColumn<T>[]
  getRowId: (row: T) => string
  isLoading?: boolean
  emptyTitle?: string
  emptyDescription?: string
  onRowClick?: (row: T) => void
}

export function DataTable<T>({
  data,
  columns,
  getRowId,
  isLoading,
  emptyTitle = 'No records found',
  emptyDescription = 'Try adjusting your search or filters.',
  onRowClick,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="p-4">
        <LoadingSkeleton rows={6} />
      </div>
    )
  }

  if (data.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />
  }

  return (
    <div className="panel overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-max text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="whitespace-nowrap px-4 py-3 font-medium text-slate-500 dark:text-slate-400"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {data.map((row) => (
              <tr
                key={getRowId(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  'hover:bg-slate-50 dark:hover:bg-slate-800/60',
                  onRowClick && 'cursor-pointer',
                )}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn('px-4 py-3 text-slate-700 dark:text-slate-300', column.className)}
                  >
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
