import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/utils/cn'

const WEEKDAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTH_LABELS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

interface MiniCalendarProps {
  markedDates?: Set<string>
}

function dateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function MiniCalendar({ markedDates }: MiniCalendarProps) {
  const [today] = useState(() => new Date())
  const [viewedYear, setViewedYear] = useState(() => today.getFullYear())
  const [viewedMonth, setViewedMonth] = useState(() => today.getMonth())

  const firstWeekday = new Date(viewedYear, viewedMonth, 1).getDay()
  const daysInMonth = new Date(viewedYear, viewedMonth + 1, 0).getDate()
  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  function goToPreviousMonth() {
    if (viewedMonth === 0) {
      setViewedMonth(11)
      setViewedYear((y) => y - 1)
    } else {
      setViewedMonth((m) => m - 1)
    }
  }

  function goToNextMonth() {
    if (viewedMonth === 11) {
      setViewedMonth(0)
      setViewedYear((y) => y + 1)
    } else {
      setViewedMonth((m) => m + 1)
    }
  }

  return (
    <div className="panel p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          {MONTH_LABELS[viewedMonth]} {viewedYear}
        </p>
        <div className="flex flex-col gap-0.5">
          <button
            onClick={goToPreviousMonth}
            aria-label="Previous month"
            className="flex h-4 w-4 items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <ChevronUp className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={goToNextMonth}
            aria-label="Next month"
            className="flex h-4 w-4 items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-center text-xs">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label} className="pb-1 font-medium text-slate-400">
            {label}
          </span>
        ))}
        {cells.map((day, index) => {
          if (day === null) return <span key={`blank-${index}`} />
          const isToday =
            viewedYear === today.getFullYear() &&
            viewedMonth === today.getMonth() &&
            day === today.getDate()
          const isMarked = markedDates?.has(dateKey(viewedYear, viewedMonth, day))
          return (
            <div key={day} className="flex flex-col items-center gap-0.5 py-0.5">
              <span
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full',
                  isToday
                    ? 'bg-brand-500 font-semibold text-white'
                    : 'text-slate-700 dark:text-slate-300',
                )}
              >
                {day}
              </span>
              <span
                className={cn(
                  'h-1 w-1 rounded-full',
                  isMarked ? 'bg-accent-500' : 'bg-transparent',
                )}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
