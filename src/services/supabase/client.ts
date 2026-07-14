import { createClient } from '@supabase/supabase-js'
import { USE_MOCK_DATA } from '@/lib/mockConfig'
import type { Database } from '@/types/supabase'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (
  import.meta.env.DEV &&
  !USE_MOCK_DATA &&
  (!supabaseUrl || supabaseUrl.includes('your-project-ref'))
) {
  console.warn(
    '[supabase] VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY are still placeholders — copy .env.example to .env and fill in real project credentials.',
  )
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
