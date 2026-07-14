import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ChartTooltip } from './ChartTooltip'
import { CHART_COLORS } from './chartTheme'

interface DistributionChartProps {
  title: string
  data: { label: string; value: number }[]
  variant?: 'bar' | 'pie' | 'horizontal-bar'
  subtitle?: string
}

export function DistributionChart({
  title,
  data,
  variant = 'bar',
  subtitle,
}: DistributionChartProps) {
  const hasData = data.some((d) => d.value > 0)

  return (
    <div className="panel p-5">
      <div className="mb-4">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{title}</p>
        {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
      </div>

      {!hasData ? (
        <div className="flex h-60 items-center justify-center text-sm text-slate-400">
          No data yet
        </div>
      ) : (
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            {variant === 'pie' ? (
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="label"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {data.map((entry, index) => (
                    <Cell key={entry.label} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 12 }}
                />
              </PieChart>
            ) : variant === 'horizontal-bar' ? (
              <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 4, right: 16, left: 8, bottom: 0 }}
              >
                <CartesianGrid
                  horizontal={false}
                  strokeDasharray="3 3"
                  stroke="currentColor"
                  className="text-slate-100 dark:text-slate-800"
                />
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  width={120}
                  tick={{ fontSize: 11, fill: 'currentColor' }}
                  className="text-slate-500"
                />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(139, 92, 246, 0.08)' }} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={16}>
                  {data.map((entry, index) => (
                    <Cell key={entry.label} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            ) : (
              <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
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
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(139, 92, 246, 0.08)' }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={32}>
                  {data.map((entry, index) => (
                    <Cell key={entry.label} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
