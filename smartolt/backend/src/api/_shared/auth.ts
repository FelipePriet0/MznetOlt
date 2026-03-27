import { createHmac, timingSafeEqual } from 'node:crypto'
import { env } from '../../config/env'
import type { ApiRequest, AuthenticatedUser } from './types'

const HEADER = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  .toString('base64url')

function sign(payload: object): string {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const sig = createHmac('sha256', env.JWT_SECRET)
    .update(`${HEADER}.${body}`)
    .digest('base64url')
  return `${HEADER}.${body}.${sig}`
}

function verify(token: string): AuthenticatedUser | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const [header, body, sig] = parts
    const expected = createHmac('sha256', env.JWT_SECRET)
      .update(`${header}.${body}`)
      .digest('base64url')
    const sigBuf = Buffer.from(sig)
    const expectedBuf = Buffer.from(expected)
    if (sigBuf.length !== expectedBuf.length) return null
    if (!timingSafeEqual(sigBuf, expectedBuf)) return null
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString())
    if (!payload.user_id || !payload.role_id || !payload.role_code) return null
    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) return null
    return {
      user_id: payload.user_id,
      role_id: payload.role_id,
      role_code: payload.role_code,
    }
  } catch {
    return null
  }
}

const TOKEN_TTL_SECONDS = 24 * 60 * 60 // 24 h

export function createToken(user: AuthenticatedUser): string {
  const now = Math.floor(Date.now() / 1000)
  return sign({
    user_id: user.user_id,
    role_id: user.role_id,
    role_code: user.role_code,
    iat: now,
    exp: now + TOKEN_TTL_SECONDS,
  })
}

export function extractUser(req: ApiRequest): AuthenticatedUser | null {
  const authHeader = req.headers['authorization']
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null
  const token = authHeader.slice(7)
  return verify(token)
}
