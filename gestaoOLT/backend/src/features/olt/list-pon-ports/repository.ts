import { supabase } from '@/shared/lib/supabase'
import type { PonPortItem } from './types'

type RawPort = {
  id: number
  name: string
  pon_index: number
  board_id: number
  admin_state: string
  description: string | null
  min_range_meters: number
  max_range_meters: number
}

type OnuRow = { pon_port_id: number; status: string }
type SignalRow = { onu_id: number; rx_dbm: number }
type OnuIdRow = { id: number; pon_port_id: number }

export async function listPonPortsByBoardRepository(board_id?: number): Promise<PonPortItem[]> {
  let query = supabase
    .from('pon_ports')
    .select('id, name, pon_index, board_id, admin_state, description, min_range_meters, max_range_meters')
    .order('board_id', { ascending: true })
    .order('pon_index', { ascending: true })

  if (board_id !== undefined) query = query.eq('board_id', board_id)

  const { data: ports, error } = await query
  if (error) throw error
  if (!ports?.length) return []

  const portIds = (ports as RawPort[]).map(p => p.id)

  // ONU counts per port
  const { data: onuRows } = await supabase
    .from('onus')
    .select('pon_port_id, status')
    .in('pon_port_id', portIds)

  const totalByPort = new Map<number, number>()
  const onlineByPort = new Map<number, number>()
  for (const row of (onuRows ?? []) as OnuRow[]) {
    totalByPort.set(row.pon_port_id, (totalByPort.get(row.pon_port_id) ?? 0) + 1)
    if (row.status === 'online') {
      onlineByPort.set(row.pon_port_id, (onlineByPort.get(row.pon_port_id) ?? 0) + 1)
    }
  }

  // ONU ids per port for signal query
  const { data: onuIdRows } = await supabase
    .from('onus')
    .select('id, pon_port_id')
    .in('pon_port_id', portIds)

  const onuIds = (onuIdRows ?? []).map((r: OnuIdRow) => r.id)
  const onuToPort = new Map<number, number>()
  for (const r of (onuIdRows ?? []) as OnuIdRow[]) {
    onuToPort.set(r.id, r.pon_port_id)
  }

  // Avg rx_dbm: most recent sample per ONU, then avg per port
  const rxSumByPort = new Map<number, number>()
  const rxCountByPort = new Map<number, number>()

  if (onuIds.length) {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { data: signals, error: signalError } = await supabase
      .from('onu_signal_samples')
      .select('onu_id, rx_dbm')
      .in('onu_id', onuIds)
      .gte('collected_at', since)
      .not('rx_dbm', 'is', null)

    if (signalError) {
      // Tabela pode não existir dependendo da versão do banco — ignora silenciosamente
      console.warn('[list-pon-ports] onu_signal_samples indisponível:', signalError.message)
    }

    for (const row of (signals ?? []) as SignalRow[]) {
      const portId = onuToPort.get(row.onu_id)
      if (!portId) continue
      rxSumByPort.set(portId, (rxSumByPort.get(portId) ?? 0) + row.rx_dbm)
      rxCountByPort.set(portId, (rxCountByPort.get(portId) ?? 0) + 1)
    }
  }

  return (ports as RawPort[]).map(p => {
    const count = rxCountByPort.get(p.id) ?? 0
    const avg_rx_dbm = count > 0 ? (rxSumByPort.get(p.id)! / count) : null
    return {
      id: p.id,
      name: p.name,
      pon_index: p.pon_index,
      board_id: p.board_id,
      admin_state: p.admin_state,
      description: p.description,
      min_range_meters: p.min_range_meters,
      max_range_meters: p.max_range_meters,
      onu_total: totalByPort.get(p.id) ?? 0,
      onu_online: onlineByPort.get(p.id) ?? 0,
      avg_rx_dbm: avg_rx_dbm !== null ? Math.round(avg_rx_dbm * 10) / 10 : null,
    }
  })
}
