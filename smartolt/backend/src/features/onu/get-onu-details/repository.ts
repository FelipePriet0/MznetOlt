import { supabase } from '@/shared/lib/supabase'
import type { OnuDetailsRow } from './types'

export async function findOnuById(id: number): Promise<OnuDetailsRow | null> {
  const { data, error } = await supabase
    .from('onus')
    .select(
      'id, serial_number, status, admin_state, last_known_signal, last_seen_at, olt_id, board_id, pon_port_id, onu_type_id, created_at, updated_at, olts(name), boards(name, slot_index), pon_ports(name, pon_index), onu_types(vendor, model)'
    )
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return data as unknown as OnuDetailsRow
}
