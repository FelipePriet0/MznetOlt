import type { ApiRequest, ApiResponse } from '../_shared/types'
import { ok } from '../_shared/http'
import { mapErrorToResponse } from '../_shared/errors'
import { dashboardSyncStatusService } from '../../features/dashboard-sync-status/service'

export async function dashboardSyncStatusHandler(_req: ApiRequest, res: ApiResponse): Promise<void> {
  try {
    const result = await dashboardSyncStatusService()
    ok(res, result)
  } catch (error) {
    mapErrorToResponse(res, error)
  }
}
