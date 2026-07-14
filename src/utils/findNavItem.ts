import { NAV_GROUPS, type NavItem } from '@/constants/navConfig'

const NAV_ITEMS = NAV_GROUPS.flatMap((group) => group.items)

export function findNavItemForPath(pathname: string): NavItem | undefined {
  const exact = NAV_ITEMS.find((item) => item.path === pathname)
  if (exact) return exact

  return [...NAV_ITEMS]
    .sort((a, b) => b.path.length - a.path.length)
    .find((item) => item.path !== '/' && pathname.startsWith(item.path))
}
