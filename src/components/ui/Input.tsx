import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'h-10 w-full rounded-xl border bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400',
          'focus:outline-none focus:ring-2 focus:ring-brand-500/50',
          'disabled:cursor-not-allowed disabled:opacity-60',
          'dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500',
          invalid
            ? 'border-red-400 focus:ring-red-500/40'
            : 'border-slate-200 dark:border-slate-700',
          className,
        )}
        {...props}
      />
    )
  },
)
Input.displayName = 'Input'
