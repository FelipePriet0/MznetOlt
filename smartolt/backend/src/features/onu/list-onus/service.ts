import { listOnusRepository } from './repository'
import { ListOnusInputSchema } from './schema'
import type { ListOnusInput, ListOnusOutput } from './types'

export async function listOnusService(input: ListOnusInput): Promise<ListOnusOutput> {
  const parsed = ListOnusInputSchema.parse(input)

  const { data, total } = await listOnusRepository({
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
