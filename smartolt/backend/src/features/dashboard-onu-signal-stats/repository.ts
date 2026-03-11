import { supabase } from '@/shared/lib/supabase'
import type { DashboardOnuSignalStatsOutput } from './types'

type SignalSampleRow = {
  onu_id: number
  rx_dbm: number
  tx_dbm: number | null
  collected_at: string
}

export async function fetchDashboardOnuSignalStatsRepository(
  warning_threshold_dbm: number,
  critical_threshold_dbm: number
): Promise<DashboardOnuSignalStatsOutput> {
  const { data, error } = await supabase
    .from('onu_signal_samples')
    .select('onu_id, rx_dbm, tx_dbm, collected_at')
    .order('onu_id', { ascending: true })
    .order('collected_at', { ascending: false })

  if (error) {
    throw error
  }

  const latestByOnu = new Map<number, SignalSampleRow>()

  for (const row of (data ?? []) as SignalSampleRow[]) {
    if (!latestByOnu.has(row.onu_id)) {
      latestByOnu.set(row.onu_id, row)
    }
  }

  let sampled_onus = 0
  let weak_signal_onus = 0
  let critical_signal_onus = 0

  for (const sample of latestByOnu.values()) {
    sampled_onus += 1
    const rx = sample.rx_dbm

    if (rx <= critical_threshold_dbm) {
      critical_signal_onus += 1
    } else if (rx <= warning_threshold_dbm) {
      weak_signal_onus += 1
    }
  }

  return {
    sampled_onus,
    weak_signal_onus,
    critical_signal_onus,
    warning_threshold_dbm,
    critical_threshold_dbm,
  }
}
