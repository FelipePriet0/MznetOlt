import type { GetOnuStatusInput, OnuStatusOutput } from './types'
import { getOnuStatusRepository } from './repository'

export async function getOnuStatusService(input: GetOnuStatusInput): Promise<OnuStatusOutput> {
  if (!input || typeof input.id !== 'number' || !Number.isFinite(input.id)) {
    throw new Error('Invalid input: id must be a number')
  }
  const item = await getOnuStatusRepository(input.id)
  if (!item) {
    const e = new Error('ONU not found')
    ;(e as any).statusCode = 404
    throw e
  }
  return item
}

