import { supabase } from '@/shared/lib/supabase'
import type { OnuDetailsOutput } from './types'

type Row = {
  id: number
  serial_number: string
  status: string
  admin_state: string
  last_known_signal: number | null
  last_seen_at: string | null
  olt_id: number
  board_id: number
  pon_port_id: number
  onu_index: number | null
  onu_type_id: number | null
  created_at: string
  updated_at: string
  name: string | null
  address: string | null
  contact: string | null
  external_id: string | null
  latitude: number | null
  longitude: number | null
  pon_type: string | null
  mode: string | null
  vlan_id: number | null
  tr069_enabled: boolean | null
  voip_enabled: boolean | null
  catv_enabled: boolean | null
  mgmt_ip: string | null
  odb_id: number | null
  zone_id: number | null
  odb_port: string | null
  tr069_profile: string | null
  service_port_id: number | null
  download_profile: string | null
  upload_profile: string | null
  olts: { name: string }
  boards: { name: string }
  pon_ports: { name: string }
  onu_types: { vendor: string; model: string } | null
  odbs?: { name: string } | null
  zones?: { name: string } | null
}

export async function getOnuDetailsRepository(id: number): Promise<OnuDetailsOutput | null> {
  const { data, error } = await supabase
    .from('onus')
    .select('id, serial_number, status, admin_state, last_known_signal, last_seen_at, olt_id, board_id, pon_port_id, onu_index, onu_type_id, created_at, updated_at, name, address, contact, external_id, latitude, longitude, pon_type, mode, vlan_id, tr069_enabled, voip_enabled, catv_enabled, mgmt_ip, odb_id, zone_id, odb_port, tr069_profile, service_port_id, download_profile, upload_profile, olts(name), boards(name), pon_ports(name), zones(name)')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  const row = data as unknown as Row
  return {
    id: row.id,
    serial_number: row.serial_number,
    status: row.status,
    admin_state: row.admin_state,
    last_known_signal: row.last_known_signal,
    last_seen_at: row.last_seen_at,
    olt_id: row.olt_id,
    olt_name: row.olts.name,
    board_id: row.board_id,
    board_name: row.boards.name,
    board_slot_index: null,
    pon_port_id: row.pon_port_id,
    pon_port_name: row.pon_ports.name,
    pon_index: null,
    onu_index: row.onu_index ?? null,
    onu_type_id: row.onu_type_id,
    onu_vendor: null,
    onu_model: null,
    name: row.name ?? null,
    address: row.address ?? null,
    contact: row.contact ?? null,
    external_id: row.external_id ?? null,
    latitude: row.latitude ?? null,
    longitude: row.longitude ?? null,
    pon_type: row.pon_type ?? null,
    mode: row.mode ?? null,
    vlan_id: row.vlan_id ?? null,
    tr069_enabled: row.tr069_enabled ?? null,
    voip_enabled: row.voip_enabled ?? null,
    catv_enabled: row.catv_enabled ?? null,
    mgmt_ip: row.mgmt_ip ?? null,
    odb_id: row.odb_id ?? null,
    odb_name: null,
    zone_id: row.zone_id ?? null,
    zone_name: row.zones?.name ?? null,
    odb_port: row.odb_port ?? null,
    tr069_profile: row.tr069_profile ?? null,
    service_port_id: row.service_port_id ?? null,
    download_profile: row.download_profile ?? null,
    upload_profile: row.upload_profile ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}
