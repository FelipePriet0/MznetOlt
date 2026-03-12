import type { ResyncOnuInput, ResyncOnuOutput } from './types'
import { resyncOnuRepository } from './repository'

export async function resyncOnuService(input: ResyncOnuInput): Promise<ResyncOnuOutput> {
  if (!input || typeof input.id !== 'number' || !Number.isFinite(input.id)) {
    throw new Error('Invalid input: id must be a number')
  }
  return resyncOnuRepository(input.id)
}

