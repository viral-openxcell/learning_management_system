import { useId, useState } from 'react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import { ChartTooltip } from './ChartTooltip'
import { BRAND_TONE, type ChartTone } from './chartTheme'
import { cn } from '@/utils/cn'

interface TrendAreaChartProps {
  title: string
  datasets: Record<string, { label: string; value: number }[]>
  tone?: ChartTone
  subtitle?: string
}

export function TrendAreaChart({ title, datasets, tone = 'brand', subtitle }: TrendAreaChartProps) {
  const gradientId = useId()
  const periods = Object.keys(datasets)
  const [period, setPeriod] = useState(periods[0] ?? '')
  const data = datasets[period] ?? []
  const colors = BRAND_TONE[tone]

  return (
    <div className="panel p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{title}</p>
          {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
        </div>
        {periods.length > 1 && (
          <div className="flex gap-0.5 rounded-full bg-slate-100 p-0.5 dark:bg-slate-800">
            {periods.map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                  'rounded-full px-2.5 py-1 text-xs font-medium capitalize transition-colors',
                  period === p
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                    : 'text-slate-500 dark:text-slate-400',
                )}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="h-60">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.fillFrom} stopOpacity={0.4} />
                <stop offset="95%" stopColor={colors.fillTo} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              stroke="currentColor"
              className="text-slate-100 dark:text-slate-800"
            />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: 'currentColor' }}
              className="text-slate-400"
            />
            <Tooltip
              content={<ChartTooltip />}
              cursor={{ stroke: colors.stroke, strokeDasharray: '4 4' }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={colors.stroke}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
