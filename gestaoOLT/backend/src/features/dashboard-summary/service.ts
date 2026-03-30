import { getDashboardSummary } from './repository'
import type { DashboardSummaryOutput } from './types'

export async function executeDashboardSummary(): Promise<DashboardSummaryOutput> {
  return getDashboardSummary()
}
