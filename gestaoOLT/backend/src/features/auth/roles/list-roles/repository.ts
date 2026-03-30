import { supabase } from '@/shared/lib/supabase'
import type { Role } from './types'

export async function listRolesRepository(): Promise<Role[]> {
  const { data, error } = await supabase
    .from('roles')
    .select('id, name, code, created_at, updated_at')
    .order('id', { ascending: true })

  if (error) throw error

  return data
}
