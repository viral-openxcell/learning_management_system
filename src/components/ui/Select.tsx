import { forwardRef, type SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/utils/cn'

interface SelectOption {
  label: string
  value: string
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[]
  placeholder?: string
  invalid?: boolean
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, placeholder, invalid, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            'h-10 w-full appearance-none rounded-xl border bg-white px-3 pr-9 text-sm text-slate-900',
            'focus:outline-none focus:ring-2 focus:ring-brand-500/50',
            'disabled:cursor-not-allowed disabled:opacity-60',
            'dark:bg-slate-900 dark:text-slate-100',
            invalid
              ? 'border-red-400 focus:ring-red-500/40'
              : 'border-slate-200 dark:border-slate-700',
            className,
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>
    )
  },
)
Select.displayName = 'Select'
