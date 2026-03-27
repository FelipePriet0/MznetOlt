import { supabase } from '@/shared/lib/supabase'
import type { PonPortItem } from './types'

export async function listPonPortsByBoardRepository(board_id?: number): Promise<PonPortItem[]> {
  let query = supabase
    .from('pon_ports')
    .select('id, name, pon_index, board_id')
    .order('board_id', { ascending: true })
    .order('pon_index', { ascending: true })

  if (board_id !== undefined) query = query.eq('board_id', board_id)

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as PonPortItem[]
}

