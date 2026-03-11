import { supabase } from '@/shared/lib/supabase'
import type { OnuSnapshotItem, SearchOnuBySerialInput } from './types'

export async function searchOnuBySerialRepository(
  input: SearchOnuBySerialInput
): Promise<OnuSnapshotItem | null> {
  let query = supabase
    .from('onu_network_snapshots')
    .select(
      'olt_id, onu_serial, onu_id, source, last_known_status, last_known_signal, last_seen_at, raw_snapshot'
    )
    .eq('onu_serial', input.onu_serial)

  if (input.olt_id !== undefined) {
    query = query.eq('olt_id', input.olt_id)
  }

  const { data, error } = await query
    .order('last_seen_at', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    return null
  }

  return data as OnuSnapshotItem
}