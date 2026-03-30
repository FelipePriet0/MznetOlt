import type { ApiRequest, ApiResponse } from '../_shared/types'
import { ok } from '../_shared/http'
import { mapErrorToResponse } from '../_shared/errors'
import { executeListZones } from '../../features/settings/list-zones/service'

export async function listZonesHandler(req: ApiRequest, res: ApiResponse): Promise<void> {
  try {
    const result = await executeListZones({})
    ok(res, result)
  } catch (error) {
    mapErrorToResponse(res, error)
  }
}
