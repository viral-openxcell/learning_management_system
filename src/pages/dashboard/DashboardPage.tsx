import { useAuth } from '@/hooks/useAuth'
import { AdminDashboardPage } from './AdminDashboardPage'
import { InstructorDashboardPage } from './InstructorDashboardPage'
import { StudentDashboardPage } from './StudentDashboardPage'

export function DashboardPage() {
  const { role } = useAuth()

  if (role === 'instructor') return <InstructorDashboardPage />
  if (role === 'student') return <StudentDashboardPage />
  return <AdminDashboardPage />
}
