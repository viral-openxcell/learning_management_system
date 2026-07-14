export const ROLES = ['super_admin', 'admin', 'instructor', 'student'] as const

export type Role = (typeof ROLES)[number]

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  instructor: 'Instructor',
  student: 'Student',
}

export const ROLE_HOME_ROUTE: Record<Role, string> = {
  super_admin: '/admin/dashboard',
  admin: '/admin/dashboard',
  instructor: '/instructor/dashboard',
  student: '/student/dashboard',
}

export const STAFF_ROLES: Role[] = ['super_admin', 'admin', 'instructor']

export function roleCanManageUsers(role: Role) {
  return role === 'super_admin' || role === 'admin'
}

export function rolesAssignableBy(role: Role): Role[] {
  if (role === 'super_admin') return ['super_admin', 'admin', 'instructor', 'student']
  if (role === 'admin') return ['instructor', 'student']
  return []
}
