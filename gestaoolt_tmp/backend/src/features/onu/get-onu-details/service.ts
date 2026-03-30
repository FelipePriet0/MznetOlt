import type { GetOnuDetailsInput, OnuDetailsOutput } from './types'
import { getOnuDetailsRepository } from './repository'

export async function getOnuDetailsService(input: GetOnuDetailsInput): Promise<OnuDetailsOutput> {
  if (!input || typeof input.id !== 'number' || !Number.isFinite(input.id)) {
    throw new Error('Invalid input: id must be a number')
  }

  const item = await getOnuDetailsRepository(input.id)
  if (!item) {
    const e = new Error('ONU not found')
    ;(e as any).statusCode = 404
    throw e
  }
  return item
}

