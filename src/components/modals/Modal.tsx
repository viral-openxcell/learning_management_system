import { type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'
import { X } from 'lucide-react'
import { cn } from '@/utils/cn'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' }

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'relative z-10 w-full rounded-card bg-white p-6 shadow-xl dark:bg-slate-900',
              sizeClasses[size],
            )}
          >
            {title && (
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {title}
                </h2>
                <button
                  onClick={onClose}
                  className="rounded-md p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
