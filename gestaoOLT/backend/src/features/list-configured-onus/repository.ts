import { supabase } from '@/shared/lib/supabase'
import type { ConfiguredOnuItem } from './types'

type ListConfiguredOnusRepositoryInput = {
  olt_id?: number
  last_known_status?: string
  onu_serial?: string
  limit: number
  offset: number
}

export async function listConfiguredOnusRepository(
  input: ListConfiguredOnusRepositoryInput
): Promise<ConfiguredOnuItem[]> {
  const { olt_id, last_known_status, onu_serial, limit, offset } = input

  const from = offset
  const to = offset + limit - 1

  let query = supabase
    .from('onu_network_snapshots')
    .select(
      'olt_id, onu_serial, onu_id, last_known_status, last_known_signal, last_seen_at'
    )
    .eq('source', 'configured_poll')
    .order('last_seen_at', { ascending: false })
    .range(from, to)

  if (olt_id !== undefined) {
    query = query.eq('olt_id', olt_id)
  }

  if (last_known_status !== undefined && last_known_status !== '') {
    query = query.eq('last_known_status', last_known_status)
  }

  if (onu_serial !== undefined && onu_serial !== '') {
    query = query.ilike('onu_serial', `%${onu_serial}%`)
  }

  const { data, error } = await query

  if (error) {
    return []
  }

  return (data ?? []) as ConfiguredOnuItem[]
}