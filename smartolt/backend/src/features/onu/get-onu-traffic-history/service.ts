import type { GetOnuTrafficHistoryInput, OnuTrafficHistoryOutput } from './types'
import { getOnuTrafficHistoryRepository } from './repository'

export async function getOnuTrafficHistoryService(input: GetOnuTrafficHistoryInput): Promise<OnuTrafficHistoryOutput> {
  if (!input || typeof input.id !== 'number' || !Number.isFinite(input.id)) {
    throw new Error('Invalid input: id must be a number')
  }
  const limit = input.limit && input.limit > 0 ? Math.min(input.limit, 1000) : 200
  return getOnuTrafficHistoryRepository(input.id, limit)
}

