import { listAuthorizationsRepository } from './repository'
import type { ListAuthorizationsInput, ListAuthorizationsOutput } from './types'

export async function executeListAuthorizations(
  _input: ListAuthorizationsInput
): Promise<ListAuthorizationsOutput> {
  const items = await listAuthorizationsRepository()
  return { items }
}

