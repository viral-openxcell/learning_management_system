import { create } from 'zustand'
import type { AppSession, AppUser, Profile } from '@/types/auth.types'

interface AuthState {
  session: AppSession | null
  user: AppUser | null
  profile: Profile | null
  isInitializing: boolean
  setSession: (session: AppSession | null) => void
  setProfile: (profile: Profile | null) => void
  setInitializing: (value: boolean) => void
  clear: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  profile: null,
  isInitializing: true,
  setSession: (session) => set({ session, user: session?.user ?? null }),
  setProfile: (profile) => set({ profile }),
  setInitializing: (value) => set({ isInitializing: value }),
  clear: () => set({ session: null, user: null, profile: null }),
}))
