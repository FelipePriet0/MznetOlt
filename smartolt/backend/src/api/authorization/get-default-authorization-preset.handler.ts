import type { ApiRequest, ApiResponse } from '../_shared/types'
import { ok } from '../_shared/http'
import { mapErrorToResponse } from '../_shared/errors'
import { getDefaultAuthorizationPresetService } from '../../features/authorization/get-default-authorization-preset/service'

export async function getDefaultAuthorizationPresetHandler(req: ApiRequest, res: ApiResponse): Promise<void> {
  try {
    const result = await getDefaultAuthorizationPresetService({})
    ok(res, result)
  } catch (error) {
    mapErrorToResponse(res, error)
  }
}
