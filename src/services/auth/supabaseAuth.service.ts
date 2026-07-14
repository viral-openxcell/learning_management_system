import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/services/supabase/client'
import type { AppSession } from '@/types/auth.types'
import type {
  ResetPasswordInput,
  SignInInput,
  SignUpInput,
  UpdatePasswordInput,
} from './auth.types'

const redirectTo = () => `${window.location.origin}/reset-password`

function toAppSession(session: Session | null): AppSession | null {
  if (!session?.user.email) return null
  return {
    access_token: session.access_token,
    user: { id: session.user.id, email: session.user.email },
  }
}

export const supabaseAuthService = {
  async signIn({ email, password }: SignInInput) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return { session: toAppSession(data.session) }
  },

  async signUp({ email, password, fullName }: SignUpInput) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    if (error) throw error
    return { session: toAppSession(data.session) }
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async resetPasswordForEmail({ email }: ResetPasswordInput) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: redirectTo() })
    if (error) throw error
  },

  async updatePassword({ password }: UpdatePasswordInput) {
    const { error } = await supabase.auth.updateUser({ password })
    if (error) throw error
  },

  async getSession(): Promise<AppSession | null> {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    return toAppSession(data.session)
  },

  onAuthStateChange(callback: (session: AppSession | null) => void) {
    const { data } = supabase.auth.onAuthStateChange((_event, session) =>
      callback(toAppSession(session)),
    )
    return { unsubscribe: () => data.subscription.unsubscribe() }
  },
}
