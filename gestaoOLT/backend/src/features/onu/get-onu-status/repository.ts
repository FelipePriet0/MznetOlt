import { supabase } from '@/shared/lib/supabase'
import type { OnuStatusOutput } from './types'

export async function getOnuStatusRepository(id: number): Promise<OnuStatusOutput | null> {
  const { data, error } = await supabase
    .from('onus')
    .select('id, status, admin_state, last_seen_at, last_known_signal, serial_number, name, mgmt_ip, tr069_enabled, catv_enabled, voip_enabled, mode, vlan_id, download_profile, upload_profile, service_port_id, created_at, onu_index, olt_id')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  const row = data as any

  // Try to get latest signal sample (rx + tx)
  let rx_dbm: number | null = row.last_known_signal ?? null
  let tx_dbm: number | null = null
  let signal_ts: string | null = row.last_seen_at ?? null

  try {
    const { data: sigData } = await supabase
      .from('onu_signal_history')
      .select('rx_dbm, ts')
      .eq('onu_id', id)
      .order('ts', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (sigData) {
      rx_dbm = (sigData as any).rx_dbm ?? rx_dbm
      signal_ts = (sigData as any).ts ?? signal_ts
    }
  } catch { /* use fallback from onus row */ }

  return {
    id: row.id,
    status: row.status,
    admin_state: row.admin_state,
    last_seen_at: row.last_seen_at,
    rx_dbm,
    tx_dbm,
    signal_ts,
    serial_number: row.serial_number,
    name: row.name,
    mgmt_ip: row.mgmt_ip,
    tr069_enabled: row.tr069_enabled,
    catv_enabled: row.catv_enabled,
    voip_enabled: row.voip_enabled,
    mode: row.mode,
    vlan_id: row.vlan_id,
    download_profile: row.download_profile,
    upload_profile: row.upload_profile,
    service_port_id: row.service_port_id,
    created_at: row.created_at,
    onu_index: row.onu_index,
  }
}
