import { listUnconfiguredOnusRepository } from './repository'
import { ListUnconfiguredOnusInputSchema } from './schema'
import type { ListUnconfiguredOnusInput, ListUnconfiguredOnusOutput } from './types'

export async function listUnconfiguredOnusService(
  input: ListUnconfiguredOnusInput
): Promise<ListUnconfiguredOnusOutput> {
  const parsed = ListUnconfiguredOnusInputSchema.parse(input)

  const { data, total } = await listUnconfiguredOnusRepository({
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
