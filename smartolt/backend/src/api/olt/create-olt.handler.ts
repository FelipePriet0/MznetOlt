import type { ApiRequest, ApiResponse } from '../_shared/types'
import { created, badRequest, forbidden } from '../_shared/http'
import { mapErrorToResponse } from '../_shared/errors'
import { createOltService } from '../../features/olt/create-olt/service'

export async function createOltHandler(req: ApiRequest, res: ApiResponse): Promise<void> {
  if (req.user?.role_code !== 'admin') {
    forbidden(res, 'Only admins can create OLTs')
    return
  }

  const body = req.body as Record<string, unknown>
  const name = typeof body?.name === 'string' ? body.name.trim() : null
  const vendor = typeof body?.vendor === 'string' ? body.vendor.trim() : null
  const mgmt_ip = typeof body?.mgmt_ip === 'string' ? body.mgmt_ip.trim() : null
  const location_id = typeof body?.location_id === 'number' ? body.location_id : null
  const zone_id = typeof body?.zone_id === 'number' ? body.zone_id : null

  if (!name || !vendor || !mgmt_ip || !location_id || !zone_id) {
    badRequest(res, 'name, vendor, mgmt_ip, location_id and zone_id are required')
    return
  }

  try {
    const result = await createOltService({ name, vendor, mgmt_ip, location_id, zone_id })
    created(res, result)
  } catch (error) {
    mapErrorToResponse(res, error)
  }
}
