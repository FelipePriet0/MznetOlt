import { listUnconfiguredOnusRepository } from './repository'
import { ListUnconfiguredOnusInputSchema } from './schema'
import type { ListUnconfiguredOnusInput, ListUnconfiguredOnusOutput } from './types'

export async function listUnconfiguredOnusService(
  input: ListUnconfiguredOnusInput
): Promise<ListUnconfiguredOnusOutput> {
  const parsed = ListUnconfiguredOnusInputSchema.parse(input)

  async function run(page_size: number) {
    const { data, total } = await listUnconfiguredOnusRepository({
      ...parsed,
      page: parsed.page,
      page_size,
    })
    return { data, total, page_size }
  }

  let result
  try {
    result = await run(parsed.page_size)
  } catch (err) {
    // Fallback: se a consulta falhar com page_size alto, tente com 500
    if (parsed.page_size && parsed.page_size > 500) {
      result = await run(500)
    } else {
      throw err
    }
  }

  return {
    items: result.data,
    total: result.total,
    page: parsed.page,
    page_size: result.page_size,
  }
}

