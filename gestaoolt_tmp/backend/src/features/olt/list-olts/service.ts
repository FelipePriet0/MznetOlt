import { listOltsRepository } from './repository'
import { ListOltsInputSchema } from './schema'
import type { ListOltsInput, ListOltsOutput } from './types'

export async function listOltsService(input: ListOltsInput): Promise<ListOltsOutput> {
  const parsed = ListOltsInputSchema.parse(input)

  const { data, total } = await listOltsRepository({
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
