interface AttendanceHeatmapProps {
  data: { label: string; value: number }[]
}

export function AttendanceHeatmap({ data }: AttendanceHeatmapProps) {
  const max = Math.max(...data.map((d) => d.value), 1)
  const hasData = data.some((d) => d.value > 0)

  return (
    <div className="panel p-5">
      <p className="mb-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
        Attendance Activity
      </p>
      <p className="mb-4 text-xs text-slate-400">Present check-ins by day of week</p>

      {!hasData ? (
        <div className="flex h-28 items-center justify-center text-sm text-slate-400">
          No attendance recorded yet
        </div>
      ) : (
        <div className="flex items-end justify-between gap-2">
          {data.map((day) => {
            const intensity = 0.15 + (day.value / max) * 0.85
            return (
              <div
                key={day.label}
                className="flex flex-1 flex-col items-center gap-2"
                title={`${day.label}: ${day.value} present`}
              >
                <div
                  className="flex h-16 w-full items-center justify-center rounded-lg text-xs font-semibold text-brand-700 dark:text-white"
                  style={{ backgroundColor: `rgba(236, 72, 153, ${intensity})` }}
                >
                  {day.value > 0 ? day.value : ''}
                </div>
                <span className="text-xs text-slate-400">{day.label}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
