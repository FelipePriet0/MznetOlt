import { z } from 'zod'
import { getSignalHistoryRepository } from './repository'
import type { GetSignalHistoryInput, GetSignalHistoryOutput } from './types'

const InputSchema = z.object({
  onu_id: z.number().int().positive(),
  limit: z.number().int().min(1).max(1000).default(200).optional(),
  period: z.enum(['day','week','month','year']).optional(),
})

export async function getSignalHistoryService(input: GetSignalHistoryInput): Promise<GetSignalHistoryOutput> {
  const parsed = InputSchema.parse(input)

  let sinceIso: string | null = null
  if (parsed.period) {
    const now = Date.now()
    const days = parsed.period === 'day' ? 1 : parsed.period === 'week' ? 7 : parsed.period === 'month' ? 30 : 365
    sinceIso = new Date(now - days * 24 * 60 * 60 * 1000).toISOString()
  }

  const items = await getSignalHistoryRepository({
    onu_id: parsed.onu_id,
    limit: parsed.limit ?? 200,
    sinceIso,
  })
  return { items }
}
