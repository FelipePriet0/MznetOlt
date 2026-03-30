import type { ApiRequest, ApiResponse } from '../_shared/types'
import { ok, badRequest } from '../_shared/http'
import { mapErrorToResponse } from '../_shared/errors'
import { dashboardNetworkStatusService } from '../../features/dashboard-network-status/service'
import type { NetworkStatusGranularity } from '../../features/dashboard-network-status/types'

export async function dashboardNetworkStatusHandler(req: ApiRequest, res: ApiResponse): Promise<void> {
  try {
    const q = req.query
    const gran = (q.granularity as NetworkStatusGranularity) || 'day'
    const olt_id = q.olt_id ? Number(q.olt_id) : undefined
    if ((q.olt_id && Number.isNaN(olt_id)) || !['hour','day','week','month','year'].includes(gran)) {
      return badRequest(res, 'invalid granularity or olt_id')
    }
    const result = await dashboardNetworkStatusService({ granularity: gran, olt_id })
    ok(res, result)
  } catch (error) {
    mapErrorToResponse(res, error)
  }
}

