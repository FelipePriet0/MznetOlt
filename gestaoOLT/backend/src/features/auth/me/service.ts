import { findUserById } from './repository'
import { MeInputSchema } from './schema'
import type { MeInput, MeOutput } from './types'

export class UserNotFoundError extends Error {
  constructor() {
    super('User not found')
    this.name = 'UserNotFoundError'
  }
}

export class InactiveUserError extends Error {
  constructor() {
    super('User is inactive')
    this.name = 'InactiveUserError'
  }
}

export async function meService(input: MeInput): Promise<MeOutput> {
  const parsed = MeInputSchema.parse(input)

  const user = await findUserById(parsed.user_id)

  if (!user) throw new UserNotFoundError()
  if (!user.is_active) throw new InactiveUserError()

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    is_active: user.is_active,
    role_id: user.role_id,
    role_name: user.roles.name,
    role_code: user.roles.code,
    created_at: user.created_at,
    updated_at: user.updated_at,
  }
}
