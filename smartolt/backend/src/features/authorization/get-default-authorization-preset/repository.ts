import { supabase } from '@/shared/lib/supabase'
import type { AuthorizationPresetItem, AuthorizationPresetRow } from './types'

export async function getDefaultAuthorizationPresetRepository(): Promise<AuthorizationPresetItem | null> {
  const { data, error } = await supabase
    .from('authorization_presets')
    .select('id, name, description, is_default, is_active, created_at, updated_at')
    .eq('is_default', true)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  const row = data as unknown as AuthorizationPresetRow

  return {
    id: row.id,
    name: row.name,
    description: row.description,
    is_default: row.is_default,
    is_active: row.is_active,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

