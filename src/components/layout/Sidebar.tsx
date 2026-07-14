import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { GraduationCap, Plus, PanelLeftClose, PanelLeftOpen, X } from 'lucide-react'
import { NAV_GROUPS } from '@/constants/navConfig'
import { useAuth } from '@/hooks/useAuth'
import { useUiStore } from '@/store/ui.store'
import { usePermissionsStore, getEffectiveRoles } from '@/store/permissions.store'
import { ROUTE_PATHS } from '@/routes/routePaths'
import { cn } from '@/utils/cn'

function SidebarContent({ collapsed }: { collapsed: boolean }) {
  const { role } = useAuth()
  const setSidebarOpen = useUiStore((s) => s.setSidebarOpen)
  const overrides = usePermissionsStore((s) => s.overrides)

  return (
    <nav className="flex flex-1 flex-col overflow-y-auto scrollbar-thin px-3 py-4">
      {NAV_GROUPS.map((group) => {
        const items = group.items.filter(
          (item) =>
            !role || getEffectiveRoles(overrides, item.path, item.allowedRoles).includes(role),
        )
        if (items.length === 0) return null
        const showAdd =
          group.label === 'Learning' &&
          (role === 'admin' || role === 'super_admin' || role === 'instructor')

        return (
          <div key={group.label} className="mb-4">
            {!collapsed && (
              <div className="flex items-center justify-between px-3 pb-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {group.label}
                </p>
                {showAdd && (
                  <NavLink
                    to={ROUTE_PATHS.courseCreate}
                    onClick={() => setSidebarOpen(false)}
                    className="flex h-4 w-4 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                  >
                    <Plus className="h-3 w-3" />
                  </NavLink>
                )}
              </div>
            )}
            <ul className="space-y-0.5">
              {items.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'text-slate-900 dark:text-white'
                          : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <motion.span
                            layoutId="sidebar-active-pill"
                            className="absolute inset-0 rounded-xl bg-brand-100 dark:bg-brand-500/15"
                            transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                          />
                        )}
                        <item.icon className="relative z-10 h-4 w-4 shrink-0" />
                        {!collapsed && <span className="relative z-10 truncate">{item.label}</span>}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </nav>
  )
}

function SidebarLogo({ collapsed }: { collapsed: boolean }) {
  return (
    <div className="flex items-center gap-2 overflow-hidden">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-brand text-white">
        <GraduationCap className="h-4 w-4" />
      </span>
      {!collapsed && (
        <span className="font-display truncate font-semibold text-slate-900 dark:text-slate-100">
          LMS
        </span>
      )}
    </div>
  )
}

export function Sidebar() {
  const sidebarOpen = useUiStore((s) => s.sidebarOpen)
  const setSidebarOpen = useUiStore((s) => s.setSidebarOpen)
  const sidebarCollapsed = useUiStore((s) => s.sidebarCollapsed)
  const toggleSidebarCollapsed = useUiStore((s) => s.toggleSidebarCollapsed)

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden shrink-0 flex-col border-r border-slate-200 bg-white transition-all duration-200 lg:flex dark:border-slate-800 dark:bg-slate-900',
          sidebarCollapsed ? 'w-20' : 'w-64',
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between px-4">
          <SidebarLogo collapsed={sidebarCollapsed} />
          {!sidebarCollapsed && (
            <button
              onClick={toggleSidebarCollapsed}
              className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle sidebar"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          )}
        </div>
        <SidebarContent collapsed={sidebarCollapsed} />
        {sidebarCollapsed && (
          <div className="p-3">
            <button
              onClick={toggleSidebarCollapsed}
              className="flex w-full items-center justify-center rounded-2xl bg-ink py-2.5 text-white hover:bg-ink/90"
              aria-label="Expand sidebar"
            >
              <PanelLeftOpen className="h-4 w-4" />
            </button>
          </div>
        )}
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.2 }}
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-white lg:hidden dark:bg-slate-900"
            >
              <div className="flex h-16 shrink-0 items-center justify-between px-4">
                <SidebarLogo collapsed={false} />
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  aria-label="Close sidebar"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <SidebarContent collapsed={false} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
