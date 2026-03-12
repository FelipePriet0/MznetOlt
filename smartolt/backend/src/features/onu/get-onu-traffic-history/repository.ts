import { supabase } from '@/shared/lib/supabase'
import type { OnuTrafficHistoryOutput } from './types'

type Row = {
  rx_bytes: number
  tx_bytes: number
  collected_at: string
}

export async function getOnuTrafficHistoryRepository(id: number, limit: number): Promise<OnuTrafficHistoryOutput> {
  const { data, error } = await supabase
    .from('onu_traffic_samples')
    .select('rx_bytes, tx_bytes, collected_at')
    .eq('onu_id', id)
    .order('collected_at', { ascending: true })
    .limit(limit)

  if (error) throw error

  const items = (data ?? []).map((r: Row) => ({
    time: r.collected_at,
    download: r.rx_bytes,
    upload: r.tx_bytes,
  }))

  return { items }
}

