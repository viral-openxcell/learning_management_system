import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import { ChartTooltip } from '@/components/charts/ChartTooltip'
import { cn } from '@/utils/cn'

interface MiniStatChartCardProps {
  label: string
  value: string | number
  sublabel?: string
  trend?: { value: number }
  data: { label: string; value: number }[]
  tone?: 'brand' | 'accent' | 'emerald' | 'blue'
}

const toneHex: Record<NonNullable<MiniStatChartCardProps['tone']>, string> = {
  brand: '#ec4899',
  accent: '#f59e0b',
  emerald: '#10b981',
  blue: '#3b82f6',
}

export function MiniStatChartCard({
  label,
  value,
  sublabel,
  trend,
  data,
  tone = 'brand',
}: MiniStatChartCardProps) {
  const highlightIndex = data.length - 1
  const color = toneHex[tone]

  return (
    <div className="flex items-center gap-3 p-4">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
          {trend && (
            <span
              className={cn(
                'flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
                trend.value >= 0
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                  : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
              )}
            >
              {trend.value >= 0 ? (
                <ArrowUpRight className="h-2.5 w-2.5" />
              ) : (
                <ArrowDownRight className="h-2.5 w-2.5" />
              )}
              {Math.abs(trend.value)}%
            </span>
          )}
        </div>
        <p className="font-display mt-0.5 text-xl font-semibold text-slate-900 dark:text-slate-100">
          {value}
        </p>
        <p className="mt-0.5 text-xs text-slate-400">{sublabel ?? 'Current Month'}</p>
      </div>

      {data.length > 0 && (
        <div className="h-12 w-16 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <XAxis dataKey="label" hide />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(148, 163, 184, 0.12)' }} />
              <Bar dataKey="value" name="Count" radius={[2, 2, 0, 0]} barSize={6}>
                {data.map((entry, index) => (
                  <Cell key={entry.label} fill={index === highlightIndex ? color : '#e2e8f0'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
