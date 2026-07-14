import type { Role } from '@/constants/roles'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: Role
  phone: string | null
  bio: string | null
  department: string | null
  location: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

/**
 * App-level user/session shape, decoupled from supabase-js's `User`/`Session`.
 * Both the real Supabase auth service and the mock auth service normalize to
 * this so the rest of the app (store, hooks, guards) never depends on which
 * backend is active.
 */
export interface AppUser {
  id: string
  email: string
}

export interface AppSession {
  access_token: string
  user: AppUser
}
