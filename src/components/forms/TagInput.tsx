import { useState, type KeyboardEvent } from 'react'
import { X } from 'lucide-react'
import { Input } from '@/components/ui/Input'

interface TagInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
}

export function TagInput({
  value,
  onChange,
  placeholder = 'Add a tag and press Enter',
}: TagInputProps) {
  const [draft, setDraft] = useState('')

  function addTag() {
    const tag = draft.trim()
    if (tag && !value.includes(tag)) onChange([...value, tag])
    setDraft('')
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      addTag()
    } else if (event.key === 'Backspace' && draft === '' && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 p-2 dark:border-slate-700">
        {value.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 dark:bg-brand-900/40 dark:text-brand-300"
          >
            {tag}
            <button
              onClick={() => onChange(value.filter((t) => t !== tag))}
              aria-label={`Remove ${tag}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <Input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addTag}
          placeholder={value.length === 0 ? placeholder : ''}
          className="h-7 min-w-[8rem] flex-1 border-none px-1 focus:ring-0"
        />
      </div>
    </div>
  )
}
