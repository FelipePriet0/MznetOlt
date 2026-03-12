import type { ApiRequest, ApiResponse } from '../_shared/types'
import { ok, forbidden } from '../_shared/http'
import { mapErrorToResponse } from '../_shared/errors'
import { authorizeOnuService } from '../../features/authorization/authorize-onu/service'

export async function authorizeOnuHandler(req: ApiRequest, res: ApiResponse): Promise<void> {
  const body = req.body as Record<string, unknown>
  const onu_id = typeof body?.onu_id === 'number' ? body.onu_id : Number(body?.onu_id)
  const preset_id = body?.preset_id !== undefined ? Number(body.preset_id) : undefined

  if (!onu_id || isNaN(onu_id)) {
    const { badRequest } = await import('../_shared/http')
    badRequest(res, 'onu_id is required and must be a number')
    return
  }

  try {
    const result = await authorizeOnuService({ onu_id, preset_id })
    ok(res, result)
  } catch (error) {
    mapErrorToResponse(res, error)
  }
}
