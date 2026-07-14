import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => {
    return (
      <label
        htmlFor={id}
        className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300"
      >
        <input
          ref={ref}
          id={id}
          type="checkbox"
          className={cn(
            'h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-2 focus:ring-brand-500/50',
            'dark:border-slate-600 dark:bg-slate-900',
            className,
          )}
          {...props}
        />
        {label}
      </label>
    )
  },
)
Checkbox.displayName = 'Checkbox'
