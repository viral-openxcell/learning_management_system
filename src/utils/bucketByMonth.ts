const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

export function bucketByMonth<T>(
  rows: T[],
  getDate: (row: T) => string | null | undefined,
): { label: string; value: number }[] {
  const counts = new Map<string, number>()

  for (const row of rows) {
    const raw = getDate(row)
    if (!raw) continue
    const date = new Date(raw)
    if (Number.isNaN(date.getTime())) continue
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }

  return [...counts.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([key, value]) => {
      const [, month] = key.split('-')
      return { label: MONTH_LABELS[Number(month) - 1] ?? key, value }
    })
}

export function bucketSumByMonth<T>(
  rows: T[],
  getDate: (row: T) => string | null | undefined,
  getValue: (row: T) => number,
): { label: string; value: number }[] {
  const sums = new Map<string, number>()

  for (const row of rows) {
    const raw = getDate(row)
    if (!raw) continue
    const date = new Date(raw)
    if (Number.isNaN(date.getTime())) continue
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    sums.set(key, (sums.get(key) ?? 0) + getValue(row))
  }

  return [...sums.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([key, value]) => {
      const [, month] = key.split('-')
      return { label: MONTH_LABELS[Number(month) - 1] ?? key, value: Math.round(value) }
    })
}

function monthKeyOf(date: string) {
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

// Compares the last two *complete* calendar months so an in-progress current
// month (naturally low so far) doesn't read as a misleading sudden drop.
export function monthOverMonthTrend<T>(
  rows: T[],
  getDate: (row: T) => string | null | undefined,
  now = Date.now(),
) {
  const currentMonthKey = monthKeyOf(new Date(now).toISOString())
  const counts = new Map<string, number>()
  for (const row of rows) {
    const raw = getDate(row)
    if (!raw) continue
    const key = monthKeyOf(raw)
    if (key === currentMonthKey) continue
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  const [previousKey, latestKey] = [...counts.keys()].sort().slice(-2)
  if (!previousKey || !latestKey) return undefined
  const previous = counts.get(previousKey) ?? 0
  const latest = counts.get(latestKey) ?? 0
  if (previous === 0) return undefined
  return Math.round(((latest - previous) / previous) * 100)
}
