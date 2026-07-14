import { Navigate, Outlet, useLocation } from 'react-router-dom'
import type { Role } from '@/constants/roles'
import { useAuth } from '@/hooks/useAuth'
import { usePermissionsStore, getEffectiveRoles } from '@/store/permissions.store'
import { findNavItemForPath } from '@/utils/findNavItem'
import { ROUTE_PATHS } from './routePaths'

export function RoleGuard({ allowedRoles }: { allowedRoles: Role[] }) {
  const { role } = useAuth()
  const { pathname } = useLocation()
  const overrides = usePermissionsStore((s) => s.overrides)

  const navItem = findNavItemForPath(pathname)
  const effectiveRoles = navItem
    ? getEffectiveRoles(overrides, navItem.path, navItem.allowedRoles)
    : allowedRoles

  if (!role || !effectiveRoles.includes(role)) {
    return <Navigate to={ROUTE_PATHS.unauthorized} replace />
  }

  return <Outlet />
}
