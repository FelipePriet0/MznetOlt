import { listOnuTypesRepository } from './repository'
import type { ListOnuTypesInput, ListOnuTypesOutput } from './types'

export async function executeListOnuTypes(
  _input: ListOnuTypesInput
): Promise<ListOnuTypesOutput> {
  const items = await listOnuTypesRepository()
  return { items }
}

