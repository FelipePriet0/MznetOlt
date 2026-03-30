import { LoginInputSchema } from './schema'
import type { LoginInput } from './types'

export function validateLoginInput(input: unknown): LoginInput {
  return LoginInputSchema.parse(input)
}
