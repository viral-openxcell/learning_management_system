import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Settings, User } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { useAuth } from '@/hooks/useAuth'
import { useDisclosure } from '@/hooks/useDisclosure'
import { authService } from '@/services/auth/auth.service'
import { ROUTE_PATHS } from '@/routes/routePaths'
import { ROLE_LABELS } from '@/constants/roles'
import { toast } from '@/utils/toast'

export function ProfileDropdown() {
  const { profile, role } = useAuth()
  const { isOpen, toggle, close } = useDisclosure()
  const containerRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) close()
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [close])

  async function handleSignOut() {
    try {
      await authService.signOut()
      navigate(ROUTE_PATHS.login)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to sign out')
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={toggle}
        className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 hover:bg-white dark:hover:bg-slate-800"
      >
        <Avatar
          src={profile?.avatar_url}
          name={profile?.full_name}
          size="sm"
          className="ring-1 ring-slate-200 dark:ring-slate-700"
        />
        <span className="hidden text-left sm:block">
          <span className="block text-sm font-semibold leading-tight text-slate-900 dark:text-slate-100">
            {profile?.full_name ?? 'User'}
          </span>
          <span className="block text-xs leading-tight text-slate-500 dark:text-slate-400">
            {role ? ROLE_LABELS[role] : ''}
          </span>
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 z-30 mt-2 w-52 rounded-2xl border border-slate-200 bg-white py-1.5 shadow-lg dark:border-slate-700 dark:bg-slate-900">
          <button
            onClick={() => {
              close()
              navigate(ROUTE_PATHS.settings)
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <User className="h-4 w-4" /> Profile
          </button>
          <button
            onClick={() => {
              close()
              navigate(ROUTE_PATHS.settings)
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Settings className="h-4 w-4" /> Settings
          </button>
          <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      )}
    </div>
  )
}
