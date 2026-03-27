import type {
  DashboardOnuAuthPerDayInput,
  DashboardOnuAuthPerDayOutput,
} from './types'
import { fetchOnuAuthPerDayRepository } from './repository'

export async function dashboardOnuAuthPerDayService(
  input: DashboardOnuAuthPerDayInput
): Promise<DashboardOnuAuthPerDayOutput> {
  let days = input.days ?? 30

  if (days <= 0) days = 30
  if (days > 365) days = 365

  const now = new Date()
  const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
  const startIso = start.toISOString()

  const items = await fetchOnuAuthPerDayRepository(startIso, input.olt_id)

  return { items }
}
