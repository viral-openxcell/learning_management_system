import { Link, useLocation } from 'react-router-dom'
import { Bell, Menu, Search, Settings } from 'lucide-react'
import { useUiStore } from '@/store/ui.store'
import { useAuth } from '@/hooks/useAuth'
import { createEntityHooks } from '@/hooks/createEntityHooks'
import { ROUTE_PATHS } from '@/routes/routePaths'
import { findNavItemForPath } from '@/utils/findNavItem'
import { Input } from '@/components/ui/Input'
import { ProfileDropdown } from './ProfileDropdown'

const { useListQuery: useNotificationsQuery } = createEntityHooks('notifications')

function usePageTitle() {
  const { pathname } = useLocation()
  return findNavItemForPath(pathname)?.label ?? 'Dashboard'
}

export function Topbar() {
  const setSidebarOpen = useUiStore((s) => s.setSidebarOpen)
  const { user, profile } = useAuth()
  const { data: notifications } = useNotificationsQuery({
    pageSize: 100,
    filters: { user_id: user?.id },
  })
  const unreadCount = notifications?.data.filter((n) => !n.is_read).length ?? 0
  const title = usePageTitle()
  const firstName = profile?.full_name?.split(' ')[0] ?? 'there'
  const isDashboard = title === 'Dashboard'

  return (
    <header className="flex h-14 shrink-0 items-center gap-3">
      <button
        onClick={() => setSidebarOpen(true)}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm lg:hidden dark:bg-slate-900 dark:text-slate-300"
        aria-label="Open sidebar"
      >
        <Menu className="h-4 w-4" />
      </button>

      <div className="min-w-0 flex-1">
        <h1 className="font-display truncate text-lg font-semibold text-slate-900 dark:text-slate-100">
          {title}
        </h1>
        {isDashboard && (
          <p className="truncate text-xs text-slate-500 dark:text-slate-400">
            Hello {firstName}, welcome back!
          </p>
        )}
      </div>

      <div className="relative hidden max-w-sm flex-1 sm:block">
        <Input
          placeholder="Search anything"
          className="rounded-full border-slate-200 bg-white pr-10 shadow-sm dark:border-slate-700 dark:bg-slate-900"
        />
        <Search className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>

      <div className="flex items-center gap-3">
        <Link
          to={ROUTE_PATHS.notifications}
          className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm hover:text-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-white"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-brand-500" />
          )}
        </Link>

        <Link
          to={ROUTE_PATHS.settings}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm hover:text-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-white"
          aria-label="Settings"
        >
          <Settings className="h-4 w-4" />
        </Link>

        <ProfileDropdown />
      </div>
    </header>
  )
}
