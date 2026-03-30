import { getOnuTrafficRepository } from './repository'
import type { GetOnuTrafficInput, GetOnuTrafficOutput } from './types'

export async function getOnuTrafficService(input: GetOnuTrafficInput): Promise<GetOnuTrafficOutput> {
  return getOnuTrafficRepository(input.id, input.limit ?? 60)
}
