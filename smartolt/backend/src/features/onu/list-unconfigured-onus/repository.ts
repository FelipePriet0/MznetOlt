import { supabase } from '@/shared/lib/supabase'
import type { ListUnconfiguredOnusInput, UnconfiguredOnuItem, UnconfiguredOnuRow } from './types'

export async function listUnconfiguredOnusRepository(
  input: Required<Pick<ListUnconfiguredOnusInput, 'page' | 'page_size'>> & Omit<ListUnconfiguredOnusInput, 'page' | 'page_size'>
): Promise<{ data: UnconfiguredOnuItem[]; total: number }> {
  const { olt_id, board_id, pon_port_id, serial_number, page, page_size } = input

  const from = (page - 1) * page_size
  const to = from + page_size - 1

  let query = supabase
    .from('onus')
    .select(
      'id, serial_number, olt_id, board_id, pon_port_id, status, admin_state, last_known_signal, last_seen_at, created_at, olts(name), boards(name), pon_ports(name)',
      { count: 'exact' }
    )
    .eq('admin_state', 'unconfigured')
    .order('created_at', { ascending: false })
    .range(from, to)

  if (olt_id !== undefined) query = query.eq('olt_id', olt_id)
  if (board_id !== undefined) query = query.eq('board_id', board_id)
  if (pon_port_id !== undefined) query = query.eq('pon_port_id', pon_port_id)
  if (serial_number !== undefined) query = query.ilike('serial_number', `%${serial_number}%`)

  const { data, count, error } = await query

  if (error) throw error

  const items = (data as unknown as UnconfiguredOnuRow[]).map((row) => ({
    id: row.id,
    serial_number: row.serial_number,
    olt_id: row.olt_id,
    olt_name: row.olts.name,
    board_id: row.board_id,
    board_name: row.boards.name,
    pon_port_id: row.pon_port_id,
    pon_port_name: row.pon_ports.name,
    status: row.status,
    admin_state: row.admin_state,
    last_known_signal: row.last_known_signal,
    last_seen_at: row.last_seen_at,
    created_at: row.created_at,
  }))

  return { data: items, total: count ?? 0 }
}
