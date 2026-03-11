import { supabase } from '@/shared/lib/supabase'
import type { OdbItem } from './types'

export async function listOdbsRepository(): Promise<OdbItem[]> {
  const { data, error } = await supabase
    .from('odbs')
    .select('id, location_id, name, address, reference, created_at, updated_at')
    .order('name', { ascending: true })

  if (error) {
    throw error
  }

  return (data ?? []) as OdbItem[]
}

