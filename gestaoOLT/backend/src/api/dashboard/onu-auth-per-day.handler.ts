import type { ApiRequest, ApiResponse } from '../_shared/types'
import { ok, badRequest } from '../_shared/http'
import { mapErrorToResponse } from '../_shared/errors'
import { dashboardOnuAuthPerDayService } from '../../features/dashboard-onu-auth-per-day/service'

export async function dashboardOnuAuthPerDayHandler(req: ApiRequest, res: ApiResponse): Promise<void> {
  try {
    const q = req.query
    const days = q.days ? Number(q.days) : undefined
    const olt_id = q.olt_id ? Number(q.olt_id) : undefined
    if ((q.days && Number.isNaN(days)) || (q.olt_id && Number.isNaN(olt_id))) {
      return badRequest(res, 'days/olt_id must be numbers')
    }
    const result = await dashboardOnuAuthPerDayService({ days, olt_id })
    ok(res, result)
  } catch (error) {
    mapErrorToResponse(res, error)
  }
}

