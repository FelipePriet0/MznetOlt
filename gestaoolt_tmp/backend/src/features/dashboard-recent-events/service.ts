import type {
  DashboardRecentEventsInput,
  DashboardRecentEventsOutput,
} from './types'
import { listDashboardRecentEventsRepository } from './repository'

export async function dashboardRecentEventsService(
  input: DashboardRecentEventsInput
): Promise<DashboardRecentEventsOutput> {
  let limit = input.limit ?? 20

  if (limit <= 0) limit = 20
  if (limit > 100) limit = 100

  const items = await listDashboardRecentEventsRepository(limit)

  return { items }
}