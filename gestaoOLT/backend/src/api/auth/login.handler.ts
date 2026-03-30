import type { ApiRequest, ApiResponse } from '../_shared/types'
import { ok, badRequest } from '../_shared/http'
import { mapErrorToResponse } from '../_shared/errors'
import { createToken } from '../_shared/auth'
import { loginService } from '../../features/auth/login/service'

export async function loginHandler(req: ApiRequest, res: ApiResponse): Promise<void> {
  const body = req.body as Record<string, unknown>
  const email = typeof body?.email === 'string' ? body.email.trim() : null
  const password = typeof body?.password === 'string' ? body.password : null

  if (!email || !password) {
    badRequest(res, 'email and password are required')
    return
  }

  try {
    const result = await loginService({ email, password })
    const token = createToken({
      user_id: result.user_id,
      role_id: result.role_id,
      role_code: result.role_code,
    })
    ok(res, { token, user: result })
  } catch (error) {
    mapErrorToResponse(res, error)
  }
}
