import { supabase } from '@/shared/lib/supabase'
import type { UserWithRoleRow } from './types'

export async function findUserById(id: number): Promise<UserWithRoleRow | null> {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, is_active, role_id, created_at, updated_at, roles(name, code)')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return data as unknown as UserWithRoleRow
}
