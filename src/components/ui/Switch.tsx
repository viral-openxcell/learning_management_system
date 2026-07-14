import { cn } from '@/utils/cn'

interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  'aria-label'?: string
}

export function Switch({ checked, onChange, disabled, 'aria-label': ariaLabel }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative flex h-5 w-9 shrink-0 items-center rounded-full transition-colors',
        checked ? 'bg-brand-500' : 'bg-slate-200 dark:bg-slate-700',
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
      )}
    >
      <span
        className={cn(
          'h-4 w-4 rounded-full bg-white shadow-sm transition-transform',
          checked ? 'translate-x-[18px]' : 'translate-x-0.5',
        )}
      />
    </button>
  )
}
