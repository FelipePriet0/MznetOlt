import { supabase } from '@/shared/lib/supabase'
import type { OnuSignalHistoryOutput } from './types'

type Row = {
  rx_dbm: number
  tx_dbm: number | null
  collected_at: string
}

export async function getOnuSignalHistoryRepository(id: number, limit: number): Promise<OnuSignalHistoryOutput> {
  const { data, error } = await supabase
    .from('onu_signal_samples')
    .select('rx_dbm, tx_dbm, collected_at')
    .eq('onu_id', id)
    .order('collected_at', { ascending: true })
    .limit(limit)

  if (error) throw error

  const items = (data ?? []).map((r: Row) => ({
    time: r.collected_at,
    rx: r.rx_dbm,
    tx: r.tx_dbm,
  }))

  return { items }
}

