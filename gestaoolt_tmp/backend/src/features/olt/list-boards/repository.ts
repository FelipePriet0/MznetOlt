import { supabase } from '@/shared/lib/supabase'
import type { BoardItem } from './types'

export async function listBoardsByOltRepository(olt_id?: number): Promise<BoardItem[]> {
  let query = supabase
    .from('boards')
    .select(`
      id, name, slot_index, olt_id,
      board_type, board_hw_id, board_status, board_role, terminal_count,
      created_at, updated_at,
      pon_ports(count)
    `)
    .order('olt_id', { ascending: true })
    .order('slot_index', { ascending: true })

  if (olt_id !== undefined) query = query.eq('olt_id', olt_id)

  const { data, error } = await query
  if (error) throw error

  return (data ?? []).map((row: any) => ({
    ...row,
    pon_port_count: row.pon_ports?.[0]?.count ?? 0,
    pon_ports: undefined,
  })) as BoardItem[]
}
