interface ChartTooltipProps {
  active?: boolean
  label?: string
  payload?: { name?: string; value?: number | string; color?: string }[]
}

export function ChartTooltip({ active, label, payload }: ChartTooltipProps) {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 text-xs shadow-lg">
      {label && <p className="mb-1 font-medium text-slate-700 dark:text-slate-200">{label}</p>}
      <div className="space-y-0.5">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-slate-500 dark:text-slate-400">{entry.name ?? 'Value'}:</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
