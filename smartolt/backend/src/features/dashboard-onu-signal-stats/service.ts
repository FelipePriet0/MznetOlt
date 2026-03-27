import type {
  DashboardOnuSignalStatsInput,
  DashboardOnuSignalStatsOutput,
} from './types'
import { fetchDashboardOnuSignalStatsRepository } from './repository'

export async function dashboardOnuSignalStatsService(
  input: DashboardOnuSignalStatsInput
): Promise<DashboardOnuSignalStatsOutput> {
  const warning = input.warning_threshold_dbm ?? -24
  const critical = input.critical_threshold_dbm ?? -27

  return fetchDashboardOnuSignalStatsRepository(warning, critical)
}