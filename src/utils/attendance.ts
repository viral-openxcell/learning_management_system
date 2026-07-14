const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function computeWeekdayAttendance(records: { session_date: string; status: string }[]) {
  const presentCounts = new Map<number, number>()
  for (const record of records) {
    if (record.status !== 'present') continue
    const day = new Date(record.session_date).getDay()
    presentCounts.set(day, (presentCounts.get(day) ?? 0) + 1)
  }
  return WEEKDAY_LABELS.map((label, index) => ({ label, value: presentCounts.get(index) ?? 0 }))
}
