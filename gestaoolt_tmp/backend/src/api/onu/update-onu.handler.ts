import type { ApiRequest, ApiResponse } from '../_shared/types'
import { ok, badRequest } from '../_shared/http'
import { mapErrorToResponse } from '../_shared/errors'
import { updateOnuService } from '../../features/onu/update-onu/service'

export async function updateOnuHandler(req: ApiRequest, res: ApiResponse): Promise<void> {
  const id = Number(req.params.id)
  if (!id || isNaN(id)) {
    badRequest(res, 'id must be a valid number')
    return
  }
  try {
    const result = await updateOnuService({ id, patch: req.body ?? {} })
    ok(res, { updated: result })
  } catch (error) {
    mapErrorToResponse(res, error)
  }
}

