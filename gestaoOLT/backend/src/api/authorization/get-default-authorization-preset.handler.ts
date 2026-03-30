import type { ApiRequest, ApiResponse } from '../_shared/types'
import { ok } from '../_shared/http'
import { mapErrorToResponse } from '../_shared/errors'
import { getDefaultAuthorizationPresetService, DefaultAuthorizationPresetNotFoundError } from '../../features/authorization/get-default-authorization-preset/service'

export async function getDefaultAuthorizationPresetHandler(req: ApiRequest, res: ApiResponse): Promise<void> {
  try {
    const result = await getDefaultAuthorizationPresetService({})
    ok(res, result)
  } catch (error) {
    if (error instanceof DefaultAuthorizationPresetNotFoundError) {
      ok(res, { item: null })
      return
    }
    mapErrorToResponse(res, error)
  }
}
