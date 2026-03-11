import type {
  DashboardOnuSignalStatsInput,
  DashboardOnuSignalStatsOutput,
} from './types'
import { fetchDashboardOnuSignalStatsRepository } from './repository'

export async function dashboardOnuSignalStatsService(
  input: DashboardOnuSignalStatsInput
): Promise<DashboardOnuSignalStatsOutput> {
  const warning = input.warning_threshold_dbm ?? -25
  const critical = input.critical_threshold_dbm ?? -28

  return fetchDashboardOnuSignalStatsRepository(warning, critical)
}