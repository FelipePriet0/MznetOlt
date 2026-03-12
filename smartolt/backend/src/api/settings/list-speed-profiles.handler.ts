import type { ApiRequest, ApiResponse } from '../_shared/types'
import { ok } from '../_shared/http'
import { mapErrorToResponse } from '../_shared/errors'
import { executeListSpeedProfiles } from '../../features/settings/list-speed-profiles/service'

export async function listSpeedProfilesHandler(req: ApiRequest, res: ApiResponse): Promise<void> {
  try {
    const result = await executeListSpeedProfiles({})
    ok(res, result)
  } catch (error) {
    mapErrorToResponse(res, error)
  }
}
