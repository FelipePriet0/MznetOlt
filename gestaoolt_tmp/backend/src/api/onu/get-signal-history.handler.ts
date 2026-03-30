import type { ApiRequest, ApiResponse } from '../_shared/types'
import { ok, badRequest } from '../_shared/http'
import { mapErrorToResponse } from '../_shared/errors'
import { getSignalHistoryService } from '../../features/onu/get-signal-history/service'

export async function getSignalHistoryHandler(req: ApiRequest, res: ApiResponse): Promise<void> {
  const id = Number(req.params.id)
  if (!id || Number.isNaN(id)) {
    badRequest(res, 'id must be a valid number')
    return
  }
  const q = req.query || {}
  const limit = q.limit ? Number(q.limit) : undefined
  const period = (q.period === 'day' || q.period === 'week' || q.period === 'month' || q.period === 'year') ? (q.period as any) : undefined
  try {
    const result = await getSignalHistoryService({ onu_id: id, limit, period })
    ok(res, result)
  } catch (error) {
    mapErrorToResponse(res, error)
  }
}
