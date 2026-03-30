import { listAuthorizationPresetsRepository } from './repository'
import { ListAuthorizationPresetsInputSchema } from './schema'
import type { ListAuthorizationPresetsInput, ListAuthorizationPresetsOutput } from './types'

export async function listAuthorizationPresetsService(
  input: ListAuthorizationPresetsInput
): Promise<ListAuthorizationPresetsOutput> {
  const parsed = ListAuthorizationPresetsInputSchema.parse(input)

  const { data, total } = await listAuthorizationPresetsRepository({
    ...parsed,
    page: parsed.page,
    page_size: parsed.page_size,
  })

  return {
    items: data,
    total,
    page: parsed.page,
    page_size: parsed.page_size,
  }
}

