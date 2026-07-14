import { createBrowserRouter, type RouteObject } from 'react-router-dom'
import { RootLayout } from '@/layouts/RootLayout'
import { AuthLayout } from '@/layouts/AuthLayout'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { ProtectedRoute } from './ProtectedRoute'
import { RoleGuard } from './RoleGuard'
import { MODULE_ROUTES } from './moduleRoutes.config'
import { lazyPage } from './lazyPage'
import { ROUTE_PATHS } from './routePaths'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { UnauthorizedPage } from '@/pages/UnauthorizedPage'

const LoginPage = lazyPage(() => import('@/pages/auth/LoginPage'), 'LoginPage')
const RegisterPage = lazyPage(() => import('@/pages/auth/RegisterPage'), 'RegisterPage')
const ForgotPasswordPage = lazyPage(
  () => import('@/pages/auth/ForgotPasswordPage'),
  'ForgotPasswordPage',
)
const ResetPasswordPage = lazyPage(
  () => import('@/pages/auth/ResetPasswordPage'),
  'ResetPasswordPage',
)
const VerifyEmailPage = lazyPage(() => import('@/pages/auth/VerifyEmailPage'), 'VerifyEmailPage')

const DashboardPage = lazyPage(() => import('@/pages/dashboard/DashboardPage'), 'DashboardPage')

const CourseListPage = lazyPage(() => import('@/pages/courses/CourseListPage'), 'CourseListPage')
const CourseCreatePage = lazyPage(
  () => import('@/pages/courses/CourseCreatePage'),
  'CourseCreatePage',
)
const CourseEditPage = lazyPage(() => import('@/pages/courses/CourseEditPage'), 'CourseEditPage')
const CourseDetailPage = lazyPage(
  () => import('@/pages/courses/CourseDetailPage'),
  'CourseDetailPage',
)

const UserListPage = lazyPage(() => import('@/pages/users/UserListPage'), 'UserListPage')
const UserDetailPage = lazyPage(() => import('@/pages/users/UserDetailPage'), 'UserDetailPage')

const BatchDetailPage = lazyPage(
  () => import('@/pages/batches-cohorts/BatchDetailPage'),
  'BatchDetailPage',
)
const AssignmentDetailPage = lazyPage(
  () => import('@/pages/assignments/AssignmentDetailPage'),
  'AssignmentDetailPage',
)
const LiveClassDetailPage = lazyPage(
  () => import('@/pages/live-classes/LiveClassDetailPage'),
  'LiveClassDetailPage',
)

const STAFF = ['super_admin', 'admin', 'instructor'] as const
const ADMIN_ONLY = ['super_admin', 'admin'] as const
const ALL_ROLES = ['super_admin', 'admin', 'instructor', 'student'] as const

const moduleRouteObjects: RouteObject[] = MODULE_ROUTES.map((route) => ({
  element: <RoleGuard allowedRoles={route.allowedRoles} />,
  children: [{ path: route.path, element: <route.Component /> }],
}))

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: ROUTE_PATHS.login, element: <LoginPage /> },
          { path: ROUTE_PATHS.register, element: <RegisterPage /> },
          { path: ROUTE_PATHS.forgotPassword, element: <ForgotPasswordPage /> },
          { path: ROUTE_PATHS.resetPassword, element: <ResetPasswordPage /> },
          { path: ROUTE_PATHS.verifyEmail, element: <VerifyEmailPage /> },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [
          { path: ROUTE_PATHS.unauthorized, element: <UnauthorizedPage /> },
          {
            element: <DashboardLayout />,
            children: [
              { index: true, element: <DashboardPage /> },
              { path: ROUTE_PATHS.dashboard, element: <DashboardPage /> },
              {
                element: <RoleGuard allowedRoles={[...STAFF]} />,
                children: [
                  { path: ROUTE_PATHS.courses, element: <CourseListPage /> },
                  { path: ROUTE_PATHS.courseCreate, element: <CourseCreatePage /> },
                  { path: '/courses/:id/edit', element: <CourseEditPage /> },
                  { path: '/courses/:id', element: <CourseDetailPage /> },
                  { path: '/batches-cohorts/:id', element: <BatchDetailPage /> },
                ],
              },
              {
                element: <RoleGuard allowedRoles={[...ADMIN_ONLY]} />,
                children: [
                  { path: ROUTE_PATHS.users, element: <UserListPage /> },
                  { path: '/users/:id', element: <UserDetailPage /> },
                ],
              },
              {
                element: <RoleGuard allowedRoles={[...ALL_ROLES]} />,
                children: [
                  { path: '/assignments/:id', element: <AssignmentDetailPage /> },
                  { path: '/live-classes/:id', element: <LiveClassDetailPage /> },
                ],
              },
              ...moduleRouteObjects,
            ],
          },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
