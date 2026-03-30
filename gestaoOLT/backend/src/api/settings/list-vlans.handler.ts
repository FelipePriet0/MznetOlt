import type { ApiRequest, ApiResponse } from '../_shared/types'
import { ok } from '../_shared/http'
import { mapErrorToResponse } from '../_shared/errors'
import { executeListVlans } from '../../features/settings/list-vlans/service'

export async function listVlansHandler(_req: ApiRequest, res: ApiResponse): Promise<void> {
  try {
    const result = await executeListVlans({})
    ok(res, result)
  } catch (error) {
    mapErrorToResponse(res, error)
  }
}

