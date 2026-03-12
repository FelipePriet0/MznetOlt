import type { ApiRequest, ApiResponse } from '../_shared/types'
import { ok, badRequest } from '../_shared/http'
import { mapErrorToResponse } from '../_shared/errors'
import { getOnuTrafficHistoryService } from '../../features/onu/get-onu-traffic-history/service'

export async function getOnuTrafficHistoryHandler(req: ApiRequest, res: ApiResponse): Promise<void> {
  const id = Number(req.params.id)
  if (!id || isNaN(id)) {
    badRequest(res, 'id must be a valid number')
    return
  }
  const limit = req.query.limit ? Number(req.query.limit) : undefined

  try {
    const result = await getOnuTrafficHistoryService({ id, limit })
    ok(res, result)
  } catch (error) {
    mapErrorToResponse(res, error)
  }
}

