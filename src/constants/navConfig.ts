import {
  LayoutDashboard,
  BookOpen,
  Users,
  ShieldCheck,
  Layers,
  HelpCircle,
  ClipboardList,
  GraduationCap,
  UserPlus,
  Boxes,
  CalendarCheck,
  Video,
  Award,
  Bell,
  Calendar,
  BarChart3,
  Settings,
  type LucideIcon,
} from 'lucide-react'
import type { Role } from './roles'
import { ROUTE_PATHS } from '@/routes/routePaths'

export interface NavItem {
  label: string
  path: string
  icon: LucideIcon
  allowedRoles: Role[]
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

const STAFF: Role[] = ['super_admin', 'admin', 'instructor']
const ADMIN_ONLY: Role[] = ['super_admin', 'admin']
const ALL_ROLES: Role[] = ['super_admin', 'admin', 'instructor', 'student']

export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      {
        label: 'Dashboard',
        path: ROUTE_PATHS.dashboard,
        icon: LayoutDashboard,
        allowedRoles: ALL_ROLES,
      },
    ],
  },
  {
    label: 'Teaching',
    items: [
      { label: 'Courses', path: ROUTE_PATHS.courses, icon: BookOpen, allowedRoles: STAFF },
      {
        label: 'Curriculum & Lessons',
        path: ROUTE_PATHS.curriculumLessons,
        icon: Layers,
        allowedRoles: STAFF,
      },
      { label: 'Quizzes', path: ROUTE_PATHS.quizzes, icon: HelpCircle, allowedRoles: ALL_ROLES },
      {
        label: 'Assignments',
        path: ROUTE_PATHS.assignments,
        icon: ClipboardList,
        allowedRoles: ALL_ROLES,
      },
      { label: 'Gradebook', path: ROUTE_PATHS.gradebook, icon: GraduationCap, allowedRoles: STAFF },
      {
        label: 'Live Classes',
        path: ROUTE_PATHS.liveClasses,
        icon: Video,
        allowedRoles: ALL_ROLES,
      },
      {
        label: 'Certificates',
        path: ROUTE_PATHS.certificates,
        icon: Award,
        allowedRoles: ALL_ROLES,
      },
    ],
  },
  {
    label: 'Administration',
    items: [
      { label: 'Users', path: ROUTE_PATHS.users, icon: Users, allowedRoles: ADMIN_ONLY },
      {
        label: 'Roles & Permissions',
        path: ROUTE_PATHS.rolesPermissions,
        icon: ShieldCheck,
        allowedRoles: ADMIN_ONLY,
      },
      { label: 'Enrollments', path: ROUTE_PATHS.enrollments, icon: UserPlus, allowedRoles: STAFF },
      {
        label: 'Batches & Cohorts',
        path: ROUTE_PATHS.batchesCohorts,
        icon: Boxes,
        allowedRoles: STAFF,
      },
      {
        label: 'Attendance',
        path: ROUTE_PATHS.attendance,
        icon: CalendarCheck,
        allowedRoles: STAFF,
      },
    ],
  },
  {
    label: 'Insights',
    items: [
      { label: 'Calendar', path: ROUTE_PATHS.calendar, icon: Calendar, allowedRoles: ALL_ROLES },
      {
        label: 'Notifications',
        path: ROUTE_PATHS.notifications,
        icon: Bell,
        allowedRoles: ALL_ROLES,
      },
      {
        label: 'Reports & Analytics',
        path: ROUTE_PATHS.reportsAnalytics,
        icon: BarChart3,
        allowedRoles: STAFF,
      },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Settings', path: ROUTE_PATHS.settings, icon: Settings, allowedRoles: ALL_ROLES },
    ],
  },
]
