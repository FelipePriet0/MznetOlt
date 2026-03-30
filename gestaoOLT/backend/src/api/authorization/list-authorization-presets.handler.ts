import type { ApiRequest, ApiResponse } from '../_shared/types'
import { ok } from '../_shared/http'
import { mapErrorToResponse } from '../_shared/errors'
import { listAuthorizationPresetsService } from '../../features/authorization/list-authorization-presets/service'

export async function listAuthorizationPresetsHandler(req: ApiRequest, res: ApiResponse): Promise<void> {
  const q = req.query
  const is_active = q.is_active !== undefined ? q.is_active === 'true' : undefined
  const is_default = q.is_default !== undefined ? q.is_default === 'true' : undefined
  const search = q.search || undefined
  const page = q.page ? Number(q.page) : 1
  const page_size = q.page_size ? Number(q.page_size) : 50

  try {
    const result = await listAuthorizationPresetsService({ is_active, is_default, search, page, page_size })
    ok(res, result)
  } catch (error) {
    mapErrorToResponse(res, error)
  }
}
