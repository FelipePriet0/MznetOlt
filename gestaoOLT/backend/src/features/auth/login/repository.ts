import { supabase } from '@/shared/lib/supabase'
import type { UserRow } from './types'

export async function findUserByEmail(email: string): Promise<UserRow | null> {
  const { data, error } = await supabase
    .from('users')
    .select('id, email, is_active, role_id, roles(name, code)')
    .eq('email', email)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return data as unknown as UserRow
}
