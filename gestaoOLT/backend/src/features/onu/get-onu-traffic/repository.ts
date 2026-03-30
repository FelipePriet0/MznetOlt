import { supabase } from '@/shared/lib/supabase'
import type { GetOnuTrafficOutput } from './types'

export async function getOnuTrafficRepository(id: number, limit = 60): Promise<GetOnuTrafficOutput> {
  const { data, error } = await supabase
    .from('onu_traffic_samples')
    .select('collected_at, rx_mbps, tx_mbps')
    .eq('onu_id', id)
    .order('collected_at', { ascending: false })
    .limit(limit)

  if (error) throw error

  const items = ((data ?? []) as any[])
    .reverse()
    .map(r => ({
      collected_at: r.collected_at as string,
      rx_mbps: r.rx_mbps != null ? Number(r.rx_mbps) : null,
      tx_mbps: r.tx_mbps != null ? Number(r.tx_mbps) : null,
    }))

  const rxVals = items.map(i => i.rx_mbps).filter((v): v is number => v != null)
  const txVals = items.map(i => i.tx_mbps).filter((v): v is number => v != null)
  const avg = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null

  return {
    items,
    stats: {
      rx_max: rxVals.length ? Math.max(...rxVals) : null,
      tx_max: txVals.length ? Math.max(...txVals) : null,
      rx_avg: avg(rxVals),
      tx_avg: avg(txVals),
    },
  }
}
