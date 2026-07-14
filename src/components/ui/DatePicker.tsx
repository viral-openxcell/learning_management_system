import { forwardRef, type InputHTMLAttributes } from 'react'
import { Calendar } from 'lucide-react'
import { cn } from '@/utils/cn'

type DatePickerProps = InputHTMLAttributes<HTMLInputElement>

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  ({ className, ...props }, ref) => {
    return (
      <div className="relative">
        <input
          ref={ref}
          type="date"
          className={cn(
            'h-10 w-full rounded-xl border border-slate-200 bg-white px-3 pr-9 text-sm text-slate-900',
            'focus:outline-none focus:ring-2 focus:ring-brand-500/50',
            'dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100',
            className,
          )}
          {...props}
        />
        <Calendar className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>
    )
  },
)
DatePicker.displayName = 'DatePicker'
