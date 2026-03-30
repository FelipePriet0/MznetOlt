import type { DashboardSyncStatusOutput } from './types'
import { fetchDashboardSyncStatusRepository } from './repository'

export async function dashboardSyncStatusService(): Promise<DashboardSyncStatusOutput> {
  return fetchDashboardSyncStatusRepository()
}