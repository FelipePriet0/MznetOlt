import type { ApiRequest, ApiResponse } from '../_shared/types'
import { ok, badRequest } from '../_shared/http'
import { mapErrorToResponse } from '../_shared/errors'
import { disableOnuService } from '../../features/onu/disable-onu/service'

export async function disableOnuHandler(req: ApiRequest, res: ApiResponse): Promise<void> {
  const { id } = (req.body ?? {}) as { id?: unknown }
  const parsed = Number(id)
  if (!parsed || isNaN(parsed)) {
    badRequest(res, 'id must be a valid number')
    return
  }
  try {
    const result = await disableOnuService({ id: parsed })
    ok(res, result)
  } catch (error) {
    mapErrorToResponse(res, error)
  }
}

