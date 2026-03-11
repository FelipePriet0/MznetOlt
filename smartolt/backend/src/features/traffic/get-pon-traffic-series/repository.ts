import { supabase } from '@/shared/lib/supabase'
import type {
  TrafficPonSeriesInput,
  TrafficPonSeriesItem,
  TrafficPonSeriesOutput,
} from './types'

type SampleRow = {
  collected_at: string
  rx_bytes: number | null
  tx_bytes: number | null
  onus: {
    pon_port_id: number
    pon_ports: {
      id: number
      olt_id: number
    } | null
  } | null
}

export async function getPonTrafficSeries(
  input: TrafficPonSeriesInput
): Promise<TrafficPonSeriesOutput> {
  const { data, error } = await supabase
    .from('onu_traffic_samples')
    .select(`
      collected_at,
      rx_bytes,
      tx_bytes,
      onus (
        pon_port_id,
        pon_ports (
          id,
          olt_id
        )
      )
    `)
    .gte('collected_at', input.start_at)
    .lte('collected_at', input.end_at)

  if (error) {
    throw error
  }

  const rows = (data ?? []) as unknown as SampleRow[]

  const filtered = rows.filter((row) => {
    const ponPort = row.onus?.pon_ports

    if (!ponPort) return false
    if (input.olt_id !== undefined && ponPort.olt_id !== input.olt_id) return false
    if (input.pon_port_id !== undefined && ponPort.id !== input.pon_port_id) return false

    return true
  })

  const aggregated = new Map<string, { download_bytes: number; upload_bytes: number }>()

  for (const row of filtered) {
    const key = row.collected_at
    const current = aggregated.get(key) ?? { download_bytes: 0, upload_bytes: 0 }

    aggregated.set(key, {
      download_bytes: current.download_bytes + (row.rx_bytes ?? 0),
      upload_bytes: current.upload_bytes + (row.tx_bytes ?? 0),
    })
  }

  const items: TrafficPonSeriesItem[] = Array.from(aggregated.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([collected_at, totals]) => ({
      collected_at,
      download_bytes: totals.download_bytes,
      upload_bytes: totals.upload_bytes,
    }))

  return { items }
}

