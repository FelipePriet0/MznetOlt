import type { ApiRequest, ApiResponse } from '../_shared/types'
import { ok, badRequest } from '../_shared/http'
import { mapErrorToResponse } from '../_shared/errors'
import { executeGetOltHealth } from '../../features/olt/get-olt-health/service'

export async function getOltHealthHandler(req: ApiRequest, res: ApiResponse): Promise<void> {
  const olt_id = Number(req.params.id)
  if (!olt_id || isNaN(olt_id)) {
    badRequest(res, 'id must be a valid number')
    return
  }

  try {
    const result = await executeGetOltHealth({ olt_id })
    ok(res, result)
  } catch (error) {
    mapErrorToResponse(res, error)
  }
}
