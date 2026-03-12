import type { ApiRequest, ApiResponse } from '../_shared/types'
import { ok, badRequest } from '../_shared/http'
import { mapErrorToResponse } from '../_shared/errors'
import { getOnuDetailsService } from '../../features/onu/get-onu-details/service'

export async function getOnuDetailsHandler(req: ApiRequest, res: ApiResponse): Promise<void> {
  const id = Number(req.params.id)
  if (!id || isNaN(id)) {
    badRequest(res, 'id must be a valid number')
    return
  }

  try {
    const result = await getOnuDetailsService({ id })
    ok(res, result)
  } catch (error) {
    mapErrorToResponse(res, error)
  }
}
