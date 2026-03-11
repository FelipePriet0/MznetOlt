import { supabase } from '@/shared/lib/supabase'
import type { OltDetailsRow } from './types'

export async function findOltById(id: number): Promise<OltDetailsRow | null> {
  const { data, error } = await supabase
    .from('olts')
    .select('id, name, vendor, mgmt_ip, location_id, zone_id, created_at, updated_at, locations(name), zones(name)')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return data as unknown as OltDetailsRow
}
