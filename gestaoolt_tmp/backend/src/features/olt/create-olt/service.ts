import { createOltRepository } from './repository'
import { CreateOltInputSchema } from './schema'
import { validateCreateOlt } from './validator'
import type { CreateOltInput, CreateOltOutput } from './types'

export async function createOltService(input: CreateOltInput): Promise<CreateOltOutput> {
  const parsed = CreateOltInputSchema.parse(input)

  await validateCreateOlt(parsed)

  return createOltRepository(parsed)
}
