import type { GetOnuEventsInput, GetOnuEventsOutput } from './types'
import { getOnuEventsRepository } from './repository'

export async function getOnuEventsService(input: GetOnuEventsInput): Promise<GetOnuEventsOutput> {
  const items = await getOnuEventsRepository(input.onu_id, input.limit)
  return { items }
}
