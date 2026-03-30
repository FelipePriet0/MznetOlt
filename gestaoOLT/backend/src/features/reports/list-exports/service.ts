import { listExportsRepository } from './repository'
import type { ListExportsInput, ListExportsOutput } from './types'

export async function executeListExports(
  _input: ListExportsInput
): Promise<ListExportsOutput> {
  const items = await listExportsRepository()
  return { items }
}

