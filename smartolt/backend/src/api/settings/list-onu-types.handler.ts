import type { ApiRequest, ApiResponse } from '../_shared/types'
import { ok } from '../_shared/http'
import { mapErrorToResponse } from '../_shared/errors'
import { executeListOnuTypes } from '../../features/settings/list-onu-types/service'

export async function listOnuTypesHandler(req: ApiRequest, res: ApiResponse): Promise<void> {
  try {
    const result = await executeListOnuTypes({})
    ok(res, result)
  } catch (error) {
    mapErrorToResponse(res, error)
  }
}
