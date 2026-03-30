import { listVlansRepository } from './repository'
import type { ListVlansInput, ListVlansOutput } from './types'

export async function executeListVlans(
  _input: ListVlansInput
): Promise<ListVlansOutput> {
  const items = await listVlansRepository()
  return { items }
}

