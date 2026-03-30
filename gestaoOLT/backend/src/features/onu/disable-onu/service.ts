import type { DisableOnuInput, DisableOnuOutput } from './types'
import { disableOnuRepository } from './repository'

export async function disableOnuService(input: DisableOnuInput): Promise<DisableOnuOutput> {
  if (!input || typeof input.id !== 'number' || !Number.isFinite(input.id)) {
    throw new Error('Invalid input: id must be a number')
  }
  return disableOnuRepository(input.id)
}

