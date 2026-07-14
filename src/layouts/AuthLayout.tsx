import { Outlet } from 'react-router-dom'
import { motion } from 'motion/react'
import { GraduationCap } from 'lucide-react'

export function AuthLayout() {
  return (
    <div className="aurora-light relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-brand shadow-sm">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <span className="font-display text-xl font-semibold text-slate-900">LMS</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="panel p-6 sm:p-8"
        >
          <Outlet />
        </motion.div>
      </div>
    </div>
  )
}
