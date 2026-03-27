import type { ApiRequest, ApiResponse } from '../_shared/types'
import { ok, unauthorized } from '../_shared/http'
import { mapErrorToResponse } from '../_shared/errors'
import { meService } from '../../features/auth/me/service'

export async function meHandler(req: ApiRequest, res: ApiResponse): Promise<void> {
  try {
    if (!req.user) {
      // Mesmo com ALLOW_UNAUTHENTICATED_MUTATIONS, /me deve exigir token
      unauthorized(res, 'Missing or invalid token')
      return
    }
    const result = await meService({ user_id: req.user.user_id })
    ok(res, result)
  } catch (error) {
    mapErrorToResponse(res, error)
  }
}
