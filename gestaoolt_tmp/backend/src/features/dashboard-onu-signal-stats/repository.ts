import { supabase } from '@/shared/lib/supabase'
import type { DashboardOnuSignalStatsOutput } from './types'

export async function fetchDashboardOnuSignalStatsRepository(
  warning_threshold_dbm: number,
  critical_threshold_dbm: number
): Promise<DashboardOnuSignalStatsOutput> {
  // Lê last_known_signal da tabela onus (valor mais recente persitido)
  const { data, error } = await supabase
    .from('onus')
    .select('last_known_signal')
    .not('last_known_signal', 'is', null)

  if (error) throw error

  let sampled_onus = 0
  let weak_signal_onus = 0
  let critical_signal_onus = 0

  for (const row of (data ?? []) as { last_known_signal: number }[]) {
    sampled_onus += 1
    const rx = row.last_known_signal
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
