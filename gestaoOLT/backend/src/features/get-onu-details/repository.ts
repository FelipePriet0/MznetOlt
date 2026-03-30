import { supabase } from '@/shared/lib/supabase'
import type { GetOnuDetailsInput, InternalOnu, OnuSnapshot } from './types'

export async function fetchLatestOnuSnapshot(
  input: GetOnuDetailsInput
): Promise<OnuSnapshot | null> {
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

  return data as OnuSnapshot
}

export async function fetchInternalOnuById(
  onu_id: number
): Promise<InternalOnu | null> {
  const { data, error } = await supabase
    .from('onus')
    .select(
      'id, serial_number, olt_id, board_id, pon_port_id, onu_type_id, status, admin_state, last_known_signal, last_seen_at, created_at, updated_at'
    )
    .eq('id', onu_id)
    .single()

  if (error) {
    return null
  }

  return data as InternalOnu
}