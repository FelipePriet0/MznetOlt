import { supabase } from '@/shared/lib/supabase'
import type { NetworkSyncRunRow } from './types'

export async function getLastSyncRunByOlt(olt_id: number): Promise<NetworkSyncRunRow | null> {
  const { data, error } = await supabase
    .from('network_sync_runs')
    .select('id, olt_id, job_name, status, started_at, finished_at, duration_ms, error_message, stats_json')
    .eq('olt_id', olt_id)
    .order('started_at', { ascending: false })
    .limit(1)
    .single()

  if (error) return null

  return data as NetworkSyncRunRow
}

