import type { ApiRequest, ApiResponse } from '../_shared/types'
import { ok } from '../_shared/http'
import { mapErrorToResponse } from '../_shared/errors'
import { dashboardOnuSignalStatsService } from '../../features/dashboard-onu-signal-stats/service'

export async function dashboardOnuSignalStatsHandler(req: ApiRequest, res: ApiResponse): Promise<void> {
  const warning_threshold_dbm = req.query.warning_threshold_dbm
    ? Number(req.query.warning_threshold_dbm)
    : undefined
  const critical_threshold_dbm = req.query.critical_threshold_dbm
    ? Number(req.query.critical_threshold_dbm)
    : undefined

  try {
    const result = await dashboardOnuSignalStatsService({
      warning_threshold_dbm,
      critical_threshold_dbm,
    })
    ok(res, result)
  } catch (error) {
    mapErrorToResponse(res, error)
  }
}
