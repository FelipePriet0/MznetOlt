import type { ApiRequest, ApiResponse } from '../_shared/types'
import { ok } from '../_shared/http'
import { mapErrorToResponse } from '../_shared/errors'
import { dashboardRecentEventsService } from '../../features/dashboard-recent-events/service'

export async function dashboardRecentEventsHandler(req: ApiRequest, res: ApiResponse): Promise<void> {
  const limit = req.query.limit ? Number(req.query.limit) : undefined

  try {
    const result = await dashboardRecentEventsService({ limit })
    ok(res, result)
  } catch (error) {
    mapErrorToResponse(res, error)
  }
}
