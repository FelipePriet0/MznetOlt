import type { ApiRequest, ApiResponse } from '../_shared/types'
import { ok, badRequest } from '../_shared/http'
import { mapErrorToResponse } from '../_shared/errors'
import { getOnuEventsService } from '../../features/onu/get-onu-events/service'

export async function getOnuEventsHandler(req: ApiRequest, res: ApiResponse): Promise<void> {
  const id = Number(req.params.id)
  if (!id || Number.isNaN(id)) {
    badRequest(res, 'id must be a valid number')
    return
  }
  const limit = req.query?.limit ? Number(req.query.limit) : 5
  try {
    const result = await getOnuEventsService({ onu_id: id, limit })
    ok(res, result)
  } catch (error) {
    mapErrorToResponse(res, error)
  }
}
