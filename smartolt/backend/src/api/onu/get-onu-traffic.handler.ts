import type { ApiRequest, ApiResponse } from '../_shared/types'
import { ok, badRequest } from '../_shared/http'
import { mapErrorToResponse } from '../_shared/errors'
import { getOnuTrafficService } from '@/features/onu/get-onu-traffic/service'

export async function getOnuTrafficHandler(req: ApiRequest, res: ApiResponse): Promise<void> {
  const id = Number(req.params.id)
  if (!id || isNaN(id)) return badRequest(res, 'id must be a valid number')

  const limit = req.query?.limit ? Number(req.query.limit) : 60

  try {
    const result = await getOnuTrafficService({ id, limit })
    ok(res, result)
  } catch (error) {
    mapErrorToResponse(res, error)
  }
}
