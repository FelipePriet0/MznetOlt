import { supabase } from '@/shared/lib/supabase'
import type { ListUsersInput, UserWithRole } from './types'

type RawUserRow = {
  id: number
  name: string
  email: string
  is_active: boolean
  role_id: number
  created_at: string
  updated_at: string
  roles: {
    name: string
    code: string
  }
}

export async function listUsersRepository(
  input: Required<Pick<ListUsersInput, 'page' | 'page_size'>> & Omit<ListUsersInput, 'page' | 'page_size'>
): Promise<{ data: UserWithRole[]; total: number }> {
  const { role_id, is_active, search, page, page_size } = input

  const from = (page - 1) * page_size
  const to = from + page_size - 1

  let query = supabase
    .from('users')
    .select('id, name, email, is_active, role_id, created_at, updated_at, roles(name, code)', { count: 'exact' })
    .order('id', { ascending: true })
    .range(from, to)

  if (role_id !== undefined) {
    query = query.eq('role_id', role_id)
  }

  if (is_active !== undefined) {
    query = query.eq('is_active', is_active)
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`)
  }

  const { data, count, error } = await query

  if (error) throw error

  const items = (data as unknown as RawUserRow[]).map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    is_active: row.is_active,
    role_id: row.role_id,
    role_name: row.roles.name,
    role_code: row.roles.code,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }))

  return { data: items, total: count ?? 0 }
}
