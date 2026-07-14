export const CHART_COLORS = [
  '#ec4899',
  '#3b82f6',
  '#f59e0b',
  '#10b981',
  '#f472b6',
  '#60a5fa',
  '#fbbf24',
  '#38bdf8',
]

export const BRAND_TONE = {
  brand: { stroke: '#db2777', fillFrom: '#ec4899', fillTo: '#ec4899' },
  accent: { stroke: '#d97706', fillFrom: '#f59e0b', fillTo: '#f59e0b' },
} as const

export type ChartTone = keyof typeof BRAND_TONE
