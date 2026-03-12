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
  onu_type_id: number | null
  created_at: string
  updated_at: string
  olts: { name: string }
  boards: { name: string; slot_index: number }
  pon_ports: { name: string; pon_index: number }
  onu_types: { vendor: string; model: string } | null
}

export async function getOnuDetailsRepository(id: number): Promise<OnuDetailsOutput | null> {
  const { data, error } = await supabase
    .from('onus')
    .select(
      'id, serial_number, status, admin_state, last_known_signal, last_seen_at, olt_id, board_id, pon_port_id, onu_type_id, created_at, updated_at, olts(name), boards(name, slot_index), pon_ports(name, pon_index), onu_types(vendor, model)'
    )
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
    board_slot_index: row.boards.slot_index,
    pon_port_id: row.pon_port_id,
    pon_port_name: row.pon_ports.name,
    pon_index: row.pon_ports.pon_index,
    onu_type_id: row.onu_type_id,
    onu_vendor: row.onu_types?.vendor ?? null,
    onu_model: row.onu_types?.model ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

