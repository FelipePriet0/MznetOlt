import { supabase } from '@/shared/lib/supabase'
import type { SignalPoint } from './types'

export async function getSignalHistoryRepository(input: { onu_id: number; limit: number; sinceIso?: string | null }): Promise<SignalPoint[]> {
  // Fetch OLT and serial for the ONU id
  const { data: onuRow, error: onuErr } = await supabase
    .from('onus')
    .select('olt_id, serial_number')
    .eq('id', input.onu_id)
    .single()
  if (onuErr) throw onuErr
  if (!onuRow) return []

  const { olt_id, serial_number } = onuRow as { olt_id: number; serial_number: string }

  // Try reading from history table if available
  try {
    let hq = supabase
      .from('onu_signal_history')
      .select('ts, rx_dbm, olt_id, onu_serial')
      .eq('olt_id', olt_id)
      .eq('onu_serial', serial_number)
      .order('ts', { ascending: true })
    if (input.sinceIso) hq = hq.gte('ts', input.sinceIso)
    else if (input.limit) hq = hq.limit(input.limit)
    const { data: hdata, error: herr } = await hq
    if (!herr && hdata && hdata.length) {
      return (hdata as any[]).map(r => ({ ts: r.ts, value: r.rx_dbm }))
    }
  } catch {
    // ignore and fallback
  }

  let query = supabase
    .from('onu_network_snapshots')
    .select('last_seen_at, last_known_signal')
    .eq('olt_id', olt_id)
    .eq('onu_serial', serial_number)
    .not('last_known_signal', 'is', null)
    .order('last_seen_at', { ascending: true })

  if (input.sinceIso) {
    query = query.gte('last_seen_at', input.sinceIso)
  } else if (input.limit) {
    query = query.limit(input.limit)
  }

  const { data, error } = await query

  if (error) throw error

  return (data ?? []).map((r: any) => ({ ts: r.last_seen_at, value: r.last_known_signal }))
}
