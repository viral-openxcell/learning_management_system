import type { AppSession } from '@/types/auth.types'
import type {
  ResetPasswordInput,
  SignInInput,
  SignUpInput,
  UpdatePasswordInput,
} from '@/services/auth/auth.types'
import { mockDb } from './mockDb'

const SESSION_KEY = 'lms-mock-session'
type Listener = (session: AppSession | null) => void
const listeners = new Set<Listener>()

function buildSession(userId: string, email: string): AppSession {
  return { access_token: `mock-token-${userId}`, user: { id: userId, email } }
}

function persistSession(session: AppSession | null) {
  if (session) localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: session.user.id }))
  else localStorage.removeItem(SESSION_KEY)
  listeners.forEach((listener) => listener(session))
}

export const mockAuthService = {
  async signIn({ email }: SignInInput) {
    const profile = mockDb.findProfileByEmail(email)
    if (!profile) {
      throw new Error(
        'No account found with that email. Try one of the demo accounts shown below the form.',
      )
    }
    const session = buildSession(profile.id, profile.email)
    persistSession(session)
    return { session }
  },

  async signUp({ email, fullName }: SignUpInput) {
    if (mockDb.findProfileByEmail(email)) {
      throw new Error('An account with that email already exists.')
    }
    mockDb.insert('profiles', { email, full_name: fullName, avatar_url: null, role: 'student' })
    // Mirrors Supabase's email-confirmation flow: no session until "verified".
    return { session: null }
  },

  async signOut() {
    persistSession(null)
  },

  async resetPasswordForEmail(_input: ResetPasswordInput) {
    // No email provider in mock mode — resolve immediately.
  },

  async updatePassword(_input: UpdatePasswordInput) {
    // Passwords aren't checked in mock mode — nothing to update.
  },

  async getSession(): Promise<AppSession | null> {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const { userId } = JSON.parse(raw) as { userId: string }
    const profile = mockDb.getProfileById(userId)
    if (!profile) return null
    return buildSession(profile.id, profile.email)
  },

  onAuthStateChange(callback: Listener) {
    listeners.add(callback)
    return { unsubscribe: () => listeners.delete(callback) }
  },
}
