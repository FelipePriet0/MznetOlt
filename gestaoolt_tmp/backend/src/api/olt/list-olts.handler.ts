import type { ApiRequest, ApiResponse } from '../_shared/types'
import { ok } from '../_shared/http'
import { mapErrorToResponse } from '../_shared/errors'
import { listOltsService } from '../../features/olt/list-olts/service'

export async function listOltsHandler(req: ApiRequest, res: ApiResponse): Promise<void> {
  const q = req.query
  const vendor = q.vendor || undefined
  const location_id = q.location_id ? Number(q.location_id) : undefined
  const zone_id = q.zone_id ? Number(q.zone_id) : undefined
  const search = q.search || undefined
  const page = q.page ? Number(q.page) : 1
  const page_size = q.page_size ? Number(q.page_size) : 50

  try {
    const result = await listOltsService({ vendor, location_id, zone_id, search, page, page_size })
    ok(res, result)
  } catch (error) {
    mapErrorToResponse(res, error)
  }
}
