import type { ListNetworkEventsInput, ListNetworkEventsOutput } from './types'
import { listNetworkEventsRepository } from './repository'

export async function listNetworkEventsService(input: ListNetworkEventsInput): Promise<ListNetworkEventsOutput> {
  const events = await listNetworkEventsRepository(input)
  return { events }
}

