import type { ApiRequest, ApiResponse } from '../_shared/types'
import { ok, badRequest } from '../_shared/http'
import { mapErrorToResponse } from '../_shared/errors'
import { getOnuSignalHistoryService } from '../../features/onu/get-onu-signal-history/service'

export async function getOnuSignalHistoryHandler(req: ApiRequest, res: ApiResponse): Promise<void> {
  const id = Number(req.params.id)
  if (!id || isNaN(id)) {
    badRequest(res, 'id must be a valid number')
    return
  }
  const limit = req.query.limit ? Number(req.query.limit) : undefined

  try {
    const result = await getOnuSignalHistoryService({ id, limit })
    ok(res, result)
  } catch (error) {
    mapErrorToResponse(res, error)
  }
}

