import { Modal } from './Modal'
import { Button } from '@/components/ui/Button'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description?: string
  confirmLabel?: string
  isLoading?: boolean
  variant?: 'danger' | 'primary'
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  isLoading,
  variant = 'danger',
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      {description && (
        <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">{description}</p>
      )}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button variant={variant} onClick={onConfirm} isLoading={isLoading}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}
