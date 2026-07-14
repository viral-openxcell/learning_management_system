import type { Role } from '@/constants/roles'
import { lazyPage } from './lazyPage'
import { ROUTE_PATHS } from './routePaths'

export interface ModuleRoute {
  path: string
  allowedRoles: Role[]
  Component: React.LazyExoticComponent<() => React.JSX.Element>
}

const STAFF: Role[] = ['super_admin', 'admin', 'instructor']
const ADMIN_ONLY: Role[] = ['super_admin', 'admin']
const ALL_ROLES: Role[] = ['super_admin', 'admin', 'instructor', 'student']

export const MODULE_ROUTES: ModuleRoute[] = [
  {
    path: ROUTE_PATHS.rolesPermissions,
    allowedRoles: ADMIN_ONLY,
    Component: lazyPage(
      () => import('@/pages/roles-permissions/RolesPermissionsPage'),
      'RolesPermissionsPage',
    ),
  },
  {
    path: ROUTE_PATHS.curriculumLessons,
    allowedRoles: STAFF,
    Component: lazyPage(
      () => import('@/pages/curriculum-lessons/CurriculumLessonsPage'),
      'CurriculumLessonsPage',
    ),
  },
  {
    path: ROUTE_PATHS.quizzes,
    allowedRoles: ALL_ROLES,
    Component: lazyPage(() => import('@/pages/quizzes/QuizzesPage'), 'QuizzesPage'),
  },
  {
    path: ROUTE_PATHS.assignments,
    allowedRoles: ALL_ROLES,
    Component: lazyPage(() => import('@/pages/assignments/AssignmentsPage'), 'AssignmentsPage'),
  },
  {
    path: ROUTE_PATHS.gradebook,
    allowedRoles: STAFF,
    Component: lazyPage(() => import('@/pages/gradebook/GradebookPage'), 'GradebookPage'),
  },
  {
    path: ROUTE_PATHS.enrollments,
    allowedRoles: STAFF,
    Component: lazyPage(() => import('@/pages/enrollments/EnrollmentsPage'), 'EnrollmentsPage'),
  },
  {
    path: ROUTE_PATHS.batchesCohorts,
    allowedRoles: STAFF,
    Component: lazyPage(
      () => import('@/pages/batches-cohorts/BatchesCohortsPage'),
      'BatchesCohortsPage',
    ),
  },
  {
    path: ROUTE_PATHS.attendance,
    allowedRoles: STAFF,
    Component: lazyPage(() => import('@/pages/attendance/AttendancePage'), 'AttendancePage'),
  },
  {
    path: ROUTE_PATHS.liveClasses,
    allowedRoles: ALL_ROLES,
    Component: lazyPage(() => import('@/pages/live-classes/LiveClassesPage'), 'LiveClassesPage'),
  },
  {
    path: ROUTE_PATHS.certificates,
    allowedRoles: ALL_ROLES,
    Component: lazyPage(() => import('@/pages/certificates/CertificatesPage'), 'CertificatesPage'),
  },
  {
    path: ROUTE_PATHS.notifications,
    allowedRoles: ALL_ROLES,
    Component: lazyPage(
      () => import('@/pages/notifications/NotificationsPage'),
      'NotificationsPage',
    ),
  },
  {
    path: ROUTE_PATHS.calendar,
    allowedRoles: ALL_ROLES,
    Component: lazyPage(() => import('@/pages/calendar/CalendarPage'), 'CalendarPage'),
  },
  {
    path: ROUTE_PATHS.reportsAnalytics,
    allowedRoles: STAFF,
    Component: lazyPage(
      () => import('@/pages/reports-analytics/ReportsAnalyticsPage'),
      'ReportsAnalyticsPage',
    ),
  },
  {
    path: ROUTE_PATHS.settings,
    allowedRoles: ALL_ROLES,
    Component: lazyPage(() => import('@/pages/settings/SettingsPage'), 'SettingsPage'),
  },
]
