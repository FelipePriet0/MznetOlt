import { supabase } from '@/shared/lib/supabase'
import type { OperationStatus } from '@/drivers/olt/base-driver'
import type { OnuNetworkSnapshotRow } from './types'

export async function createNetworkSyncRun(input: {
  olt_id: number
  job_name: string
  started_at: string
}): Promise<number | null> {
  const { data, error } = await supabase
    .from('network_sync_runs')
    .insert({
      olt_id: input.olt_id,
      job_name: input.job_name,
      started_at: input.started_at,
      status: 'running',
      stats_json: null,
    })
    .select('id')
    .single()

  if (error) {
    return null
  }

  return (data as { id: number }).id ?? null
}

export async function finalizeNetworkSyncRun(input: {
  run_id: number
  status: OperationStatus
  finished_at: string
  duration_ms: number
  stats_json: unknown
}): Promise<void> {
  await supabase
    .from('network_sync_runs')
    .update({
      status: input.status,
      finished_at: input.finished_at,
      duration_ms: input.duration_ms,
      stats_json: input.stats_json,
    })
    .eq('id', input.run_id)
}

export async function findOnuSnapshot(
  olt_id: number,
  onu_serial: string
): Promise<OnuNetworkSnapshotRow | null> {
  const { data, error } = await supabase
    .from('onu_network_snapshots')
    .select('*')
    .eq('olt_id', olt_id)
    .eq('onu_serial', onu_serial)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return data as OnuNetworkSnapshotRow
}

export async function upsertOnuSnapshot(input: {
  olt_id: number
  onu_serial: string
  source: string
  last_known_status: string | null
  last_known_signal: number | null
  last_seen_at: string
  raw_snapshot: unknown
}): Promise<OnuNetworkSnapshotRow | null> {
  const { data, error } = await supabase
    .from('onu_network_snapshots')
    .upsert(
      {
        olt_id: input.olt_id,
        onu_serial: input.onu_serial,
        source: input.source,
        last_known_status: input.last_known_status,
        last_known_signal: input.last_known_signal,
        last_seen_at: input.last_seen_at,
        raw_snapshot: input.raw_snapshot,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'olt_id,onu_serial' }
    )
    .select('*')
    .single()

  if (error) {
    return null
  }

  return data as OnuNetworkSnapshotRow
}

export async function insertNetworkEvent(input: {
  olt_id: number
  onu_serial: string
  event_type: string
  previous_state?: unknown
  current_state?: unknown
  payload?: unknown
}): Promise<number | null> {
  const { data, error } = await supabase
    .from('network_events')
    .insert({
      olt_id: input.olt_id,
      onu_serial: input.onu_serial,
      event_type: input.event_type,
      previous_state: input.previous_state ?? null,
      current_state: input.current_state ?? null,
      payload: input.payload ?? null,
    })
    .select('id')
    .single()

  if (error) {
    return null
  }

  return (data as { id: number }).id ?? null
}