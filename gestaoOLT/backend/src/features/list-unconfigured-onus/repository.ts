import { supabase } from '@/shared/lib/supabase'
import type { UnconfiguredOnuItem } from './types'

export async function listUnconfiguredOnusRepository(input: {
  olt_id?: number
  onu_serial?: string
  last_seen_at_from?: string
  last_seen_at_to?: string
  limit: number
  offset: number
}): Promise<UnconfiguredOnuItem[]> {
  const { olt_id, onu_serial, last_seen_at_from, last_seen_at_to, limit, offset } = input

  const from = offset
  const to = offset + limit - 1

  let query = supabase
    .from('onu_network_snapshots')
    .select('olt_id, onu_serial, onu_id, last_known_status, last_known_signal, last_seen_at')
    .eq('source', 'unconfigured_poll')
    .order('last_seen_at', { ascending: false })
    .range(from, to)

  if (olt_id !== undefined) {
    query = query.eq('olt_id', olt_id)
  }

  if (onu_serial !== undefined && onu_serial !== '') {
    query = query.ilike('onu_serial', `%${onu_serial}%`)
  }

  if (last_seen_at_from) {
    query = query.gte('last_seen_at', last_seen_at_from)
  }

  if (last_seen_at_to) {
    query = query.lte('last_seen_at', last_seen_at_to)
  }

  const { data, error } = await query
  if (error) return []

  return (data ?? []) as UnconfiguredOnuItem[]
}

