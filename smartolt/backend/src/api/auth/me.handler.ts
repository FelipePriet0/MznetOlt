import type { ApiRequest, ApiResponse } from '../_shared/types'
import { ok } from '../_shared/http'
import { mapErrorToResponse } from '../_shared/errors'
import { meService } from '../../features/auth/me/service'

export async function meHandler(req: ApiRequest, res: ApiResponse): Promise<void> {
  try {
    const result = await meService({ user_id: req.user!.user_id })
    ok(res, result)
  } catch (error) {
    mapErrorToResponse(res, error)
  }
}
