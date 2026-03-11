import { listOdbsRepository } from './repository'
import type { ListOdbsInput, ListOdbsOutput } from './types'

export async function executeListOdbs(
  _input: ListOdbsInput
): Promise<ListOdbsOutput> {
  const items = await listOdbsRepository()
  return { items }
}

