import { supabase } from '@/shared/lib/supabase'
import type { ZoneItem } from './types'

export async function listZonesRepository(): Promise<ZoneItem[]> {
  const { data, error } = await supabase
    .from('zones')
    .select('id, name, created_at')
    .order('name', { ascending: true })

  if (error) {
    throw error
  }

  return (data ?? []) as ZoneItem[]
}
