import type { GetOnuSignalHistoryInput, OnuSignalHistoryOutput } from './types'
import { getOnuSignalHistoryRepository } from './repository'

export async function getOnuSignalHistoryService(input: GetOnuSignalHistoryInput): Promise<OnuSignalHistoryOutput> {
  if (!input || typeof input.id !== 'number' || !Number.isFinite(input.id)) {
    throw new Error('Invalid input: id must be a number')
  }
  const limit = input.limit && input.limit > 0 ? Math.min(input.limit, 1000) : 200
  return getOnuSignalHistoryRepository(input.id, limit)
}

