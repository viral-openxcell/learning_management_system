import { Navigate, Outlet } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { ROUTE_PATHS } from './routePaths'

export function ProtectedRoute() {
  const { isAuthenticated, isInitializing } = useAuth()

  if (isInitializing) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTE_PATHS.login} replace />
  }

  return <Outlet />
}
