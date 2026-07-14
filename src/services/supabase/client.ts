import { createClient } from '@supabase/supabase-js'
import { USE_MOCK_DATA } from '@/lib/mockConfig'
import type { Database } from '@/types/supabase'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key'

const isPlaceholderConfig =
  supabaseUrl.includes('your-project-ref') || supabaseUrl.includes('placeholder.supabase.co')

if (!USE_MOCK_DATA && isPlaceholderConfig) {
  console.warn(
    "[supabase] VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY are missing or still placeholders — set real project credentials as environment variables (in .env locally, or in your host's project settings when deployed).",
  )
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
