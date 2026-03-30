import { getDefaultAuthorizationPresetRepository } from './repository'
import { GetDefaultAuthorizationPresetInputSchema } from './schema'
import type { GetDefaultAuthorizationPresetInput, GetDefaultAuthorizationPresetOutput } from './types'

export class DefaultAuthorizationPresetNotFoundError extends Error {
  constructor() {
    super('Default authorization preset not found')
    this.name = 'DefaultAuthorizationPresetNotFoundError'
  }
}

export async function getDefaultAuthorizationPresetService(
  input: GetDefaultAuthorizationPresetInput
): Promise<GetDefaultAuthorizationPresetOutput> {
  GetDefaultAuthorizationPresetInputSchema.parse(input)

  const preset = await getDefaultAuthorizationPresetRepository()

  if (!preset) throw new DefaultAuthorizationPresetNotFoundError()

  return { item: preset }
}

