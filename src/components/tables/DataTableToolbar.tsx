import type { ReactNode } from 'react'
import { SearchInput } from '@/components/common/SearchInput'

interface DataTableToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  filters?: ReactNode
  actions?: ReactNode
}

export function DataTableToolbar({
  search,
  onSearchChange,
  searchPlaceholder,
  filters,
  actions,
}: DataTableToolbarProps) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <SearchInput
          value={search}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
          className="sm:w-64"
        />
        {filters}
      </div>
      {actions}
    </div>
  )
}
