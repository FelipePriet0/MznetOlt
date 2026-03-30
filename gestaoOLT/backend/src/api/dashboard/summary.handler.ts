import type { ApiRequest, ApiResponse } from '../_shared/types'
import { ok } from '../_shared/http'
import { mapErrorToResponse } from '../_shared/errors'
import { executeDashboardSummary } from '../../features/dashboard-summary/service'

export async function dashboardSummaryHandler(_req: ApiRequest, res: ApiResponse): Promise<void> {
  try {
    const result = await executeDashboardSummary()
    ok(res, result)
  } catch (error) {
    mapErrorToResponse(res, error)
  }
}
