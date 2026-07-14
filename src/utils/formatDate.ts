export function formatDate(value: string | Date, options?: Intl.DateTimeFormatOptions) {
  const date = typeof value === 'string' ? new Date(value) : value
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  }).format(date)
}

export function formatDateTime(value: string | Date) {
  return formatDate(value, { hour: 'numeric', minute: '2-digit' })
}

export function formatRelative(value: string | Date) {
  const date = typeof value === 'string' ? new Date(value) : value
  const diffMs = date.getTime() - Date.now()
  const diffMinutes = Math.round(diffMs / 60_000)

  const divisions: [Intl.RelativeTimeFormatUnit, number][] = [
    ['minute', 60],
    ['hour', 24],
    ['day', 30],
    ['month', 12],
    ['year', Number.POSITIVE_INFINITY],
  ]

  const rtf = new Intl.RelativeTimeFormat('en-US', { numeric: 'auto' })
  let duration = diffMinutes
  for (const [unit, amount] of divisions) {
    if (Math.abs(duration) < amount) return rtf.format(Math.round(duration), unit)
    duration /= amount
  }
  return rtf.format(Math.round(duration), 'year')
}
