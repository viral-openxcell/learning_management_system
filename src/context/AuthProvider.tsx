import { useEffect, type ReactNode } from 'react'
import { authService } from '@/services/auth/auth.service'
import { createRepository } from '@/services/api/base.repository'
import { useAuthStore } from '@/store/auth.store'
import type { Profile } from '@/types/auth.types'

const profilesRepository = createRepository('profiles')

async function fetchProfile(userId: string): Promise<Profile | null> {
  try {
    return await profilesRepository.getById(userId)
  } catch (error) {
    console.error('[auth] failed to load profile', error)
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const setSession = useAuthStore((s) => s.setSession)
  const setProfile = useAuthStore((s) => s.setProfile)
  const setInitializing = useAuthStore((s) => s.setInitializing)

  useEffect(() => {
    let isMounted = true

    authService.getSession().then(async (session) => {
      if (!isMounted) return
      setSession(session)
      if (session?.user) setProfile(await fetchProfile(session.user.id))
      setInitializing(false)
    })

    const { unsubscribe } = authService.onAuthStateChange(async (session) => {
      setSession(session)
      if (session?.user) {
        const profile = await fetchProfile(session.user.id)
        if (isMounted) setProfile(profile)
      } else {
        setProfile(null)
      }
    })

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [setSession, setProfile, setInitializing])

  return <>{children}</>
}
