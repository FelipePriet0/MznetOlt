import { listUsersRepository } from './repository'
import { ListUsersInputSchema } from './schema'
import type { ListUsersInput, ListUsersOutput } from './types'

export async function listUsersService(input: ListUsersInput): Promise<ListUsersOutput> {
  const parsed = ListUsersInputSchema.parse(input)

  const { data, total } = await listUsersRepository({
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
