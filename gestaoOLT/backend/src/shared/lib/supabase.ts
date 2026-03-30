import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { env } from '@/config/env'

// Service role client — para queries de banco de dados
export const supabase: SupabaseClient = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
)

// Anon client — exclusivo para signInWithPassword (requer anon key)
export const supabaseAuth: SupabaseClient = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
)
