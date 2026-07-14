export const ROUTE_PATHS = {
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  verifyEmail: '/verify-email',

  dashboard: '/dashboard',

  courses: '/courses',
  courseCreate: '/courses/new',
  courseEdit: (id: string) => `/courses/${id}/edit`,
  courseDetail: (id: string) => `/courses/${id}`,

  users: '/users',
  userDetail: (id: string) => `/users/${id}`,

  rolesPermissions: '/roles-permissions',
  curriculumLessons: '/curriculum-lessons',
  quizzes: '/quizzes',
  assignments: '/assignments',
  assignmentDetail: (id: string) => `/assignments/${id}`,
  gradebook: '/gradebook',
  enrollments: '/enrollments',
  batchesCohorts: '/batches-cohorts',
  batchDetail: (id: string) => `/batches-cohorts/${id}`,
  attendance: '/attendance',
  liveClasses: '/live-classes',
  liveClassDetail: (id: string) => `/live-classes/${id}`,
  certificates: '/certificates',
  notifications: '/notifications',
  calendar: '/calendar',
  reportsAnalytics: '/reports-analytics',
  settings: '/settings',

  unauthorized: '/unauthorized',
} as const
