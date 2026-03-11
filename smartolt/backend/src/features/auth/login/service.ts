import { findUserByEmail } from './repository'
import { validateLoginInput } from './validator'
import type { LoginInput, LoginOutput } from './types'

export class InvalidCredentialsError extends Error {
  constructor() {
    super('Invalid credentials')
    this.name = 'InvalidCredentialsError'
  }
}

export class InactiveUserError extends Error {
  constructor() {
    super('User is inactive')
    this.name = 'InactiveUserError'
  }
}

export async function loginService(input: LoginInput): Promise<LoginOutput> {
  validateLoginInput(input)

  const user = await findUserByEmail(input.email)

  if (!user) throw new InvalidCredentialsError()
  if (!user.is_active) throw new InactiveUserError()

  return {
    user_id: user.id,
    role_id: user.role_id,
    role_code: user.roles.code,
    role_name: user.roles.name,
  }
}
