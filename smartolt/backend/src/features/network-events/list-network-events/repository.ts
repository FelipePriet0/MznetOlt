import { supabase } from '@/shared/lib/supabase'
import type { ListNetworkEventsInput, NetworkEventRow } from './types'

export async function listNetworkEventsRepository(input: ListNetworkEventsInput): Promise<NetworkEventRow[]> {
  const limit = input.limit && input.limit > 0 ? input.limit : 50

  let query = supabase
    .from('network_events')
    .select('id, olt_id, onu_id, onu_serial, event_type, previous_state, current_state, payload, created_at')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (input.olt_id !== undefined) {
    query = query.eq('olt_id', input.olt_id)
  }
  if (input.onu_serial !== undefined && input.onu_serial !== '') {
    query = query.eq('onu_serial', input.onu_serial)
  }
  if (input.event_type !== undefined && input.event_type !== '') {
    query = query.eq('event_type', input.event_type)
  }

  const { data, error } = await query
  if (error) return []

  return (data ?? []) as NetworkEventRow[]
}

