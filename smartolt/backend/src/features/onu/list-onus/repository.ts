import { supabase } from '@/shared/lib/supabase'
import type { ListOnusInput, OnuItem, OnuRow } from './types'

export async function listOnusRepository(
  input: Required<Pick<ListOnusInput, 'page' | 'page_size'>> & Omit<ListOnusInput, 'page' | 'page_size'>
): Promise<{ data: OnuItem[]; total: number }> {
  const { olt_id, board_id, pon_port_id, status, admin_state, serial_number, page, page_size } = input

  const from = (page - 1) * page_size
  const to = from + page_size - 1

  let query = supabase
    .from('onus')
    .select(
      'id, serial_number, status, admin_state, last_known_signal, last_seen_at, olt_id, board_id, pon_port_id, onu_type_id, created_at, olts(name), boards(name), pon_ports(name), onu_types(vendor, model)',
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range(from, to)

  if (olt_id !== undefined) query = query.eq('olt_id', olt_id)
  if (board_id !== undefined) query = query.eq('board_id', board_id)
  if (pon_port_id !== undefined) query = query.eq('pon_port_id', pon_port_id)
  if (status !== undefined) query = query.eq('status', status)
  if (admin_state !== undefined) query = query.eq('admin_state', admin_state)
  if (serial_number !== undefined) query = query.ilike('serial_number', `%${serial_number}%`)

  const { data, count, error } = await query

  if (error) throw error

  const items = (data as unknown as OnuRow[]).map((row) => ({
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
    pon_port_id: row.pon_port_id,
    pon_port_name: row.pon_ports.name,
    onu_type_id: row.onu_type_id,
    onu_vendor: row.onu_types?.vendor ?? null,
    onu_model: row.onu_types?.model ?? null,
    created_at: row.created_at,
  }))

  return { data: items, total: count ?? 0 }
}
