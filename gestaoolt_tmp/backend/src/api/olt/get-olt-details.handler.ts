import type { ApiRequest, ApiResponse } from '../_shared/types'
import { ok, badRequest } from '../_shared/http'
import { mapErrorToResponse } from '../_shared/errors'
import { getOltDetailsService } from '../../features/olt/get-olt-details/service'

export async function getOltDetailsHandler(req: ApiRequest, res: ApiResponse): Promise<void> {
  const id = Number(req.params.id)
  if (!id || isNaN(id)) {
    badRequest(res, 'id must be a valid number')
    return
  }

  try {
    const result = await getOltDetailsService({ id })
    ok(res, result)
  } catch (error) {
    mapErrorToResponse(res, error)
  }
}
