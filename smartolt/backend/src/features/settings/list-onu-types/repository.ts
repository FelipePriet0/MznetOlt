import { supabase } from '@/shared/lib/supabase'
import type { OnuTypeItem } from './types'

export async function listOnuTypesRepository(): Promise<OnuTypeItem[]> {
  const { data, error } = await supabase
    .from('onu_types')
    .select('id, name, vendor, created_at')
    .order('name', { ascending: true })

  if (error) {
    throw error
  }

  return (data ?? []) as OnuTypeItem[]
}

