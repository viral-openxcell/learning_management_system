import { cn } from '@/utils/cn'

export interface Tab {
  key: string
  label: string
}

interface TabsProps {
  tabs: Tab[]
  active: string
  onChange: (key: string) => void
}

export function Tabs({ tabs, active, onChange }: TabsProps) {
  return (
    <div className="flex gap-1 overflow-x-auto border-b border-slate-200 dark:border-slate-800">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={cn(
            'shrink-0 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors',
            active === tab.key
              ? 'border-brand-500 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
