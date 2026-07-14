import { Plus, X } from 'lucide-react'
import { Input } from '@/components/ui/Input'

interface ListInputProps {
  value: string[]
  onChange: (items: string[]) => void
  placeholder?: string
}

export function ListInput({ value, onChange, placeholder = 'Add an item' }: ListInputProps) {
  function updateAt(index: number, next: string) {
    onChange(value.map((item, i) => (i === index ? next : item)))
  }

  function removeAt(index: number) {
    onChange(value.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-2">
      {value.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <Input
            value={item}
            onChange={(event) => updateAt(index, event.target.value)}
            placeholder={placeholder}
          />
          <button
            type="button"
            onClick={() => removeAt(index)}
            aria-label="Remove item"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...value, ''])}
        className="flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:underline dark:text-brand-400"
      >
        <Plus className="h-3.5 w-3.5" /> Add item
      </button>
    </div>
  )
}
