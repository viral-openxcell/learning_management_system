import { useAuthStore } from '@/store/auth.store'

export function useAuth() {
  const session = useAuthStore((s) => s.session)
  const user = useAuthStore((s) => s.user)
  const profile = useAuthStore((s) => s.profile)
  const isInitializing = useAuthStore((s) => s.isInitializing)

  return {
    session,
    user,
    profile,
    role: profile?.role ?? null,
    isAuthenticated: Boolean(session),
    isInitializing,
  }
}
