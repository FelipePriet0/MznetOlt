import { supabase } from '@/shared/lib/supabase'
import type { AuthorizationPresetItem, AuthorizationPresetRow, ListAuthorizationPresetsInput } from './types'

export async function listAuthorizationPresetsRepository(
  input: Required<Pick<ListAuthorizationPresetsInput, 'page' | 'page_size'>> & Omit<ListAuthorizationPresetsInput, 'page' | 'page_size'>
): Promise<{ data: AuthorizationPresetItem[]; total: number }> {
  const { is_active, is_default, search, page, page_size } = input

  const from = (page - 1) * page_size
  const to = from + page_size - 1

  let query = supabase
    .from('authorization_presets')
    .select('id, name, description, is_default, is_active, created_at, updated_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (is_active !== undefined) query = query.eq('is_active', is_active)
  if (is_default !== undefined) query = query.eq('is_default', is_default)
  if (search) query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)

  const { data, count, error } = await query

  if (error) throw error

  const items = (data as unknown as AuthorizationPresetRow[]).map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    is_default: row.is_default,
    is_active: row.is_active,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }))

  return { data: items, total: count ?? 0 }
}

